import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';

const InstallPWA = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the default browser install prompt
            e.preventDefault();
            // Store the event for later use
            setInstallPrompt(e);
            setIsInstallable(true);
        };

        // Listen for successful app installation
        const handleAppInstalled = () => {
            setIsInstallable(false);
            setInstallPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Cleanup event listeners
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        // Show the native install prompt
        installPrompt.prompt();

        // Wait for user response
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the install prompt (can only be used once)
        setInstallPrompt(null);
    };

    // Don't render the button if app is not installable
    if (!isInstallable) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="install-pwa-button"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(15, 76, 58, 0.3)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 76, 58, 0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(15, 76, 58, 0.3)';
            }}
        >
            <FaDownload style={{ fontSize: '16px' }} />
            <span>Install App</span>
        </button>
    );
};

export default InstallPWA;
