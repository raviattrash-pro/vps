import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaChalkboardTeacher, FaBook, FaCalendarAlt, FaUserCog, FaFileAlt, FaVideo, FaMoneyBillWave, FaSignOutAlt, FaSun, FaMoon, FaHeartbeat, FaComments, FaCalendarCheck, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';

// Navigation Items Configuration
const navItems = [
    { path: '/', label: 'Home', icon: <FaHome />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },
    { path: '/attendance', label: 'Attendance', icon: <FaCalendarAlt />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/marks', label: 'Marks', icon: <FaFileAlt />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/live', label: 'Live', icon: <FaVideo />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/payment', label: 'Fees', icon: <FaMoneyBillWave />, allowedRoles: ['ADMIN', 'STUDENT', 'ACCOUNTANT'] },
    { path: '/reports', label: 'Reports', icon: <FaBook />, allowedRoles: ['ADMIN', 'ACCOUNTANT'] },
    { path: '/health', label: 'Health Card', icon: <FaHeartbeat />, allowedRoles: ['ADMIN', 'STUDENT'] },
    { path: '/forum', label: 'Discussion', icon: <FaComments />, allowedRoles: ['ADMIN', 'STUDENT', 'TEACHER'] },
    { path: '/leaves', label: 'Leaves', icon: <FaCalendarCheck />, allowedRoles: ['ADMIN', 'TEACHER'] },
    { path: '/visitors', label: 'Visitors', icon: <FaUserShield />, allowedRoles: ['ADMIN'] },
    { path: '/calendar', label: 'Calendar', icon: <FaCalendarAlt />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/timetable', label: 'Time Table', icon: <FaChalkboardTeacher />, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
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
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="desktop-sidebar glass-card" style={{ padding: '30px 20px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '28px', letterSpacing: '-1px' }}>VPS App</h1>
                <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                        <img
                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.name || 'User'}&backgroundColor=c0aede,b6e3f4`}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{user?.name?.split(' ')[0]}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{user?.role}</p>
                    </div>

                    <button
                        onClick={logout}
                        style={{
                            width: '100%', padding: '8px', borderRadius: '8px',
                            border: '1px solid rgba(255,0,0,0.2)', background: 'rgba(255,0,0,0.05)', color: '#d32f2f',
                            cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                        }}
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1, overflowY: 'auto' }}>
                {navItems.filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.role)).map(item => (
                    <NavItem key={item.path} item={item} isMobile={false} />
                ))}

                {user?.role === 'ADMIN' && (
                    <NavItem item={{ path: '/admin', label: 'Admin', icon: <FaUserCog /> }} isMobile={false} />
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '15px',
                        width: '100%', padding: '12px 20px', borderRadius: '16px',
                        border: 'none', background: 'transparent', color: 'var(--text-main)',
                        cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-border)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <span style={{ fontSize: '22px' }}>{theme === 'dark' ? <FaSun /> : <FaMoon />}</span>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </div>
    );
};

export const MobileBottomNav = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const mobileItems = navItems.filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.role)).slice(0, 4);

    return (
        <div className="mobile-nav glass-card" style={{ borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', padding: '0 5px' }}>
            {mobileItems.map(item => (
                <NavItem key={item.path} item={item} isMobile={true} />
            ))}

            <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)', margin: '0 5px' }}></div>

            <button
                onClick={toggleTheme}
                style={{
                    background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '4px', color: 'var(--text-main)', cursor: 'pointer',
                    minWidth: '50px'
                }}
            >
                <span style={{ fontSize: '18px' }}>{theme === 'dark' ? <FaSun /> : <FaMoon />}</span>
                <span style={{ fontSize: '9px', fontWeight: '500' }}>Theme</span>
            </button>

            <button
                onClick={logout}
                style={{
                    background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '4px', color: '#d32f2f', cursor: 'pointer',
                    minWidth: '50px'
                }}
            >
                <span style={{ fontSize: '18px' }}><FaSignOutAlt /></span>
                <span style={{ fontSize: '9px', fontWeight: '500' }}>Logout</span>
            </button>
        </div>
    );
};
