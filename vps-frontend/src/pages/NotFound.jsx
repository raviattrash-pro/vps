import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)', color: 'var(--text-main)', textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '80px', color: 'var(--accent)', marginBottom: '20px' }}>
                <FaExclamationTriangle />
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>404</h1>
            <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '30px' }}>
                Oops! The page you are looking for does not exist.
            </p>
            <button
                onClick={() => navigate('/')}
                className="glass-btn"
                style={{ padding: '12px 25px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
                <FaHome /> Go Home
            </button>
        </div>
    );
};

export default NotFound;
