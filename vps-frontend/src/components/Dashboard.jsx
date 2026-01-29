
import React from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCalendarCheck, FaBook, FaClipboardList, FaFileAlt, FaVideo, FaRupeeSign, FaChartBar, FaImages, FaPoll, FaPenNib, FaBus, FaComments, FaChalkboardTeacher, FaHeartbeat, FaUserShield, FaCertificate, FaBoxes } from 'react-icons/fa';
import { MdAssignment, MdMenuBook, MdQuiz } from 'react-icons/md';

import { useAuth } from '../AuthContext';
import InstallPWA from './InstallPWA';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="dashboard">
            {/* Header Section */}
            <header className="header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ color: 'var(--primary)', fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
                        Good Morning, {user?.name?.split(' ')[0]}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '5px' }}>Let's make today productive!</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <InstallPWA />

                    <div style={{ position: 'relative' }}>
                        {user?.profilePhoto ? (
                            <img src={`${user.profilePhoto?.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}`}`} alt="Profile" style={{ width: '70px', height: '70px', borderRadius: '25px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
                        ) : (
                            <div style={{ width: '70px', height: '70px', background: 'var(--primary)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', border: '4px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                                {user?.name?.charAt(0)}
                            </div>
                        )}
                        <span style={{ position: 'absolute', bottom: '0', right: '-5px', width: '20px', height: '20px', background: '#4caf50', borderRadius: '50%', border: '3px solid white' }}></span>
                    </div>
                </div>
            </header>

            {/* Quick Actions */}
            <h2 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '4px', height: '20px', background: 'var(--accent)', borderRadius: '2px', display: 'block' }}></span>
                Quick Access
            </h2>

            <div className="quick-actions">
                {[
                    { title: 'Attendance', icon: <FaCalendarCheck />, path: '/attendance', color: '#4361EE' },
                    { title: 'Homework', icon: <FaBook />, path: '/homework', color: '#F72585' },
                    { title: 'Notices', icon: <FaClipboardList />, path: '/notices', color: '#7209B7' },
                    { title: 'Pay Fees', icon: <FaRupeeSign />, path: '/payment', color: '#4CC9F0' },
                ].map((item, idx) => (
                    <div key={idx} onClick={() => navigate(item.path)} className="glass-card" style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        textAlign: 'center',
                        aspectRatio: '1/1',
                        transition: 'transform 0.2s ease',
                        background: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.6)'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            fontSize: '28px',
                            color: item.color,
                            marginBottom: '10px',
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                        }}>
                            {item.icon}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{item.title}</span>
                    </div>
                ))}
            </div>

            {/* Services Grid */}
            <h2 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '4px', height: '20px', background: 'var(--accent)', borderRadius: '2px', display: 'block' }}></span>
                All Services
            </h2>

            <div className="grid-menu" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '25px'
            }}>
                {[
                    { title: 'Assignment', sub: 'Tasks & Projects', icon: <MdAssignment />, path: '/create-content', color: '#4895ef' },
                    { title: 'Study Material', sub: 'Notes & PDFs', icon: <MdMenuBook />, path: '/study-material', color: '#4cc9f0' },
                    { title: 'Syllabus', sub: 'Curriculum', icon: <FaClipboardList />, path: '/syllabus', color: '#f72585' },
                    { title: 'Question Bank', sub: 'Practice', icon: <MdQuiz />, path: '/question', color: '#7209b7' },
                    { title: 'Results', sub: 'View Marks', icon: <FaFileAlt />, path: '/marks', color: '#ffb703' },
                    { title: 'Live Class', sub: 'Join Now', icon: <FaVideo />, path: '/live', color: '#fb8500' },
                    { title: 'Gallery', sub: 'Events & Photos', icon: <FaImages />, path: '/gallery', color: '#d90429' },
                    { title: 'Polls', sub: 'Vote Now', icon: <FaPoll />, path: '/polls', color: '#00afb9' },
                    { title: 'School Blog', sub: 'Creative Corner', icon: <FaPenNib />, path: '/blog', color: '#f07167' },
                    { title: 'Transport', sub: 'Bus Routes', icon: <FaBus />, path: '/transport', color: '#fca311' },
                    { title: 'Forum', sub: 'Ask Doubts', icon: <FaComments />, path: '/forum', color: '#8d99ae' },
                    { title: 'Time Table', sub: 'Schedule', icon: <FaChalkboardTeacher />, path: '/timetable', color: '#6d6875' },
                    { title: 'Health Card', sub: 'Medical Profile', icon: <FaHeartbeat />, path: '/health', color: '#ef233c' },
                    // Admin & Teacher Only
                    ...(['ADMIN', 'TEACHER'].includes(user?.role) ? [
                        { title: 'Leaves', sub: 'Manage Leaves', icon: <FaCalendarCheck />, path: '/leaves', color: '#2a9d8f' },
                        { title: 'Analytics', sub: 'Performance', icon: <FaChartBar />, path: '/analytics', color: '#3a0ca3' },
                    ] : []),
                    // Admin Only
                    ...(user?.role === 'ADMIN' ? [
                        { title: 'Admin Panel', sub: 'Management', icon: <FaUserCircle />, path: '/admin', color: '#2b2d42' },
                        { title: 'Visitors', sub: 'Gate Pass', icon: <FaUserShield />, path: '/visitors', color: '#9b2226' },
                        { title: 'Certificates', sub: 'Generate', icon: <FaCertificate />, path: '/certificates', color: '#e07a5f' },
                        { title: 'Inventory', sub: 'Assets', icon: <FaBoxes />, path: '/inventory', color: '#555b6e' },
                        { title: 'Reports', sub: 'Analytics', icon: <FaChartBar />, path: '/reports', color: '#3f37c9' },
                    ] : [])
                ].map((item, idx) => (
                    <div key={idx} className="menu-card glass-card" onClick={() => navigate(item.path)} style={{
                        padding: '25px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: '140px',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '15px',
                                background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '24px', marginBottom: '15px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-main)' }}>{item.title}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.sub}</p>
                        </div>

                        {/* Abstract Decoration */}
                        <div style={{
                            position: 'absolute', top: '-20px', right: '-20px',
                            width: '100px', height: '100px', background: item.color,
                            opacity: '0.05', borderRadius: '50%'
                        }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
