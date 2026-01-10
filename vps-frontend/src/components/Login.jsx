import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [admissionNo, setAdmissionNo] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(admissionNo, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh',
            background: 'linear-gradient(135deg, #0f4c3a 0%, #2d6a4f 100%)', // Deep Green Gradient
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Circles */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(82, 221, 105, 0.2)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

            <div className="glass-card" style={{
                padding: '50px 40px',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{
                    width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', marginBottom: '20px',
                    borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                    {/* Placeholder Logo or Icon */}
                    <span style={{ fontSize: '40px', fontWeight: 'bold', color: 'white' }}>V</span>
                </div>

                <h2 style={{ marginBottom: '10px', color: 'white', letterSpacing: '1px', fontWeight: '700' }}>VISION PUBLIC SCHOOL</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px', fontSize: '14px' }}>Welcome back! Please login to continue.</p>

                {error && <div style={{ background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', color: '#ffcdd2', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <FaUserGraduate style={{ position: 'absolute', top: '18px', left: '15px', color: 'rgba(255,255,255,0.6)' }} />
                        <input
                            type="text"
                            placeholder="Admission Number"
                            value={admissionNo}
                            onChange={(e) => setAdmissionNo(e.target.value)}
                            style={{
                                width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FaLock style={{ position: 'absolute', top: '18px', left: '15px', color: 'rgba(255,255,255,0.6)' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '15px 45px 15px 45px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '16px'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '18px'
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <button type="submit" style={{
                        background: 'white', color: '#0f4c3a', fontWeight: 'bold', padding: '15px', borderRadius: '30px', border: 'none',
                        cursor: 'pointer', fontSize: '16px', letterSpacing: '0.5px', marginTop: '10px', transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}>
                        LOGIN <FaArrowRight />
                    </button>

                    <p style={{ marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                        Demo: 1001 / 1234
                    </p>
                </form>
            </div>

            <p style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                &copy; 2026 Vision Public School. All rights reserved.
            </p>
        </div>
    );
};

export default Login;
