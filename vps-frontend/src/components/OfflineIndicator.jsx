import React, { useState, useEffect } from 'react';
import { FaWifi } from 'react-icons/fa';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            background: '#e63946',
            color: 'white',
            textAlign: 'center',
            padding: '8px',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
            <FaWifi /> You are currently offline. Check your internet connection.
        </div>
    );
};

export default OfflineIndicator;
