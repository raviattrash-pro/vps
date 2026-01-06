import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const CreateContent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        class: '',
        section: '',
        uploadDate: new Date().toISOString().split('T')[0],
        description: '',
        fileName: ''
    });
    const [assignments, setAssignments] = useState([]);

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/api/homework`).then(res => res.json()).then(setAssignments);
    }, []);

    const canEdit = user && (user.role === 'ADMIN' || user.role === 'TEACHER');


    return (
        <div className="create-content-page" style={{ padding: '0 20px 100px 20px' }}>
            <div className="header" style={{ padding: '0 0 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <FaArrowLeft color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Create Content</h1>
                </div>
            </div>

            {canEdit ? (
                <div className="glass-card" style={{ padding: '25px', maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>New Assignment</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px' }}>Title</label>
                            <input type="text" placeholder="e.g. Science Project" className="glass-input"
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px' }}>Class</label>
                            <input type="text" placeholder="e.g. 10" className="glass-input"
                                value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px' }}>Section</label>
                            <input type="text" placeholder="e.g. A" className="glass-input"
                                value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} />
                        </div>
                    </div>

                    <div className="glass-input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span>Due Date: {formData.uploadDate}</span>
                        <FaTimes color="#aaa" />
                    </div>

                    <div className="upload-box" onClick={() => document.getElementById('fileInput').click()} style={{ background: 'rgba(255,255,255,0.5)', border: '2px dashed var(--primary-light)', padding: '30px' }}>
                        <FaCloudUploadAlt size={40} color="var(--primary)" />
                        <p style={{ marginTop: '10px', color: 'var(--text-main)', fontWeight: '500' }}>{formData.fileName || 'Click to Upload Document'}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PDF, DOCX, JPG supported</p>
                        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setFormData({ ...formData, fileName: file.name, fileObj: file });
                        }} />
                    </div>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px' }}>Description</h3>
                    <div style={{ border: '1px solid rgba(255,255,255,0.6)', borderRadius: '12px', background: 'rgba(255,255,255,0.5)', padding: '15px' }}>
                        <textarea
                            placeholder="Enter detailed description..."
                            style={{ width: '100%', border: 'none', outline: 'none', resize: 'vertical', height: '100px', background: 'transparent', fontSize: '14px', fontFamily: 'inherit' }}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <button className="glass-btn" style={{ width: '100%', marginTop: '20px' }} onClick={async () => {
                        try {
                            const data = new FormData();
                            data.append('title', formData.title);
                            data.append('description', formData.description);
                            data.append('dueDate', formData.uploadDate);
                            if (formData.fileObj) {
                                data.append('file', formData.fileObj);
                            }

                            const response = await fetch(`${API_BASE_URL}/api/homework`, {
                                method: 'POST',
                                body: data
                            });

                            if (response.ok) {
                                alert('Assignment Created & Notification Sent!');
                                fetch(`${API_BASE_URL}/api/homework`).then(res => res.json()).then(setAssignments);
                                setFormData({ ...formData, title: '', description: '', fileName: '', fileObj: null });
                            }
                            else alert('Failed to create assignment');
                        } catch (e) { console.error(e); alert('Error creating assignment'); }
                    }}>Create Assignment</button>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '30px', color: '#d32f2f', textAlign: 'center' }}>
                    <h3>Access Restricted</h3>
                    <p>Only Teachers and Admins can manage content.</p>
                </div>
            )}

            <div style={{ marginTop: '40px', maxWidth: '800px', margin: '40px auto 0 auto' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Recent Assignments</h3>
                {assignments.map(a => (
                    <div key={a.id} className="glass-card" style={{
                        padding: '15px 20px',
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{ fontSize: '18px', color: 'var(--text-main)' }}>{a.title}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{a.description}</p>
                            {a.fileName && <span style={{ color: 'var(--primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}><FaCloudUploadAlt /> {a.fileName}</span>}
                        </div>
                        {canEdit && (
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation(); // Prevent bubbling
                                    console.log("DEBUG: Delete clicked for ID:", a.id);

                                    // TEMPORARY: Removed confirm dialog to debug if it's blocking
                                    // if (window.confirm('Delete this assignment?')) {
                                    console.log("DEBUG: Sending DELETE request...");
                                    try {
                                        const res = await fetch(`${API_BASE_URL}/api/homework/${a.id}`, {
                                            method: 'DELETE',
                                            headers: { 'Content-Type': 'application/json' }
                                        });

                                        console.log("DEBUG: Response status:", res.status);

                                        if (res.ok) {
                                            console.log("DEBUG: Deletion successful");
                                            alert("Deletion Successful!");
                                            setAssignments(assignments.filter(item => item.id !== a.id));
                                        } else {
                                            const errText = await res.text();
                                            console.error("DEBUG: Delete failed response:", errText);
                                            alert(`Failed to delete: ${res.status} - ${errText}`);
                                        }
                                    } catch (e) {
                                        console.error("DEBUG: Network/Fetch exception:", e);
                                        alert('Network error while deleting. Check console.');
                                    }
                                    // }
                                }}
                                style={{ background: '#ffcdd2', border: 'none', color: '#c62828', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreateContent;
