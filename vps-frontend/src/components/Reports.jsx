import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaMoneyBillWave, FaExclamationCircle, FaFilter, FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const DEFAULT_FEE = 10000;

const Reports = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [classFees, setClassFees] = useState({});

    // Filters
    const [selectedClass, setSelectedClass] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [showFeeModal, setShowFeeModal] = useState(false);
    const [editingFee, setEditingFee] = useState({ className: '', amount: '' });

    const isAdmin = user && user.role === 'ADMIN';

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [studentRes, paymentRes, feeRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/students`),
                fetch(`${API_BASE_URL}/api/payment`),
                fetch(`${API_BASE_URL}/api/fees`)
            ]);
            const studentData = await studentRes.json();
            const paymentData = await paymentRes.json();
            const feeData = await feeRes.json();

            setStudents(studentData);
            setPayments(paymentData);

            const feeMap = {};
            feeData.forEach(f => feeMap[f.className] = f.amount);
            setClassFees(feeMap);

            const cls = [...new Set(studentData.map(s => s.className))].sort();
            setClasses(cls);
        } catch (e) { console.error("Error fetching data", e); }
    };

    const getStandardFee = (className) => {
        return classFees[className] !== undefined ? classFees[className] : DEFAULT_FEE;
    };

    const getStudentFinancials = (student) => {
        const studentPayments = payments.filter(p => p.student && p.student.id === student.id && p.status === 'VERIFIED');
        const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const fee = getStandardFee(student.className);
        const pending = fee - totalPaid;
        const status = pending <= 0 ? 'Paid' : 'Pending';
        return { totalPaid, pending, status, fee };
    };

    const handleSaveFee = async () => {
        if (!editingFee.className || !editingFee.amount) return;
        try {
            const formData = new FormData();
            formData.append('className', editingFee.className);
            formData.append('amount', editingFee.amount);

            await fetch(`${API_BASE_URL}/api/fees`, { method: 'POST', body: formData });

            setClassFees(prev => ({ ...prev, [editingFee.className]: parseFloat(editingFee.amount) }));
            setEditingFee({ className: '', amount: '' });
            alert('Fee Updated!');
        } catch (e) {
            console.error("Error saving fee", e);
            alert('Failed to update fee');
        }
    };

    const filteredStudents = students.filter(student => {
        const { status } = getStudentFinancials(student);
        const classMatch = selectedClass === 'All' || student.className === selectedClass;
        const statusMatch = statusFilter === 'All' || status === statusFilter;
        const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.rollNo && student.rollNo.toString().includes(searchQuery));
        return classMatch && statusMatch && nameMatch;
    });

    const totalReceived = filteredStudents.reduce((sum, s) => sum + getStudentFinancials(s).totalPaid, 0);
    const totalPending = filteredStudents.reduce((sum, s) => {
        const p = getStudentFinancials(s).pending;
        return sum + (p > 0 ? p : 0);
    }, 0);

    if (!isAdmin) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>Access Denied</h3>
                <button className="glass-btn" onClick={() => navigate('/')}>Go Home</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '24px', display: 'flex', alignItems: 'center' }}
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(45deg, #0f4c3a, #2d6a4f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            Fee Reports
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
                            Overview of student fees and payments
                        </p>
                    </div>
                </div>
                <button
                    className="glass-btn"
                    onClick={() => setShowFeeModal(!showFeeModal)}
                >
                    {showFeeModal ? 'Hide Fee Settings' : 'Manage Class Fees'}
                </button>
            </div>

            {/* Fee Settings Panel (Collapsible) */}
            <div style={{
                maxHeight: showFeeModal ? '500px' : '0',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: showFeeModal ? 1 : 0,
                marginBottom: showFeeModal ? '30px' : '0'
            }}>
                <div className="glass-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Set Fee Structure</h3>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <select
                                className="glass-input"
                                value={editingFee.className}
                                onChange={(e) => setEditingFee({ ...editingFee, className: e.target.value })}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="number"
                                className="glass-input"
                                placeholder="Amount (₹)"
                                value={editingFee.amount}
                                onChange={(e) => setEditingFee({ ...editingFee, amount: e.target.value })}
                            />
                        </div>
                        <button className="glass-btn" style={{ background: 'var(--accent)', color: 'var(--primary)' }} onClick={handleSaveFee}>
                            Update Fee
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {Object.entries(classFees).map(([cls, amount]) => (
                            <div key={cls} style={{
                                background: 'rgba(255,255,255,0.5)',
                                padding: '8px 16px',
                                borderRadius: '50px',
                                border: '1px solid rgba(255,255,255,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                            }}>
                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{cls}</span>
                                <span style={{ color: 'var(--text-muted)' }}>|</span>
                                <span style={{ fontWeight: 'bold' }}>₹{amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>Total Received</p>
                        <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', color: 'var(--primary)' }}>₹{totalReceived.toLocaleString()}</h2>
                    </div>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(15, 76, 58, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--primary)'
                    }}>
                        <FaMoneyBillWave />
                    </div>
                    {/* Decorative Background Blob */}
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.2 }} />
                </div>

                <div className="glass-card" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>Total Pending</p>
                        <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', color: '#e63946' }}>₹{totalPending.toLocaleString()}</h2>
                    </div>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(230, 57, 70, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#e63946'
                    }}>
                        <FaExclamationCircle />
                    </div>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#e63946', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.1 }} />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                    <FaFilter />
                    <span style={{ fontWeight: 600 }}>Filters:</span>
                </div>

                <select
                    className="glass-input"
                    style={{ width: 'auto', padding: '10px 20px', display: 'inline-block' }}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="All">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    className="glass-input"
                    style={{ width: 'auto', padding: '10px 20px', display: 'inline-block' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>

                <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                    <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Search by Name or Roll No..."
                        style={{ paddingLeft: '40px', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-card" style={{ overflow: 'hidden', padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(15, 76, 58, 0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '600', color: 'var(--primary)' }}>Roll No</th>
                                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '600', color: 'var(--primary)' }}>Student Name</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', color: 'var(--primary)' }}>Class</th>
                                <th style={{ padding: '20px', textAlign: 'right', fontWeight: '600', color: 'var(--primary)' }}>Total Fee</th>
                                <th style={{ padding: '20px', textAlign: 'right', fontWeight: '600', color: 'var(--primary)' }}>Paid</th>
                                <th style={{ padding: '20px', textAlign: 'right', fontWeight: '600', color: 'var(--primary)' }}>Pending</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', color: 'var(--primary)' }}>Status</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', color: 'var(--primary)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => {
                                const { totalPaid, pending, status, fee } = getStudentFinancials(student);
                                const isPaid = status === 'Paid';
                                return (
                                    <tr key={student.id} style={{
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        transition: 'background 0.2s',
                                        background: index % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'transparent'
                                    }}
                                        className="table-row-hover"
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.6)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'transparent'}
                                    >
                                        <td style={{ padding: '15px 20px', fontWeight: '500' }}>#{student.rollNo || student.admissionNo}</td>
                                        <td style={{ padding: '15px 20px', fontWeight: '600' }}>{student.name}</td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', background: 'rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: '500'
                                            }}>{student.className}</span>
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>₹{fee.toLocaleString()}</td>
                                        <td style={{ padding: '15px 20px', textAlign: 'right', color: 'var(--primary)', fontWeight: '600' }}>₹{totalPaid.toLocaleString()}</td>
                                        <td style={{ padding: '15px 20px', textAlign: 'right', color: '#e63946', fontWeight: '600' }}>₹{pending > 0 ? pending.toLocaleString() : 0}</td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '6px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: '700',
                                                background: isPaid ? 'rgba(46, 125, 50, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                                                color: isPaid ? '#2e7d32' : '#c62828',
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                border: `1px solid ${isPaid ? '#2e7d32' : '#c62828'}`
                                            }}>
                                                {isPaid ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                                                {status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => navigate('/payment')}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--primary)',
                                                    background: 'transparent', color: 'var(--primary)', cursor: 'pointer',
                                                    fontWeight: '500', transition: 'all 0.2s', fontSize: '13px'
                                                }}
                                                onMouseEnter={(e) => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; }}
                                                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary)'; }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No students found matching filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
