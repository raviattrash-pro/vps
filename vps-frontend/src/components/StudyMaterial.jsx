import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaFilePdf, FaTrash, FaCloudUploadAlt, FaSearch, FaDownload, FaFileAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const StudyMaterial = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showUpload, setShowUpload] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', description: '' });
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [studyList, setStudyList] = useState([]);

    const canEdit = user && (user.role === 'ADMIN' || user.role === 'TEACHER');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = () => {
        fetch(`${API_BASE_URL}/api/studymaterial`).then(res => res.json()).then(data => setStudyList(data.reverse()));
    };

    const handleUpload = async () => {
        if (!file || !newItem.title) {
            alert("Title and File are required");
            return;
        }

        const formData = new FormData();
        formData.append('title', newItem.title);
        formData.append('description', newItem.description);
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/studymaterial`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert('Study Material Uploaded Successfully!');
                setShowUpload(false);
                setNewItem({ title: '', description: '' });
                setFile(null);
                fetchMaterials();
            } else {
                alert('Upload failed');
            }
        } catch (e) { console.error(e); alert('Error uploading'); }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        console.log("DEBUG: Delete clicked for ID:", id);

        // TEMPORARY: Debug mode - No confirm
        // if (window.confirm("Delete this material?")) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/studymaterial/${id}`, { method: 'DELETE' });
            console.log("DEBUG: Response status:", res.status);

            if (res.ok) {
                alert('Material Deleted!');
                fetchMaterials();
            } else {
                const err = await res.text();
                console.error("DEBUG: Delete failed:", res.status, err);
                alert(`Failed to delete: ${res.status} - ${err}`);
            }
        } catch (e) {
            console.error("DEBUG: Network exception", e);
            alert("Network error while deleting");
        }
        // }
    }

    const filteredList = studyList.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
            <div className="header" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <FaArrowLeft color="var(--primary)" />
                        </div>
                        <h1 style={{ marginLeft: '15px', color: 'var(--primary)', fontSize: '28px', margin: 0 }}>Study Materials</h1>
                    </div>

                    {canEdit && (
                        <button
                            className="glass-btn btn-primary"
                            onClick={() => setShowUpload(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}
                        >
                            <FaCloudUploadAlt /> Upload
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaSearch color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search notes, books, papers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: 'var(--text-main)' }}
                    />
                </div>
            </div>

            <div className="material-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredList.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', marginTop: '50px' }}>
                        <FaFileAlt size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <p>No study materials found.</p>
                    </div>
                ) : (
                    filteredList.map((item, i) => (
                        <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '15px' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', flexShrink: 0
                                }}>
                                    <FaFilePdf size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'var(--text-main)', wordBreak: 'break-word' }}>{item.title}</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{item.description}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.uploadDate || 'Recently'}</span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {item.fileName && (
                                        <a
                                            href={`${API_BASE_URL}/uploads/${item.fileName}`}
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
                                            title="Delete Material"
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
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Upload Study Material</h3>
                            <FaTimes onClick={() => setShowUpload(false)} style={{ cursor: 'pointer', color: '#666' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                className="glass-input"
                                placeholder="Title (e.g. Chapter 1 Notes)"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            />
                            <textarea
                                className="glass-input"
                                placeholder="Description (optional)"
                                style={{ height: '80px', resize: 'none' }}
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />

                            <label className="glass-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#666', border: '2px dashed var(--primary-light)' }}>
                                <FaCloudUploadAlt size={20} />
                                {file ? file.name : 'Select PDF/File'}
                                <input type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                            </label>

                            <button
                                onClick={handleUpload}
                                className="glass-btn btn-primary"
                                style={{ marginTop: '10px', padding: '12px' }}
                            >
                                Upload Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyMaterial;
