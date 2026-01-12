import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaCalendarCheck, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaPlus, FaCalendarAlt, FaUserClock, FaPlaneDeparture } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const LeaveManagement = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // New Leave Form Data
    const [newLeave, setNewLeave] = useState({
        startDate: '', endDate: '', reason: ''
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/leaves`;
            if (user.role === 'TEACHER') {
                url += `?teacherId=${user.id}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error("Error fetching leaves", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newLeave, teacher: { id: user.id } };
            const response = await fetch(`${API_BASE_URL}/api/leaves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowForm(false);
                setNewLeave({ startDate: '', endDate: '', reason: '' });
                fetchLeaves();
            }
        } catch (error) {
            console.error("Error applying leave", error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/leaves/${id}/status?status=${status}`, {
                method: 'PUT'
            });
            if (response.ok) fetchLeaves();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    // Derived Stats
    const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
    const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
    const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-${color}-200 dark:border-${color}-900 flex items-center gap-4`}
        >
            <div className={`p-4 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 text-2xl`}>
                <Icon />
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wide">{label}</p>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white">{value}</h3>
            </div>
        </motion.div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-300">
                        <FaPlaneDeparture className="text-teal-600 dark:text-teal-400" />
                        {user.role === 'ADMIN' ? 'Leave Requests' : 'My Leave Dashboard'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {user.role === 'ADMIN' ? 'Manage and review staff time-off requests.' : 'Plan your schedule and track applications.'}
                    </p>
                </div>
                {user.role === 'TEACHER' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-500/20 flex items-center gap-2"
                    >
                        <FaPlus /> Apply New Leave
                    </motion.button>
                )}
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard icon={FaHourglassHalf} label="Pending Reviews" value={pendingCount} color="yellow" />
                <StatCard icon={FaCheckCircle} label="Approved Leaves" value={approvedCount} color="green" />
                <StatCard icon={FaTimesCircle} label="Rejected Requests" value={rejectedCount} color="red" />
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card mb-8" style={{ padding: '25px', maxWidth: '800px', margin: '0 auto' }}>
                            <h2 style={{ marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }} className="flex items-center gap-2">
                                <FaCalendarAlt /> Application Details
                            </h2>
                            <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>From Date</label>
                                    <input
                                        type="date"
                                        className="glass-input"
                                        value={newLeave.startDate} onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })} required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>To Date</label>
                                    <input
                                        type="date"
                                        className="glass-input"
                                        value={newLeave.endDate} onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })} required
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Reason for Leave</label>
                                    <textarea
                                        rows="3"
                                        className="glass-input resize-none"
                                        value={newLeave.reason} onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                                        placeholder="Please provide a detailed reason..." required
                                    ></textarea>
                                </div>
                                <div className="col-span-full flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm">Cancel</button>
                                    <button type="submit" className="glass-btn px-8 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-600/30 transition-all transform hover:-translate-y-1">Submit Application</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading leave records...</div>
                ) : leaves.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <FaUserClock className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No leave records found</p>
                    </div>
                ) : (
                    leaves.map((leave, index) => (
                        <motion.div
                            key={leave.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold dark:text-white">{leave.teacher?.name || 'Unknown Staff'}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        leave.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {leave.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm mb-3">
                                    <FaCalendarAlt className="opacity-70" />
                                    <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span>{new Date(leave.endDate).toLocaleDateString()}</span>
                                </div>
                                <p className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl text-gray-700 dark:text-gray-300 italic border-l-4 border-gray-200 dark:border-gray-600">
                                    "{leave.reason}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {user.role === 'ADMIN' && leave.status === 'PENDING' ? (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleStatusUpdate(leave.id, 'APPROVED')}
                                            className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 flex items-center gap-2"
                                        >
                                            <FaCheckCircle /> Approve
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleStatusUpdate(leave.id, 'REJECTED')}
                                            className="px-6 py-2.5 bg-white text-red-500 border-2 border-red-100 hover:border-red-500 rounded-xl font-bold transition-colors flex items-center gap-2"
                                        >
                                            <FaTimesCircle /> Reject
                                        </motion.button>
                                    </>
                                ) : (
                                    <div className="text-3xl opacity-20">
                                        {leave.status === 'APPROVED' && <FaCheckCircle className="text-green-500" />}
                                        {leave.status === 'REJECTED' && <FaTimesCircle className="text-red-500" />}
                                        {leave.status === 'PENDING' && <FaHourglassHalf className="text-yellow-500" />}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeaveManagement;
