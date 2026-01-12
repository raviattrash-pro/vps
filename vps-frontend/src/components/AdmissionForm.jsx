import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { FaUniversity, FaPaperPlane, FaCheckCircle, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (error) {
            console.error("Error submitting form", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl text-center max-w-md border border-white/20"
                >
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-4xl"
                    >
                        <FaCheckCircle />
                    </motion.div>
                    <h2 className="text-3xl font-black mb-3 text-gray-800 dark:text-white">Application Sent!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        Thank you for choosing Vision Public School. Our admissions team will review your application and contact you shortly at <span className="font-bold text-gray-800 dark:text-white">{formData.email}</span>.
                    </p>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:bg-indigo-700">
                        Submit Another Inquiry
                    </button>
                </motion.div>
            </div>
        );
    }

    const InputField = ({ label, icon: Icon, type = "text", value, onChange, options = null, ...props }) => (
        <div className="group">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Icon />
                </div>
                {options ? (
                    <select
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none"
                        value={value} onChange={onChange} {...props}
                    >
                        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder-gray-400"
                        value={value} onChange={onChange} {...props}
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed py-12 px-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-sm"></div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10"
                >
                    <div className="grid md:grid-cols-5 h-full">
                        {/* Sidebar Info */}
                        <div className="md:col-span-2 bg-indigo-600 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <FaUniversity className="text-5xl mb-6 opacity-90" />
                                <h1 className="text-3xl font-black leading-tight mb-4">Join Our Community</h1>
                                <p className="opacity-80 leading-relaxed text-indigo-100">
                                    Start your journey with Vision Public School. We nurture curiosity and empower future leaders.
                                </p>
                            </div>
                            <div className="relative z-10 mt-10 space-y-4 text-sm opacity-80">
                                <p>📞 +91 98765 43210</p>
                                <p>📧 admissions@vps.edu</p>
                                <p>📍 123 Education Lane, Knowledge City</p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="md:col-span-3 p-8 md:p-10">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Admission Inquiry</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Student Name" icon={FaUser}
                                        placeholder="Full Name" required
                                        value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                                    />
                                    <InputField
                                        label="Grade Applying For" icon={FaGraduationCap}
                                        options={[
                                            { value: "", label: "Select Grade" },
                                            ...[...Array(12)].map((_, i) => ({ value: i + 1, label: `Class ${i + 1}` }))
                                        ]}
                                        value={formData.targetClass} onChange={e => setFormData({ ...formData, targetClass: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Parent Name" icon={FaUser}
                                        placeholder="Parent/Guardian" required
                                        value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                                    />
                                    <InputField
                                        label="Phone Number" icon={FaPhone} type="tel"
                                        placeholder="10-digit Mobile" required
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <InputField
                                    label="Email Address" icon={FaEnvelope} type="email"
                                    placeholder="For official updates" required
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />

                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Address</label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-4 text-gray-400">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <textarea
                                            required rows="2"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder-gray-400 resize-none"
                                            placeholder="Residential Address"
                                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex justify-center items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <><FaPaperPlane /> Submit Application</>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </motion.div>

                <p className="text-center text-white/50 mt-8 text-sm">
                    © {new Date().getFullYear()} Vision Public School. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AdmissionForm;
