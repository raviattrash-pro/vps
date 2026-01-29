import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { FaUserPlus, FaUser, FaVenusMars, FaBirthdayCake, FaIdCard, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTint, FaPray, FaGlobe, FaUsers, FaArrowLeft, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const InputGroup = ({ icon: Icon, label, name, type = "text", required = false, options = null, colSpan = 1, formData, handleChange }) => (
    <div className={`col-span-1 md:col-span-${colSpan}`}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', color: 'var(--text-main)', display: 'block', marginBottom: '5px' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Icon />
            </div>
            {options ? (
                <select
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="glass-input" // Standard glass class
                    style={{ paddingLeft: '40px' }} // Space for icon
                >
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    placeholder={`Enter ${label}`}
                    className="glass-input" // Standard glass class
                    style={{ paddingLeft: '40px' }} // Space for icon
                />
            )}
        </div>
    </div>
);

const AdminAdmissionForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        admissionNo: '', // Will be username
        rollNo: '',
        className: '',
        section: '',
        fatherName: '',
        motherName: '',
        dob: '',
        gender: 'Male',
        nationality: 'Indian',
        religion: '',
        category: 'GEN',
        bloodGroup: '',
        address: '',
        contactNo: '',
        email: '', // Optional
        adhaarNumber: '',
        role: 'STUDENT',
        password: '' // Optional, defaults to 1234
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic Validation
        if (!formData.admissionNo || !formData.name) {
            toast.error("Admission Number and Name are required!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success(`Student Admitted! ID: ${formData.admissionNo}, Pass: 1234`);
                setTimeout(() => navigate('/admin'), 1500);
            } else {
                toast.error("Failed to admit student. Check Admission No.");
            }
        } catch (error) {
            console.error("Admission Error", error);
            toast.error("Network Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-admission-page" style={{ padding: '0 20px 100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div className="header" style={{ padding: '20px 0 30px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div onClick={() => navigate('/admin')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <FaArrowLeft color="var(--primary)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: 'bold' }}>New Admission</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Register new student & auto-generate credentials</p>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card" // Standard glass card
                style={{ padding: '30px', borderTop: '4px solid var(--primary)' }}
            >
                <form onSubmit={handleSubmit}>
                    {/* Section 1: Academic & Login */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                            <FaIdCard /> Academic & Login Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <InputGroup icon={FaIdCard} label="Admission No (Username)" name="admissionNo" required formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaUser} label="Roll Number" name="rollNo" formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaUsers} label="Class" name="className" required formData={formData} handleChange={handleChange}
                                options={[
                                    { value: '', label: 'Select Class' },
                                    ...[...Array(12)].map((_, i) => ({ value: (i + 1).toString(), label: `Class ${i + 1}` }))
                                ]}
                            />
                            <InputGroup icon={FaUsers} label="Section" name="section" formData={formData} handleChange={handleChange} options={[
                                { value: 'A', label: 'Section A' }, { value: 'B', label: 'Section B' },
                                { value: 'C', label: 'Section C' }, { value: 'D', label: 'Section D' }
                            ]} />
                        </div>
                    </div>

                    {/* Section 2: Personal Info */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                            <FaUser /> Personal Information
                        </h3>
                        {/* Grid for main personal details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <InputGroup icon={FaUser} label="Student Name" name="name" required colSpan={2} formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaBirthdayCake} label="Date of Birth" name="dob" type="date" required formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaVenusMars} label="Gender" name="gender" formData={formData} handleChange={handleChange} options={[
                                { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }
                            ]} />
                            <InputGroup icon={FaTint} label="Blood Group" name="bloodGroup" formData={formData} handleChange={handleChange} options={[
                                { value: '', label: 'Select' }, { value: 'A+', label: 'A+' }, { value: 'B+', label: 'B+' }, { value: 'O+', label: 'O+' }, { value: 'AB+', label: 'AB+' }
                            ]} />
                            <InputGroup icon={FaUsers} label="Category" name="category" formData={formData} handleChange={handleChange} options={[
                                { value: 'GEN', label: 'General' }, { value: 'OBC', label: 'OBC' }, { value: 'SC', label: 'SC' }, { value: 'ST', label: 'ST' }
                            ]} />
                        </div>
                        {/* Grid for secondary personal details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <InputGroup icon={FaGlobe} label="Nationality" name="nationality" formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaPray} label="Religion" name="religion" formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaIdCard} label="Aadhaar Number" name="adhaarNumber" formData={formData} handleChange={handleChange} />
                        </div>
                    </div>

                    {/* Section 3: Parent & Contact */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                            <FaUsers /> Parent & Contact Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <InputGroup icon={FaUser} label="Father's Name" name="fatherName" required formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaUser} label="Mother's Name" name="motherName" required formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaPhone} label="Contact Number" name="contactNo" type="tel" required formData={formData} handleChange={handleChange} />
                            <InputGroup icon={FaEnvelope} label="Email Address" name="email" type="email" formData={formData} handleChange={handleChange} />
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', color: 'var(--text-main)', display: 'block', marginBottom: '5px' }}>Residential Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }}><FaMapMarkerAlt /></div>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="glass-input" // Standard glass class
                                    style={{ paddingLeft: '40px', resize: 'none' }}
                                    placeholder="Full Address including Pincode"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            style={{ padding: '12px 25px', borderRadius: '50px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-btn" // Standard glass button
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px', justifyContent: 'center' }}
                        >
                            {loading ? <span className="animate-spin">⌛</span> : <FaSave />}
                            Submit Admission
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};

export default AdminAdmissionForm;
