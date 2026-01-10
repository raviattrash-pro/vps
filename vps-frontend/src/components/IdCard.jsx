import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

const IdCard = ({ user, onClose }) => {
    const cardRef = useRef();

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true, // Allow fetching cross-origin images (Cloudinary)
                scale: 2 // High resolution
            });
            const link = document.createElement('a');
            link.download = `${user.admissionNo}_ID_Card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error(err);
            alert('Failed to generate ID Card');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-card" style={{ padding: '20px', maxWidth: '400px', width: '90%', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'red', fontSize: '20px', cursor: 'pointer' }}
                >
                    &times;
                </button>

                <h3 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '20px' }}>Student ID Card</h3>

                {/* ID CARD DESIGN */}
                <div ref={cardRef} style={{
                    width: '320px', height: '500px', background: 'white', borderRadius: '15px', overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', margin: '0 auto', display: 'flex', flexDirection: 'column',
                    border: '1px solid #ddd'
                }}>
                    {/* Header */}
                    <div style={{ background: '#1D6F42', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <h2 style={{ color: 'white', margin: 0, fontSize: '18px', textAlign: 'center' }}>VISION PUBLIC SCHOOL</h2>
                    </div>

                    {/* Photo */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #1D6F42', overflow: 'hidden', marginBottom: '15px'
                        }}>
                            {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '22px' }}>{user.name}</h2>
                        <span style={{ background: '#eee', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{user.role}</span>

                        <div style={{ width: '100%', marginTop: '20px', textAlign: 'left', fontSize: '14px', color: '#555' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                                <strong>Admission No:</strong> <span>{user.admissionNo}</span>
                            </div>
                            {user.role === 'STUDENT' && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                                        <strong>Class:</strong> <span>{user.className} ({user.section})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                                        <strong>Roll No:</strong> <span>{user.rollNo}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer / QR */}
                    <div style={{ background: '#f8f9fa', padding: '15px', display: 'flex', justifyContent: 'center', borderTop: '1px dashed #ccc' }}>
                        <QRCodeCanvas value={`VPS_USER:${user.admissionNo}`} size={60} />
                    </div>
                    <div style={{ background: '#1D6F42', height: '10px' }}></div>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button className="glass-btn" onClick={handleDownload} style={{ width: '100%' }}>
                        Download PNG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IdCard;
