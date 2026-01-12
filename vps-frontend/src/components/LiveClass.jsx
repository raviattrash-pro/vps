import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaVideo, FaChalkboardTeacher, FaRegClock, FaUsers, FaBroadcastTower } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LiveClass = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [link, setLink] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [targetClass, setTargetClass] = useState('10');
    const [targetSection, setTargetSection] = useState('A');

    const canGoLive = user && (user.role === 'ADMIN' || user.role === 'TEACHER');

    React.useEffect(() => {
        fetchSession();
        const interval = setInterval(fetchSession, 5000);
        return () => clearInterval(interval);
    }, [targetClass, targetSection]);

    const fetchSession = async () => {
        if (!user) return;
        try {
            let url = `${API_BASE_URL}/api/live-session`;
            // If student, pass studentID to filter for their class
            if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
                url += `?studentId=${user.id}`;
            } else {
                // If Teacher/Admin, filter by the selected class/section
                url += `?className=${targetClass}&section=${targetSection}`;
            }
            const res = await fetch(url);
            if (res.status === 200) {
                const data = await res.json();
                if (data && data.meetingLink) {
                    setIsLive(true);
                    setLink(data.meetingLink);
                } else {
                    if (!canGoLive) setIsLive(false);
                }
            } else {
                if (!canGoLive) setIsLive(false);
            }
        } catch (e) { console.error(e); } finally {
            setLoading(false);
        }
    };

    const handleGoLive = async () => {
        if (!link) { alert('Please enter a link'); return; }
        try {
            await fetch(`${API_BASE_URL}/api/live-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meetingLink: link,
                    message: 'Class Started',
                    className: targetClass,
                    section: targetSection
                })
            });
            setIsLive(true);
            alert('You are now Live!');
        } catch (e) { alert('Error starting session'); }
    };

    const handleEndClass = async () => {
        console.log("DEBUG: End Class Clicked");
        // TEMPORARY: Debug mode - No confirm
        // if (window.confirm("End the live session for everyone?")) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/live-session`, { method: 'DELETE' });
            console.log("DEBUG: End Class Response:", res.status);

            if (res.ok) {
                setIsLive(false);
                setLink('');
                alert("Class Ended Successfully!");
            } else {
                const err = await res.text();
                console.error("DEBUG: End Class Failed:", err);
                alert(`Failed to end class: ${res.status} - ${err}`);
            }
        } catch (e) {
            console.error("DEBUG: Network error", e);
            alert('Error ending session. Check console.');
        }
        // }
    };

    return (
        <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
            <div className="header" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <FaArrowLeft color="var(--primary)" />
                </div>
                <h1 style={{ marginLeft: '15px', color: 'var(--primary)', fontSize: '28px' }}>Live Classroom</h1>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {canGoLive ? (
                    !isLive ? (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#ffebee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                                <FaVideo size={40} color="#d32f2f" />
                            </div>
                            <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Start a Live Session</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Share your Zoom, Google Meet, or Team link below to start the class.</p>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Class</label>
                                    <input
                                        className="glass-input"
                                        placeholder="e.g. 10, Nursery"
                                        value={targetClass}
                                        onChange={(e) => setTargetClass(e.target.value)}
                                        style={{ width: '100%', padding: '10px' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Section</label>
                                    <input
                                        className="glass-input"
                                        placeholder="e.g. A, Rose"
                                        value={targetSection}
                                        onChange={(e) => setTargetSection(e.target.value)}
                                        style={{ width: '100%', padding: '10px' }}
                                    />
                                </div>
                            </div>

                            <input
                                className="glass-input"
                                placeholder="Paste Meeting Link (e.g. https://meet.google.com/abc-xyz...)"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                style={{ fontSize: '16px', marginBottom: '20px' }}
                            />

                            <button
                                className="glass-btn"
                                style={{
                                    background: '#d32f2f', color: 'white', border: 'none', width: '100%',
                                    padding: '15px', fontSize: '18px', fontWeight: 'bold', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                                onClick={handleGoLive}
                            >
                                <FaBroadcastTower /> GO LIVE NOW
                            </button>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '3px solid #d32f2f', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ background: '#d32f2f', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    ● LIVE
                                </span>
                                <span style={{ background: 'rgba(0,0,0,0.1)', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', color: '#555' }}>
                                    <FaRegClock /> Class in Progress
                                </span>
                            </div>

                            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                                <FaChalkboardTeacher size={60} color="var(--primary)" />
                                <h2 style={{ margin: '15px 0', color: 'var(--text-main)' }}>You are Live!</h2>
                                <div style={{ background: 'rgba(255,255,255,0.6)', padding: '15px', borderRadius: '12px', overflowWrap: 'anywhere', fontSize: '14px', color: 'var(--primary)', border: '1px dashed var(--primary)' }}>
                                    {link}
                                </div>
                            </div>

                            <button
                                className="glass-btn"
                                style={{
                                    background: '#333', color: 'white', border: 'none',
                                    padding: '12px 30px', fontWeight: 'bold'
                                }}
                                onClick={handleEndClass}
                            >
                                END CLASS
                            </button>
                        </div>
                    )
                ) : (
                    isLive ? (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(255,255,255,0.8))' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ background: '#2e7d32', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(46,125,50,0.3)' }}>
                                    <FaBroadcastTower /> LIVE NOW
                                </span>
                            </div>

                            <h2 style={{ color: '#2e7d32', marginBottom: '10px', fontSize: '28px' }}>Class Has Started!</h2>
                            <p style={{ color: '#555', marginBottom: '30px' }}>Your teacher is waiting for you in the class.</p>

                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-btn"
                                style={{
                                    background: '#2e7d32', color: 'white', border: 'none', display: 'inline-flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px 40px',
                                    fontSize: '18px', textDecoration: 'none', boxShadow: '0 5px 15px rgba(46,125,50,0.3)'
                                }}
                            >
                                <FaVideo /> JOIN CLASS
                            </a>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '50px', textAlign: 'center', opacity: 0.8 }}>
                            <FaVideo size={60} color="#ccc" style={{ marginBottom: '20px' }} />
                            <h3 style={{ color: '#888', marginBottom: '10px' }}>No Live Class Active</h3>
                            <p style={{ color: '#999' }}>Relax! There are no classes scheduled right now.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default LiveClass;
