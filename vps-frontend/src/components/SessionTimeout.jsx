import React, { useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SessionTimeout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);

    const onIdle = () => {
        setModalOpen(true);
    };

    const confirmLogout = () => {
        setModalOpen(false);
        logout();
        navigate('/login');
        toast.error("Session Expired due to inactivity");
    };

    const stayLoggedIn = () => {
        setModalOpen(false);
        reset();
    };

    const { reset } = useIdleTimer({
        onIdle,
        timeout: 15 * 60 * 1000, // 15 minutes
        throttle: 500
    });

    if (!modalOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', maxWidth: '400px', background: 'white' }}>
                <h3 style={{ color: '#d32f2f' }}>Session Expiring</h3>
                <p>You have been inactive for a while. You will be logged out to protect your account.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                    <button onClick={confirmLogout} className="glass-btn" style={{ background: '#d32f2f', color: 'white' }}>
                        Logout Now
                    </button>
                    <button onClick={stayLoggedIn} className="glass-btn" style={{ background: 'var(--primary)', color: 'white' }}>
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeout;
