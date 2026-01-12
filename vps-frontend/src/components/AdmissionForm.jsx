import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { FaUniversity, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdmissionForm = () => {
    const [formData, setFormData] = useState({
        studentName: '', parentName: '', phone: '', email: '', targetClass: '', address: '', message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admissions/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error("Error submitting form", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                    <p className="text-gray-600">Thank you for your interest in Vision Public School. Our admissions team will contact you shortly.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white text-center">
                    <FaUniversity className="text-4xl mx-auto mb-3 opacity-80" />
                    <h1 className="text-3xl font-bold">Online Admission Inquiry</h1>
                    <p className="opacity-80">Join the Vision Public School Family</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                        <input type="text" required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade Applying For</label>
                        <select className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.targetClass} onChange={e => setFormData({ ...formData, targetClass: e.target.value })}>
                            <option value="">Select Grade</option>
                            {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>Class {i + 1}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name</label>
                        <input type="text" required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" rows="2"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message / Queries</label>
                        <textarea className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" rows="3"
                            value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}></textarea>
                    </div>

                    <div className="col-span-full pt-4">
                        <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-transform active:scale-95 flex justify-center items-center gap-2">
                            {loading ? 'Submitting...' : <><FaPaperPlane /> Submit Application</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionForm;
