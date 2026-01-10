import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTrash, FaArrowLeft, FaEdit, FaSearch, FaChalkboardTeacher, FaUserGraduate, FaUserShield, FaCamera, FaTimes, FaUserCircle } from 'react-icons/fa';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', admissionNo: '', password: '', role: 'STUDENT', className: '', section: '' });
    const [editingUserId, setEditingUserId] = useState(null);
    const [file, setFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false); // Toggle for mobile/cleaner UI
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setUsers(data);
                else setUsers([]);
            } else {
                console.error("Failed to fetch users");
                setUsers([]);
            }
        } catch (e) { console.error(e); setUsers([]); }
    };

    const handleAddUser = async () => {
        try {
            const formData = new FormData();
            formData.append('student', new Blob([JSON.stringify(newUser)], { type: 'application/json' }));
            if (file) {
                formData.append('file', file);
            }

            const url = editingUserId
                ? `${API_BASE_URL}/api/admin/users/${editingUserId}`
                : `${API_BASE_URL}/api/admin/users`;

            const method = editingUserId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                body: formData
            });

            if (res.ok) {
                alert(editingUserId ? 'User Updated Successfully!' : 'User Added Successfully!');
                fetchUsers();
                resetForm();
            } else {
                alert('Failed to save user. Please check inputs.');
            }
        } catch (e) { alert('Failed to save user. Network error.'); }
    };

    const resetForm = () => {
        setNewUser({ name: '', admissionNo: '', password: '', role: 'STUDENT', className: '', section: '' });
        setFile(null);
        setEditingUserId(null);
        setShowForm(false);
    };

    const handleEdit = (user) => {
        setNewUser({
            name: user.name,
            admissionNo: user.admissionNo,
            password: '',
            role: user.role,
            className: user.className || '',
            section: user.section || '',
            rollNo: user.rollNo || ''
        });
        setEditingUserId(user.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                const text = await res.text();
                console.error("Delete failed:", text);
                alert('Failed to delete user: ' + text);
            }
        } catch (e) {
            console.error("Delete error:", e);
            alert('Failed to delete user due to network error');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.rollNo && u.rollNo.toString().includes(searchQuery))
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <FaUserShield />;
            case 'TEACHER': return <FaChalkboardTeacher />;
            default: return <FaUserGraduate />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return '#e63946';
            case 'TEACHER': return '#f4a261';
            default: return 'var(--primary)';
        }
    };

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
                            Admin Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
                            Manage users, roles, and permissions
                        </p>
                    </div>
                </div>
                <button
                    className="glass-btn"
                    onClick={() => navigate('/admin/active-users')}
                    style={{ background: 'var(--accent)', color: 'var(--primary)', fontWeight: '600', marginRight: '10px' }}
                >
                    <FaUserCircle /> Active Users
                </button>
                <button
                    className="glass-btn"
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: showForm ? '#e63946' : 'var(--primary-light)' }}
                >
                    {showForm ? <><FaTimes /> Cancel</> : <><FaUserPlus /> Add New User</>}
                </button>
            </div>

            {/* Form Section */}
            <div style={{
                maxHeight: showForm ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: showForm ? 1 : 0,
                marginBottom: showForm ? '30px' : '0'
            }}>
                <div className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                        {editingUserId ? 'Edit User Details' : 'Register New User'}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>Full Name</label>
                            <input className="glass-input" placeholder="John Doe" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>Admission No / User ID</label>
                            <input className="glass-input" placeholder="ADM123" value={newUser.admissionNo} onChange={e => setNewUser({ ...newUser, admissionNo: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
                            <input className="glass-input" type="password" placeholder="••••••" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>Role</label>
                            <select className="glass-input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="ACCOUNTANT">Accountant</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        {(newUser.role === 'STUDENT' || newUser.role === 'TEACHER') && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                        {newUser.role === 'TEACHER' ? 'Assigned Class (For Attendance)' : 'Class'}
                                    </label>
                                    <input className="glass-input" placeholder="10" value={newUser.className} onChange={e => setNewUser({ ...newUser, className: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>Section</label>
                                    <input className="glass-input" placeholder="A" value={newUser.section} onChange={e => setNewUser({ ...newUser, section: e.target.value })} />
                                </div>
                                {newUser.role === 'STUDENT' && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>Roll Number</label>
                                        <input className="glass-input" placeholder="Auto" value={newUser.rollNo || ''} onChange={e => setNewUser({ ...newUser, rollNo: e.target.value })} />
                                    </div>
                                )}
                            </>
                        )}

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-muted)' }}>Profile Photo</label>
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                <input
                                    type="file"
                                    id="file_upload"
                                    onChange={e => setFile(e.target.files[0])}
                                    style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                />
                                <label htmlFor="file_upload" className="glass-btn" style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaCamera /> {file ? file.name : 'Choose Image'}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button className="glass-btn" onClick={handleAddUser} style={{ width: '200px' }}>
                            {editingUserId ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>All Users <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>({filteredUsers.length})</span></h3>

                    <div style={{ position: 'relative', width: '300px' }}>
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Search users..."
                            style={{ padding: '10px 10px 10px 40px', fontSize: '14px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                        <p>No users found matching your search.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {filteredUsers.map(u => (
                            <div key={u.id} className="glass-card" style={{ padding: '20px', position: 'relative', transition: 'all 0.3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden',
                                        background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `2px solid ${getRoleColor(u.role)}`
                                    }}>
                                        {u.profilePhoto ? (
                                            <img src={`${u.profilePhoto?.startsWith('http') ? u.profilePhoto : `${API_BASE_URL}${u.profilePhoto}`}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '24px', color: getRoleColor(u.role) }}>{u.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px' }}>{u.name}</h4>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
                                            color: getRoleColor(u.role), marginTop: '4px'
                                        }}>
                                            {getRoleIcon(u.role)} {u.role}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                                    <div><strong>ID:</strong> {u.admissionNo}</div>
                                    {u.role === 'STUDENT' && (
                                        <>
                                            <div><strong>Class:</strong> {u.className} {u.section ? `(${u.section})` : ''}</div>
                                            {u.rollNo && <div><strong>Roll:</strong> {u.rollNo}</div>}
                                        </>
                                    )}
                                    {u.role === 'TEACHER' && u.className && (
                                        <div><strong>Class Teacher of:</strong> Class {u.className}</div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                    <button
                                        onClick={() => handleEdit(u)}
                                        style={{
                                            flex: 1, padding: '8px', border: '1px solid var(--primary)', borderRadius: '10px',
                                            background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        style={{
                                            flex: 1, padding: '8px', border: '1px solid #e63946', borderRadius: '10px',
                                            background: 'transparent', color: '#e63946', cursor: 'pointer', fontSize: '13px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e63946'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e63946'; }}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
