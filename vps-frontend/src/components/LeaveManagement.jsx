import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaCalendarCheck, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

const LeaveManagement = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // New Leave Form Data
    const [newLeave, setNewLeave] = useState({
        startDate: '',
        endDate: '',
        reason: ''
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
            const payload = {
                ...newLeave,
                teacher: { id: user.id }
            };

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
            if (response.ok) {
                fetchLeaves();
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-teal-600 dark:text-teal-400">
                        <FaCalendarCheck /> Leave Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {user.role === 'ADMIN' ? 'Review Staff Leave Requests' : 'Apply and Track Leaves'}
                    </p>
                </div>
                {user.role === 'TEACHER' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <FaPlus /> Apply for Leave
                    </button>
                )}
            </header>

            {/* Application Form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl border-t-4 border-teal-500">
                    <h2 className="text-lg font-bold mb-4 dark:text-white">New Leave Application</h2>
                    <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newLeave.startDate}
                                onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newLeave.endDate}
                                onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                            <textarea
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newLeave.reason}
                                onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                                placeholder="E.g., Sick leave, Personal work..."
                                required
                            ></textarea>
                        </div>
                        <div className="col-span-full flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Leave List */}
            <div className="space-y-4">
                {leaves.map(leave => (
                    <div key={leave.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg dark:text-white">{leave.teacher?.name || 'Unknown Staff'}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {leave.status}
                                </span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm">
                                {leave.startDate} <span className="mx-1">to</span> {leave.endDate}
                            </div>
                            <p className="mt-2 text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-2 rounded block">
                                "{leave.reason}"
                            </p>
                        </div>

                        {/* Admin Actions */}
                        {user.role === 'ADMIN' && leave.status === 'PENDING' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusUpdate(leave.id, 'APPROVED')}
                                    className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg flex items-center gap-1 text-sm font-semibold"
                                >
                                    <FaCheckCircle /> Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(leave.id, 'REJECTED')}
                                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center gap-1 text-sm font-semibold"
                                >
                                    <FaTimesCircle /> Reject
                                </button>
                            </div>
                        )}

                        {/* Status Icon for Teacher */}
                        {user.role !== 'ADMIN' && (
                            <div className="text-2xl opacity-50">
                                {leave.status === 'APPROVED' ? <FaCheckCircle className="text-green-500" /> :
                                    leave.status === 'REJECTED' ? <FaTimesCircle className="text-red-500" /> :
                                        <FaHourglassHalf className="text-yellow-500" />}
                            </div>
                        )}
                    </div>
                ))}
                {leaves.length === 0 && <p className="text-gray-400 text-center py-8">No leave records found.</p>}
            </div>
        </div>
    );
};

export default LeaveManagement;
