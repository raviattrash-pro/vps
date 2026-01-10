import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaChalkboardTeacher, FaBook, FaCalendarAlt, FaUserCog, FaFileAlt, FaVideo, FaMoneyBillWave, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../AuthContext';

// Navigation Items Configuration
const navItems = [
    { path: '/', label: 'Home', icon: <FaHome />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },
    { path: '/attendance', label: 'Attendance', icon: <FaCalendarAlt />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/marks', label: 'Marks', icon: <FaFileAlt />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/live', label: 'Live', icon: <FaVideo />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/payment', label: 'Fees', icon: <FaMoneyBillWave />, allowedRoles: ['ADMIN', 'STUDENT', 'ACCOUNTANT'] },
    { path: '/reports', label: 'Reports', icon: <FaBook />, allowedRoles: ['ADMIN', 'ACCOUNTANT'] },
    { path: '/calendar', label: 'Calendar', icon: <FaCalendarAlt />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    // { path: '/admin', label: 'Admin', icon: <FaUserCog />, allowedRoles: ['ADMIN'] }, 
];

const NavItem = ({ item, isMobile, onClick }) => (
    <NavLink
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''} ${isMobile ? 'mobile' : 'desktop'}`
        }
        style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: isMobile ? '5px' : '15px',
            textDecoration: 'none',
            color: 'var(--text-main)',
            padding: '12px 20px',
            borderRadius: '16px',
            marginBottom: isMobile ? '0' : '10px',
            transition: 'all 0.3s ease',
            fontSize: isMobile ? '10px' : '16px',
            background: 'transparent'
        }}
    >
        <span style={{ fontSize: isMobile ? '20px' : '22px', color: 'var(--primary-light)' }}>{item.icon}</span>
        <span style={{ fontWeight: '500' }}>{item.label}</span>
    </NavLink>
);

export const DesktopSidebar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="desktop-sidebar glass-card" style={{ padding: '30px 20px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '28px', letterSpacing: '-1px' }}>VPS App</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.5)', padding: '5px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '5px' }}>
                    Welcome, {user?.name?.split(' ')[0]}
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
                {navItems.filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.role)).map(item => (
                    <NavItem key={item.path} item={item} isMobile={false} />
                ))}

                {user?.role === 'ADMIN' && (
                    <NavItem item={{ path: '/admin', label: 'Admin', icon: <FaUserCog /> }} isMobile={false} />
                )}
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px' }}>
                <button
                    onClick={logout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '15px',
                        width: '100%', padding: '12px 20px', borderRadius: '16px',
                        border: 'none', background: 'rgba(255, 0, 0, 0.05)', color: '#d32f2f',
                        cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 0, 0, 0.05)'}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
};

export const MobileBottomNav = () => {
    const { user, logout } = useAuth();

    // Mobile grid should include logout or have top-bar logout? 
    // Usually bottom nav has limited space. Let's add it as the last item or separate specific icon.
    // For now, let's append a Logout item to the list for mobile manually

    return (
        <div className="mobile-nav glass-card" style={{ borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {navItems.filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.role)).slice(0, 4).map(item => (
                <NavItem key={item.path} item={item} isMobile={true} />
            ))}
            {/* Logout Icon for Mobile */}
            <button
                onClick={logout}
                style={{
                    background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '5px', color: '#d32f2f', cursor: 'pointer'
                }}
            >
                <span style={{ fontSize: '20px' }}><FaSignOutAlt /></span>
                <span style={{ fontSize: '10px', fontWeight: '500' }}>Logout</span>
            </button>
        </div>
    );
};
