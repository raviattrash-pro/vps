import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaFilePdf, FaTrash, FaCloudUploadAlt, FaSearch, FaDownload, FaFileAlt, FaTimes, FaBook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Syllabus = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [syllabusList, setSyllabusList] = useState([]);
    const [showUpload, setShowUpload] = useState(false);

    const [newItem, setNewItem] = useState({ subject: '', className: '', section: '' });
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const canEdit = user && (user.role === 'ADMIN' || user.role === 'TEACHER');

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = () => {
        let url = `${API_BASE_URL}/api/syllabus`;
        if (user && user.role === 'STUDENT') {
            url += `?studentId=${user.id}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(data => setSyllabusList(data.reverse()))
            .catch(e => console.error(e));
    };

    const handleSave = async () => {
        if (!file || !newItem.subject) {
            alert('Subject and File are required');
            return;
        }

        const formData = new FormData();
        formData.append('subject', newItem.subject);
        formData.append('className', newItem.className);

        formData.append('section', newItem.section);
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/syllabus`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert('Syllabus Uploaded Successfully!');
                setShowUpload(false);
                setNewItem({ subject: '', className: '', section: '' });
                setFile(null);
                fetchSyllabus();
            } else {
                alert('Upload failed');
            }
        } catch (e) { console.error(e); alert('Error uploading'); }
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        console.log("DEBUG: Delete syllabus clicked for ID:", id);

        // Debug mode: No confirm dialog for now to avoid issues
        // if (window.confirm("Delete this syllabus?")) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/syllabus/${id}`, { method: 'DELETE' });
            console.log("DEBUG: Delete response:", res.status);

            if (res.ok) {
                alert('Syllabus Deleted!');
                fetchSyllabus();
            } else {
                const err = await res.text();
                console.error("DEBUG: Delete failed:", res.status, err);
                alert(`Failed to delete: ${res.status} - ${err}`);
            }
        } catch (e) {
            console.error("DEBUG: Network error", e);
            alert("Network error while deleting");
        }
        // }
    }

    const filteredList = syllabusList.filter(item =>
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.className && item.className.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
            <div className="header" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <FaArrowLeft color="var(--primary)" />
                        </div>
                        <h1 style={{ marginLeft: '15px', color: 'var(--primary)', fontSize: '28px', margin: 0 }}>Syllabus</h1>
                    </div>

                    {canEdit && (
                        <button
                            className="glass-btn btn-primary"
                            onClick={() => setShowUpload(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}
                        >
                            <FaCloudUploadAlt /> Add New
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaSearch color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search by subject or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: 'var(--text-main)' }}
                    />
                </div>
            </div>

            <div className="syllabus-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredList.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', marginTop: '50px' }}>
                        <FaBook size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <p>No syllabus found.</p>
                    </div>
                ) : (
                    filteredList.map((item, i) => (
                        <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '15px' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #4CC9F0 0%, #4361EE 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', flexShrink: 0
                                }}>
                                    <FaFilePdf size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: 'var(--text-main)' }}>{item.subject}</h3>
                                    <span style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', padding: '3px 8px', borderRadius: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                        Class: {item.className}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.uploadDate || new Date().toISOString().split('T')[0]}</span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {item.fileName && (
                                        <a
                                            href={item.fileName.startsWith('http') ? item.fileName : `${API_BASE_URL}/uploads/${item.fileName}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="glass-btn"
                                            style={{
                                                fontSize: '12px', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px',
                                                background: 'var(--primary-light)', color: 'white', border: 'none', textDecoration: 'none'
                                            }}
                                        >
                                            <FaDownload /> Download
                                        </a>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={(e) => handleDelete(e, item.id)}
                                            style={{
                                                background: '#ffebee', color: '#c62828', border: 'none',
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                            }}
                                            title="Delete Syllabus"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '30px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Add New Syllabus</h3>
                            <FaTimes onClick={() => setShowUpload(false)} style={{ cursor: 'pointer', color: '#666' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                className="glass-input"
                                placeholder="Subject (e.g. Mathematics)"
                                value={newItem.subject}
                                onChange={e => setNewItem({ ...newItem, subject: e.target.value })}
                            />
                            <input
                                className="glass-input"
                                placeholder="Class (e.g. 10)"
                                value={newItem.className}
                                onChange={e => setNewItem({ ...newItem, className: e.target.value })}
                            />
                            <input
                                className="glass-input"
                                placeholder="Section (e.g. A)"
                                value={newItem.section}
                                onChange={e => setNewItem({ ...newItem, section: e.target.value })}
                            />

                            <label className="glass-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#666', border: '2px dashed var(--primary-light)' }}>
                                <FaCloudUploadAlt size={20} />
                                {file ? file.name : 'Select Syllabus PDF'}
                                <input type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                            </label>

                            <button
                                onClick={handleSave}
                                className="glass-btn btn-primary"
                                style={{ marginTop: '10px', padding: '12px' }}
                            >
                                Upload Syllabus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Syllabus;
