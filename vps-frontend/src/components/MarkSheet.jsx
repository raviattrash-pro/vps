import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const MarkSheet = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [marksheetData, setMarksheetData] = useState({
        examType: 'Annual',
        subjects: [{ subjectName: '', marksObtained: 0, maxMarks: 100 }]
    });
    const [editingMarksheetId, setEditingMarksheetId] = useState(null);

    const [savedMarksheets, setSavedMarksheets] = useState([]);

    const isAdminOrTeacher = user && (user.role === 'ADMIN' || user.role === 'TEACHER');

    useEffect(() => {
        if (isAdminOrTeacher) {
            fetchStudents();
        } else if (user && user.role === 'STUDENT') {
            // If student, just fetch their own marksheets
            fetchStudentMarksheets(user.id);
        }
    }, [user]);

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/students`);
            const data = await res.json();
            setStudents(data);

            if (user.role === 'TEACHER' && user.className) {
                // Lock to assigned class & section
                const assignedClass = user.className;
                const assignedSection = user.section;

                setClasses([assignedClass]);
                setSelectedClass(assignedClass);

                // Filter students immediately for this class AND section
                if (assignedSection) {
                    setFilteredStudents(data.filter(s => s.className === assignedClass && s.section === assignedSection));
                } else {
                    setFilteredStudents(data.filter(s => s.className === assignedClass));
                }
            } else {
                const uniqueClasses = [...new Set(data.map(s => s.className))].sort();
                setClasses(uniqueClasses);
            }
        } catch (e) { console.error(e); }
    };

    const handleClassSelect = (cls) => {
        setSelectedClass(cls);
        setFilteredStudents(students.filter(s => s.className === cls));
        setSelectedStudent(null);
    };

    const fetchStudentMarksheets = async (studentId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/marksheets?studentId=${studentId}`);
            if (!res.ok) {
                console.error("Failed to fetch marksheets");
                setSavedMarksheets([]);
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setSavedMarksheets(data);
            } else {
                setSavedMarksheets([]);
            }
        } catch (e) {
            console.error(e);
            setSavedMarksheets([]);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        fetchStudentMarksheets(student.id);
        // Reset form
        setMarksheetData({
            examType: 'Annual',
            subjects: [{ subjectName: '', marksObtained: 0, maxMarks: 100 }]
        });
        setEditingMarksheetId(null);
    };

    const handleEdit = (ms) => {
        setMarksheetData({
            examType: ms.examType,
            subjects: ms.subjects.map(s => ({ ...s })) // Deep copy to avoid mutating state directly
        });
        setEditingMarksheetId(ms.id);
        // Scroll to form (if using ref would be better, but window scroll is quick fix)
        // window.scrollTo(0, document.body.scrollHeight); 
        // Actually the form is at the bottom, so scrolling down is good.
        setTimeout(() => {
            const formElement = document.getElementById('marksheet-form');
            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Form Logic
    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...marksheetData.subjects];
        newSubjects[index][field] = value;
        setMarksheetData({ ...marksheetData, subjects: newSubjects });
    };

    const addSubject = () => {
        setMarksheetData({
            ...marksheetData,
            subjects: [...marksheetData.subjects, { subjectName: '', marksObtained: 0, maxMarks: 100 }]
        });
    };

    const removeSubject = (index) => {
        const newSubjects = marksheetData.subjects.filter((_, i) => i !== index);
        setMarksheetData({ ...marksheetData, subjects: newSubjects });
    };

    // Calculations
    const totalObtained = marksheetData.subjects.reduce((sum, sub) => sum + Number(sub.marksObtained), 0);
    const totalMax = marksheetData.subjects.reduce((sum, sub) => sum + Number(sub.maxMarks), 0);
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

    const getGrade = (pct) => {
        if (pct >= 90) return 'A+';
        if (pct >= 80) return 'A';
        if (pct >= 70) return 'B';
        if (pct >= 60) return 'C';
        if (pct >= 50) return 'D';
        return 'F';
    };

    const handleSubmit = async () => {
        if (!selectedStudent) return;
        try {
            const url = editingMarksheetId
                ? `${API_BASE_URL}/api/marksheets/${editingMarksheetId}`
                : `${API_BASE_URL}/api/marksheets`;

            const method = editingMarksheetId ? 'PUT' : 'POST';

            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student: { id: selectedStudent.id },
                    examType: marksheetData.examType,
                    subjects: marksheetData.subjects
                })
            });

            alert(editingMarksheetId ? 'Marksheet Updated!' : 'Marksheet Saved!');
            fetchStudentMarksheets(selectedStudent.id);
            // Reset
            setMarksheetData({
                examType: 'Annual',
                subjects: [{ subjectName: '', marksObtained: 0, maxMarks: 100 }]
            });
            setEditingMarksheetId(null);
        } catch (e) { alert("Error saving"); }
    };

    const deleteMarksheet = async (id, e) => {
        console.log("Inside deleteMarksheet function for ID:", id);
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        // Removed confirm for debugging
        // if (window.confirm("Delete this marksheet?")) {
        console.log("Proceeding with delete for ID:", id);

        console.log("Attempting to delete marksheet ID:", id);
        try {
            // Optimistic update FIRST: Remove from UI immediately to feel responsive
            setSavedMarksheets(prev => prev.filter(m => m.id !== id));

            const res = await fetch(`${API_BASE_URL}/api/marksheets/${id}`, { method: 'DELETE' });
            console.log("Delete response status:", res.status);

            if (res.ok) {
                console.log("Marksheet deleted on server.");
            } else {
                const errorText = await res.text();
                console.error("Server error:", errorText);
                alert(`Failed to delete! Server Status: ${res.status}\nReason: ${errorText}`);
                if (selectedStudent) fetchStudentMarksheets(selectedStudent.id); // Revert UI
            }
        } catch (e) {
            console.error("Delete error:", e);
            alert("Error deleting marksheet: " + e.message);
            if (selectedStudent) fetchStudentMarksheets(selectedStudent.id); // Refetch to restore
        }
        // }
    }

    // View Components
    return (
        <div className="page-container" style={{ padding: '0 20px 100px 20px' }}>
            <div className="header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div onClick={() => {
                        if (selectedStudent && isAdminOrTeacher) setSelectedStudent(null);
                        else if (selectedClass && isAdminOrTeacher && user.role !== 'TEACHER') setSelectedClass('');
                        else navigate('/');
                    }} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <FaArrowLeft color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Mark Sheet</h1>
                </div>
            </div>

            {/* CLASS SELECTION (Admin/Teacher) */}
            {isAdminOrTeacher && !selectedClass && (
                <div>
                    <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>Select Class</h3>
                    <div className="grid-menu" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
                        {classes.map(cls => (
                            <div key={cls} className="glass-card" onClick={() => handleClassSelect(cls)} style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                                <h2 style={{ color: 'var(--primary)' }}>Class {cls}</h2>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STUDENT LIST (Admin/Teacher) */}
            {isAdminOrTeacher && selectedClass && !selectedStudent && (
                <div>
                    <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>Students in Class {selectedClass}</h3>
                    <div className="student-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', padding: 0 }}>
                        {filteredStudents.map(student => (
                            <div key={student.id} className="glass-card" onClick={() => handleStudentClick(student)} style={{ cursor: 'pointer', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px' }}>{student.name}</h3>
                                    <p style={{ fontSize: '12px', color: '#666' }}>Roll: {student.admissionNo}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MARKSHEET VIEW/CREATE */}
            {(selectedStudent || (!isAdminOrTeacher && user)) && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div className="glass-card" style={{ padding: '5px', borderRadius: '50%' }}>
                            {(selectedStudent?.profilePhoto || (!isAdminOrTeacher && user?.profilePhoto)) ? (
                                <img
                                    src={`${(selectedStudent ? selectedStudent.profilePhoto : user.profilePhoto)?.startsWith('http') ? (selectedStudent ? selectedStudent.profilePhoto : user.profilePhoto) : `${API_BASE_URL}${selectedStudent ? selectedStudent.profilePhoto : user.profilePhoto}`}`}
                                    alt="Profile"
                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                />
                            ) : (
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eee' }}></div>
                            )}
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Marksheet for</h3>
                            <h2 style={{ margin: 0, color: 'var(--primary)' }}>{selectedStudent ? selectedStudent.name : user.name}</h2>
                        </div>
                    </div>

                    {/* EXISTING MARKSHEETS LIST */}
                    <div style={{ marginBottom: '40px' }}>
                        {savedMarksheets.map(ms => (
                            <div key={ms.id} className="glass-card" style={{ padding: '20px', marginBottom: '20px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h4 style={{ fontSize: '18px', color: 'var(--primary)' }}>{ms.examType}</h4>
                                        <p style={{ fontSize: '12px', color: '#666' }}>{ms.date}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: ms.percentage >= 50 ? 'var(--accent)' : 'red' }}>{ms.grade}</span>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{ms.percentage}%</div>
                                    </div>
                                </div>

                                {/* Simple Table Preview */}
                                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {ms.subjects.map((s, i) => (
                                            <span key={i} style={{ fontSize: '13px', background: 'var(--primary-light)', color: 'white', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                {s.subjectName}: <b>{s.marksObtained}</b>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginTop: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                    Total Score: <b>{ms.totalObtained}</b> / {ms.totalMax}
                                </div>

                                {isAdminOrTeacher && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px' }}>
                                        <button onClick={() => handleEdit(ms)} className="glass-btn" style={{ padding: '8px 20px', fontSize: '14px', background: 'white', color: 'var(--primary)', flex: 1, textAlign: 'center' }}>Edit</button>
                                        <button onClick={(e) => {
                                            console.log("Delete button clicked for ID:", ms.id);
                                            deleteMarksheet(ms.id, e);
                                        }} className="glass-btn" style={{ padding: '8px 20px', fontSize: '14px', background: '#ffebee', color: '#d32f2f', boxShadow: 'none', flex: 1, textAlign: 'center' }}>
                                            DELETE
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {savedMarksheets.length === 0 && <p style={{ color: '#888', textAlign: 'center', fontStyle: 'italic' }}>No marksheets found history.</p>}
                    </div>

                    {/* CREATE NEW FORM (Admin/Teacher Only) */}
                    {isAdminOrTeacher && (
                        <div id="marksheet-form" className="glass-card" style={{ padding: '25px', border: '1px solid white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: 'var(--primary)' }}>{editingMarksheetId ? 'Edit Marksheet' : 'Create New Results'}</h3>
                                {editingMarksheetId && <button onClick={() => { setEditingMarksheetId(null); setMarksheetData({ examType: 'Annual', subjects: [{ subjectName: '', marksObtained: 0, maxMarks: 100 }] }); }} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', marginBottom: '5px', display: 'block' }}>Exam Name</label>
                                <input
                                    className="glass-input"
                                    placeholder="e.g. Annual Examination 2026"
                                    value={marksheetData.examType}
                                    onChange={e => setMarksheetData({ ...marksheetData, examType: e.target.value })}
                                />
                            </div>

                            <h4 style={{ marginBottom: '10px' }}>Subjects & Scores</h4>
                            {marksheetData.subjects.map((sub, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                    <input
                                        className="glass-input"
                                        placeholder="Subject"
                                        value={sub.subjectName}
                                        onChange={e => handleSubjectChange(idx, 'subjectName', e.target.value)}
                                        style={{ flex: 2 }}
                                    />
                                    <input
                                        className="glass-input"
                                        placeholder="Obt"
                                        type="number"
                                        value={sub.marksObtained}
                                        onChange={e => handleSubjectChange(idx, 'marksObtained', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        className="glass-input"
                                        placeholder="Max"
                                        type="number"
                                        value={sub.maxMarks}
                                        onChange={e => handleSubjectChange(idx, 'maxMarks', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button onClick={() => removeSubject(idx)} style={{ background: '#ffebee', border: 'none', color: 'red', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}>X</button>
                                </div>
                            ))}

                            <button onClick={addSubject} style={{ background: 'transparent', color: 'var(--primary)', border: '2px dashed var(--primary-light)', padding: '10px', borderRadius: '12px', cursor: 'pointer', width: '100%', marginBottom: '25px', fontWeight: '600' }}>
                                + Add Another Subject
                            </button>

                            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Score</p>
                                    <h3 style={{ fontSize: '20px', color: 'var(--text-main)' }}>{totalObtained} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {totalMax}</span></h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Grade</p>
                                    <h3 style={{ fontSize: '24px', color: 'var(--primary)' }}>{getGrade(percentage)} <span style={{ fontSize: '14px' }}>({percentage}%)</span></h3>
                                </div>
                            </div>

                            <button className="glass-btn" style={{ width: '100%' }} onClick={handleSubmit}>
                                {editingMarksheetId ? 'Update Result' : 'Publish Result'}
                            </button>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default MarkSheet;
