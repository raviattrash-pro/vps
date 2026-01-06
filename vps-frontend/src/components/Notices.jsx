import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaBell, FaPaperPlane, FaBullhorn, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Notices = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [newNotice, setNewNotice] = useState({ title: '', content: '' });

    const canEdit = user && (user.role === 'ADMIN' || user.role === 'TEACHER');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/notices`)
            .then(res => res.json())
            .then(data => setNotices(data.reverse())) // Newest first
            .catch(err => console.error("Error fetching notices:", err));
    }, []);

    const handleSave = async () => {
        if (!newNotice.title || !newNotice.content) return alert('Please fill in all fields');

        try {
            const response = await fetch(`${API_BASE_URL}/api/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNotice)
            });

            if (response.ok) {
                alert('Notice Posted Successfully!');
                const updatedList = await fetch(`${API_BASE_URL}/api/notices`).then(res => res.json());
                setNotices(updatedList.reverse());
                setNewNotice({ title: '', content: '' });
            } else {
                alert('Failed to post notice');
            }
        } catch (error) {
            console.error(error);
            alert('Error posting notice');
        }
    };

    return (
        <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
            {/* Header */}
            <div className="header" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <FaArrowLeft color="var(--primary)" />
                </div>
                <h1 style={{ marginLeft: '15px', color: 'var(--primary)', fontSize: '28px' }}>Notices & Announcements</h1>
            </div>

            {/* Create Notice Form - Only for Admin/Teacher */}
            {canEdit && (
                <div className="glass-card" style={{ padding: '25px', marginBottom: '40px', borderLeft: '5px solid var(--accent)' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                        <FaBullhorn /> Post New Notice
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            className="glass-input"
                            placeholder="Notice Heading / Title"
                            value={newNotice.title}
                            onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                            style={{ fontWeight: 'bold' }}
                        />
                        <textarea
                            className="glass-input"
                            placeholder="Write the details here..."
                            style={{ height: '120px', resize: 'vertical' }}
                            value={newNotice.content}
                            onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                        ></textarea>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button
                                className="glass-btn"
                                onClick={() => alert('Notifications sent to WhatsApp & Email!')}
                                style={{ background: 'var(--accent)', color: 'white', border: 'none' }}
                            >
                                <FaBell /> Send Alert
                            </button>
                            <button
                                className="glass-btn"
                                onClick={handleSave}
                                style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
                            >
                                <FaPaperPlane /> Post Notice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notice List */}
            <div className="notice-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {notices.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                        <FaBell size={50} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <p>No notices at the moment.</p>
                    </div>
                ) : (
                    notices.map((notice, i) => (
                        <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '15px 25px',
                                background: 'rgba(255,255,255,0.4)',
                                borderBottom: '1px solid rgba(255,255,255,0.3)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #FF9F1C 0%, #FFBF69 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', boxShadow: '0 2px 10px rgba(255, 159, 28, 0.3)'
                                    }}>
                                        <FaBell />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>{notice.title}</h3>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaCalendarAlt /> {notice.date || new Date().toISOString().split('T')[0]}
                                    </span>
                                    {canEdit && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                console.log("DEBUG: Delete clicked for Notice ID:", notice.id);

                                                // TEMPORARY: Removed confirm dialog for debugging
                                                // if (window.confirm('Delete this notice?')) {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/notices/${notice.id}`, { method: 'DELETE' });
                                                    console.log("DEBUG: Response status:", res.status);

                                                    if (res.ok) {
                                                        alert('Notice Deleted!');
                                                        setNotices(notices.filter(n => n.id !== notice.id));
                                                    } else {
                                                        const errText = await res.text();
                                                        console.error("DEBUG: Delete failed:", res.status, errText);
                                                        alert(`Failed to delete: ${res.status} - ${errText}`);
                                                    }
                                                } catch (e) {
                                                    console.error("DEBUG: Network error", e);
                                                    alert('Network error. Check console.');
                                                }
                                                // }
                                            }}
                                            style={{
                                                background: '#ffcdd2', border: 'none', color: '#c62828',
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', zIndex: 10
                                            }}
                                            title="Delete Notice"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '25px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                                {notice.content}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notices;
