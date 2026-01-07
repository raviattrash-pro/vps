import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaUserCircle, FaCircle, FaClock, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ActiveUsers = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        // Poll every 30 seconds
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`);
            if (res.ok) {
                const data = await res.json();
                // Filter users who have logged in recently (e.g., last 24 hours) or show all with status
                // Since we want "who are login", we can define "Active" as logged in within last 30 mins
                // Sorting by lastLogin descending
                const sorted = data
                    .filter(u => u.lastLogin) // Only users who have logged in at least once
                    .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));
                setUsers(sorted);
            }
        } catch (e) { console.error(e); }
    };

    const getStatus = (lastLogin) => {
        if (!lastLogin) return 'Offline';
        // Assume server sends UTC time without Z (e.g., "2026-01-08T10:00:00")
        // Appending 'Z' tells JS Date constructor this is UTC.
        const timeString = lastLogin.endsWith('Z') ? lastLogin : lastLogin + 'Z';
        const loginTime = new Date(timeString).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - loginTime) / (1000 * 60);

        if (diffMinutes < 15) return 'Online'; // Active
        if (diffMinutes < 60) return 'Away';   // Recently Active
        return 'Offline';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Online': return '#4caf50';
            case 'Away': return '#ff9800';
            default: return '#9e9e9e';
        }
    };

    const formatLastLogin = (dateStr) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (
        <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate('/admin')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '24px', display: 'flex', alignItems: 'center' }}
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                        Active Users Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
                        Monitor real-time user activity
                    </p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)', zIndex: 10 }}>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--text-muted)' }}>User</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--text-muted)' }}>Role</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--text-muted)' }}>Last Seen</th>
                                <th style={{ padding: '15px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => {
                                const status = getStatus(u.lastLogin);
                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {u.profilePhoto ? (
                                                    <img src={`${API_BASE_URL}${u.profilePhoto}`} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                                ) : (
                                                    <FaUserCircle size={36} color="#ccc" />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.admissionNo}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <span style={{
                                                fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px',
                                                background: u.role === 'ADMIN' ? '#ffebee' : u.role === 'TEACHER' ? '#fff3e0' : 'rgba(0,0,0,0.05)',
                                                color: u.role === 'ADMIN' ? '#d32f2f' : u.role === 'TEACHER' ? '#f57c00' : 'inherit'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-main)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaClock size={12} color="var(--text-muted)" />
                                                {formatLastLogin(u.lastLogin)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: getStatusColor(status) }}>
                                                <FaCircle size={8} /> {status}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No recent activity found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActiveUsers;
