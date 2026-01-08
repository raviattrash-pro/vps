import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaDownload, FaSearch, FaBookOpen, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Homework = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = require('../AuthContext').useAuth();

    useEffect(() => {
        let url = `${API_BASE_URL}/api/homework`;
        if (user && user.role === 'STUDENT') {
            url += `?studentId=${user.id}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                // Determine status based on date for sorting/display
                const sorted = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                setAssignments(sorted);
            })
            .catch(err => console.error("Error fetching homework:", err));
    }, [user]);

    const handleDownload = (fileName) => {
        if (!fileName) return;
        window.open(`${API_BASE_URL}/uploads/${fileName}`, '_blank');
    };

    const getStatusColor = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return '#e63946'; // Overdue (Red)
        if (diffDays <= 2) return '#fb8500'; // Due soon (Orange)
        return '#2a9d8f'; // Safe (Green)
    };

    const getStatusText = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due Today';
        if (diffDays === 1) return 'Due Tomorrow';
        return `Due in ${diffDays} days`;
    };

    const filteredAssignments = assignments.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
            {/* Header */}
            <div className="header" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <FaArrowLeft color="var(--primary)" />
                    </div>
                    <h1 style={{ color: 'var(--primary)', fontSize: '28px', margin: 0 }}>Homework</h1>
                </div>

                {/* Search Bar */}
                <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaSearch color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: 'var(--text-main)' }}
                    />
                </div>
            </div>

            <div className="homework-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredAssignments.length === 0 ? (
                    <div className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FaBookOpen size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <h3>No homework found</h3>
                        <p>Relax! You are all caught up.</p>
                    </div>
                ) : (
                    filteredAssignments.map((item) => {
                        const statusColor = getStatusColor(item.dueDate);
                        return (
                            <div key={item.id} className="glass-card" style={{
                                padding: '25px',
                                position: 'relative',
                                overflow: 'hidden',
                                borderLeft: `5px solid ${statusColor}`,
                                transition: 'transform 0.2s ease'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <span style={{
                                                background: statusColor, color: 'white', padding: '4px 10px',
                                                borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                                            }}>
                                                {getStatusText(item.dueDate).toUpperCase()}
                                            </span>
                                            {item.subject && (
                                                <span style={{
                                                    background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', padding: '4px 10px',
                                                    borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                                                }}>
                                                    {item.subject}
                                                </span>
                                            )}
                                        </div>

                                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '20px' }}>{item.title}</h3>
                                        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.description}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            <FaCalendarAlt />
                                            <span>Deadline: {new Date(item.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    {item.fileName && (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleDownload(item.fileName)}
                                                className="glass-btn"
                                                style={{
                                                    padding: '12px 20px',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    boxShadow: '0 4px 10px rgba(45, 106, 79, 0.3)'
                                                }}
                                            >
                                                <FaDownload /> Download File
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Background Decorative Icon */}
                                <FaFileAlt style={{
                                    position: 'absolute', bottom: '-20px', right: '-20px',
                                    fontSize: '150px', color: 'rgba(0,0,0,0.03)', zIndex: 0
                                }} />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Homework;
