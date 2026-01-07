import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaCheck, FaTimes, FaCalendarAlt, FaUserClock, FaRegChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Attendance = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Admin/Teacher State
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null); // { className, section }
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

    // Student State
    const [myAttendance, setMyAttendance] = useState([]);

    // Get Unique Classes Logic
    const [uniqueClasses, setUniqueClasses] = useState([]);

    useEffect(() => {
        if (!user) return;

        if (user.role === 'STUDENT') {
            fetch(`${API_BASE_URL}/api/attendance/student/${user.id}`)
                .then(res => res.json())
                .then(data => setMyAttendance(data.reverse()))
                .catch(err => console.error("Error fetching my attendance", err));
        } else {
            fetch(`${API_BASE_URL}/api/students`)
                .then(res => res.json())
                .then(data => {
                    setStudents(data);
                    const classMap = new Set();
                    const classes = [];
                    data.forEach(s => {
                        const key = `${s.className}-${s.section}`;
                        if (!classMap.has(key)) {
                            classMap.add(key);
                            classes.push({ className: s.className, section: s.section });
                        }
                    });
                    setUniqueClasses(classes.sort((a, b) => a.className.localeCompare(b.className)));

                    // Auto-select for Class Teacher
                    if (user.role === 'TEACHER' && user.className) {
                        // Find matching class/section if possible, or just use user's data
                        // Assuming teacher is assigned to one class (and section optional or specific)
                        // If section is null on teacher, maybe select all? 
                        // For simplicity, let's assume strict match or default 'A' if missing in data but present in UI
                        // But actually, the state object is just { className, section }
                        setSelectedClass({ className: user.className, section: user.section || 'A' });
                    }
                })
                .catch(err => console.error("Error fetching students", err));
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass && selectedDate && (user.role === 'ADMIN' || user.role === 'TEACHER')) {
            const classStudents = students.filter(s => s.className === selectedClass.className && s.section === selectedClass.section);

            fetch(`${API_BASE_URL}/api/attendance/${selectedDate}`)
                .then(res => res.json())
                .then(attendanceData => {
                    const merged = classStudents.map(s => {
                        const record = attendanceData.find(a => a.student.id === s.id);
                        return {
                            ...s,
                            status: record ? (record.status === 'PRESENT' ? 'Present' : 'Absent') : 'Present',
                            recordId: record ? record.id : null,
                            profilePhoto: s.profilePhoto
                        };
                    });
                    setFilteredStudents(merged);
                })
                .catch(err => console.error("Error fetching daily attendance", err));
        }
    }, [selectedClass, selectedDate, students, user]);

    // Update stats whenever filteredStudents changes
    useEffect(() => {
        const total = filteredStudents.length;
        const present = filteredStudents.filter(s => s.status === 'Present').length;
        const absent = total - present;
        setStats({ total, present, absent });
    }, [filteredStudents]);

    const toggleAttendance = (id) => {
        setFilteredStudents(prev => prev.map(s =>
            s.id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s
        ));
    };

    const saveAttendance = async () => {
        try {
            await Promise.all(filteredStudents.map(student =>
                fetch(`${API_BASE_URL}/api/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student: { id: student.id },
                        date: selectedDate,
                        status: student.status.toUpperCase()
                    })
                })
            ));
            alert('Attendance Saved Successfully!');
        } catch (error) {
            console.error('Error saving', error);
            alert('Failed to save.');
        }
    };

    // --- RENDER ---

    if (user && user.role === 'STUDENT') {
        return (
            <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
                <div className="header" style={{ alignItems: 'center', marginBottom: '30px' }}>
                    <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <FaArrowLeft color="var(--primary)" />
                    </div>
                    <h1 style={{ marginLeft: '15px', color: 'var(--primary)', fontSize: '24px' }}>My Attendance</h1>
                </div>

                <div className="glass-card" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                    {myAttendance.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No attendance records found.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {myAttendance.map((rec, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '15px', borderRadius: '12px',
                                    background: rec.status === 'PRESENT' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                                    border: `1px solid ${rec.status === 'PRESENT' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: rec.status === 'PRESENT' ? '#2e7d32' : '#c62828',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                        }}>
                                            {rec.status === 'PRESENT' ? <FaCheck /> : <FaTimes />}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px' }}>{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 'bold', color: rec.status === 'PRESENT' ? '#2e7d32' : '#c62828' }}>
                                        {rec.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Admin/Teacher View
    return (
        <div style={{ padding: '20px 20px 100px 20px' }}>
            <div className="header" style={{ alignItems: 'center', marginBottom: '30px' }}>
                <div onClick={() => {
                    if (user.role === 'TEACHER') navigate('/'); // Teachers go Home
                    else selectedClass ? setSelectedClass(null) : navigate('/'); // Admins go back to selection
                }} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <FaArrowLeft color="var(--primary)" />
                </div>
                <div style={{ marginLeft: '15px' }}>
                    <h1 style={{ color: 'var(--primary)', fontSize: '24px', margin: 0 }}>Attendance</h1>
                    {selectedClass && <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Class {selectedClass.className} - {selectedClass.section}</p>}
                </div>
            </div>

            {!selectedClass ? (
                /* Class Selection */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                    {uniqueClasses.map((cls, idx) => (
                        <div key={idx}
                            onClick={() => setSelectedClass(cls)}
                            className="glass-card"
                            style={{
                                padding: '25px', cursor: 'pointer', textAlign: 'center',
                                transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                minHeight: '160px',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ width: '60px', height: '60px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                <FaUserClock />
                            </div>
                            <h2 style={{ fontSize: '18px', color: 'var(--primary)', margin: 0 }}>Class {cls.className}</h2>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '5px' }}>{cls.section}</span>
                        </div>
                    ))}
                    {uniqueClasses.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-muted)' }}>No classes found. Add students first.</p>}
                </div>
            ) : (
                /* Attendance Sheet */
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    {/* Controls & Stats Card */}
                    <div className="glass-card" style={{ padding: '20px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaCalendarAlt color="var(--primary)" size={20} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="glass-input"
                                style={{ flex: 1, margin: 0, padding: '10px' }}
                            />
                        </div>

                        {/* Stats Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>Total</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{stats.total}</span>
                            </div>
                            <div style={{ width: '1px', background: '#ccc' }}></div>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '12px', color: '#2e7d32' }}>Present</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>{stats.present}</span>
                            </div>
                            <div style={{ width: '1px', background: '#ccc' }}></div>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '12px', color: '#c62828' }}>Absent</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#c62828' }}>{stats.absent}</span>
                            </div>
                        </div>
                    </div>

                    <div className="student-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {filteredStudents.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>No students found in this class.</p> : filteredStudents.map(student => (
                            <div key={student.id} className="glass-card" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                        {student.profilePhoto ? (
                                            <img src={`${API_BASE_URL}${student.profilePhoto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--text-main)' }}>{student.name}</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Roll: {student.rollNo || '-'} | Adm: {student.admissionNo}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleAttendance(student.id)}
                                    style={{
                                        border: 'none',
                                        background: student.status === 'Present' ? '#e8f5e9' : '#ffebee',
                                        color: student.status === 'Present' ? '#2e7d32' : '#c62828',
                                        padding: '8px 20px',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        minWidth: '110px',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {student.status === 'Present' ? <><FaCheck /> Present</> : <><FaTimes /> Absent</>}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '30px', marginBottom: '50px' }}>
                        <button className="glass-btn btn-primary" onClick={saveAttendance} style={{ width: '100%', padding: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <FaCheck /> Save Attendance
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
