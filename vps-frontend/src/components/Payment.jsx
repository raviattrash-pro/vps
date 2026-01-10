import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaQrcode, FaCloudUploadAlt, FaHistory, FaCheckCircle, FaHourglassHalf, FaEdit, FaSave, FaRupeeSign } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Payment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [qrCode, setQrCode] = useState(null);
    const [amount, setAmount] = useState('');
    const [paymentFile, setPaymentFile] = useState(null);
    const [payments, setPayments] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [qrError, setQrError] = useState(false);

    // UPI ID State
    const [upiId, setUpiId] = useState('school@upi'); // Default
    const [isEditingUpi, setIsEditingUpi] = useState(false);
    const [tempUpi, setTempUpi] = useState('');

    const isFinanceAdmin = user && (user.role === 'ADMIN' || user.role === 'ACCOUNTANT');

    useEffect(() => {
        // Fetch QR Code URL
        fetch(`${API_BASE_URL}/api/payment/qr`)
            .then(res => res.text())
            .then(url => {
                setQrCode(url);
                setQrError(false);
            })
            .catch(err => console.error("Failed to load QR", err));

        // Load UPI ID from local storage for persistence (simulation)
        const savedUpi = localStorage.getItem('vps_upi_id');
        if (savedUpi) setUpiId(savedUpi);

        let url = `${API_BASE_URL}/api/payment`;
        if (!isFinanceAdmin && user) {
            url += `?studentId=${user.id}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => setPayments(data.reverse()))
            .catch(err => console.error("Error loading payments", err));
    }, [refresh, isFinanceAdmin, user]);

    const getQrUrl = () => {
        if (!qrCode) return '';
        let url = qrCode.startsWith('http') ? qrCode : `${API_BASE_URL}${qrCode}`;
        // Force HTTPS if needed (though backend should handle it, double safety)
        if (url.startsWith('http:')) {
            url = url.replace('http:', 'https:');
        }
        return `${url}?t=${new Date().getTime()}`;
    };

    const handleQrUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await fetch(`${API_BASE_URL}/api/payment/qr`, { method: 'POST', body: formData });
            alert('QR Code Updated!');
            setRefresh(!refresh);
        } catch (error) {
            console.error("QR Upload failed", error);
            alert('Failed to update QR');
        }
    };

    const saveUpiId = () => {
        setUpiId(tempUpi);
        localStorage.setItem('vps_upi_id', tempUpi);
        setIsEditingUpi(false);
    };

    const handlePaymentSubmit = async () => {
        if (!amount || !paymentFile || !user) {
            alert('Please enter amount and upload screenshot');
            return;
        }
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('studentId', user.id);
        formData.append('file', paymentFile);

        try {
            const res = await fetch(`${API_BASE_URL}/api/payment`, { method: 'POST', body: formData });
            if (res.ok) {
                alert('Payment Submitted for Verification!');
                setAmount('');
                setPaymentFile(null);
                setRefresh(!refresh);
            } else {
                alert('Submission failed');
            }
        } catch (error) {
            console.error("Payment failed", error);
            alert('Error submitting payment');
        }
    };

    return (
        <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
            <div className="header" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <FaArrowLeft color="var(--primary)" />
                </div>
                <h1 style={{ marginLeft: '15px', color: 'var(--primary)', fontSize: '28px' }}>Fee Payment</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>

                {/* LEFT COLUMN: QR Code Card */}
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaQrcode /> Scan & Pay
                    </h3>

                    <div style={{
                        width: '240px', height: '240px', background: 'white', borderRadius: '20px',
                        padding: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {!qrError && qrCode ? (
                            <img
                                src={getQrUrl()}
                                alt="Payment QR"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                onError={() => setQrError(true)}
                            />
                        ) : (
                            <div style={{ color: '#999', fontSize: '14px', fontWeight: 'bold' }}>
                                QR Code Not Available
                            </div>
                        )}
                    </div>

                    {/* UPI ID Section */}
                    <div style={{ background: 'rgba(255,255,255,0.6)', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', border: '1px solid rgba(255,255,255,0.5)' }}>
                        {isEditingUpi ? (
                            <>
                                <input
                                    value={tempUpi}
                                    onChange={(e) => setTempUpi(e.target.value)}
                                    placeholder="Enter UPI ID"
                                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)', fontStyle: 'italic', width: '150px' }}
                                />
                                <FaSave onClick={saveUpiId} style={{ cursor: 'pointer', color: 'var(--primary)' }} title="Save" />
                            </>
                        ) : (
                            <>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '16px', letterSpacing: '0.5px' }}>{upiId}</span>
                                {isFinanceAdmin && (
                                    <FaEdit onClick={() => { setTempUpi(upiId); setIsEditingUpi(true); }} style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px' }} title="Edit UPI ID" />
                                )}
                            </>
                        )}
                    </div>

                    {isFinanceAdmin && (
                        <div style={{ marginTop: '25px', width: '100%' }}>
                            <label className="glass-btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
                                <FaCloudUploadAlt /> Update QR Image
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleQrUpload} />
                            </label>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>Only Admins can update the QR Code and UPI ID.</p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Payment Form (Student) OR Info (Admin) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Make Payment Card */}
                    {!isFinanceAdmin && (
                        <div className="glass-card" style={{ padding: '30px', flex: 1 }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Make a Payment</h3>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>Enter Amount</label>
                                <div style={{ position: 'relative' }}>
                                    <FaRupeeSign style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="glass-input"
                                        style={{ paddingLeft: '40px', fontSize: '18px', fontWeight: 'bold' }}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>Upload Receipt</label>
                                <div
                                    className="upload-box glass-input"
                                    onClick={() => document.getElementById('payInput').click()}
                                    style={{
                                        height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', border: '2px dashed var(--primary-light)', background: 'rgba(255,255,255,0.3)'
                                    }}
                                >
                                    <FaCloudUploadAlt size={30} color="var(--primary)" />
                                    <span style={{ color: 'var(--text-muted)', marginTop: '5px', fontSize: '14px' }}>
                                        {paymentFile ? paymentFile.name : 'Click to select screenshot'}
                                    </span>
                                    <input type="file" id="payInput" accept="image/*" style={{ display: 'none' }} onChange={(e) => setPaymentFile(e.target.files[0])} />
                                </div>
                            </div>

                            <button className="glass-btn btn-primary" style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={handlePaymentSubmit}>
                                <FaCheckCircle /> Submit Payment
                            </button>
                        </div>
                    )}

                    {/* Instructions Card for Everyone */}
                    <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                        <strong>Instructions:</strong>
                        <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0' }}>
                            <li>Scan the QR code using any UPI app.</li>
                            <li>Verify the UPI ID matches: <strong>{upiId}</strong>.</li>
                            <li>Enter the amount and complete the payment.</li>
                            <li>Take a screenshot of the success screen and upload it here.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* PAYMENT HISTORY SECTION */}
            <div style={{ marginTop: '50px', maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaHistory /> {isFinanceAdmin ? 'Payment Verification Queue' : 'My Payment History'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {payments.length === 0 ? (
                        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>No payment records found.</p>
                        </div>
                    ) : payments.map((p, index) => (
                        <div key={p.id || index} className="glass-card" style={{
                            padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center',
                            borderLeft: p.status === 'VERIFIED' ? '5px solid #2e7d32' : '5px solid #f57c00'
                        }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>₹{p.amount}</h3>
                                    <span style={{
                                        fontSize: '11px', padding: '4px 10px', borderRadius: '12px',
                                        background: p.status === 'VERIFIED' ? '#e8f5e9' : '#fff3e0',
                                        color: p.status === 'VERIFIED' ? '#2e7d32' : '#f57c00',
                                        fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
                                    }}>
                                        {p.status === 'VERIFIED' ? <><FaCheckCircle size={10} /> Verified</> : <><FaHourglassHalf size={10} /> Pending</>}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{p.date}</p>
                                {p.student && (
                                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: '500', color: 'var(--primary)' }}>
                                        {p.student.name} <span style={{ fontWeight: 'normal', color: '#666' }}>({p.student.className}-{p.student.section})</span>
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {p.screenshotFileName && (
                                    <a
                                        href={p.screenshotFileName.startsWith('http') ? p.screenshotFileName : `${API_BASE_URL}/uploads/${p.screenshotFileName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-btn"
                                        style={{ fontSize: '13px', padding: '8px 15px', color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <FaCloudUploadAlt /> Receipt
                                    </a>
                                )}

                                {isFinanceAdmin && p.status !== 'VERIFIED' && (
                                    <button
                                        className="glass-btn"
                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 20px' }}
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`${API_BASE_URL}/api/payment/${p.id}/verify`, { method: 'PUT' });
                                                if (res.ok) {
                                                    setRefresh(!refresh);
                                                } else {
                                                    alert('Verification failed');
                                                }
                                            } catch (e) { console.error(e); }
                                        }}
                                    >
                                        Verify
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Payment;
