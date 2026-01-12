import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaUserShield, FaSignInAlt, FaSignOutAlt, FaHistory, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const VisitorManagement = () => {
    const { user } = useAuth();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const [newVisitor, setNewVisitor] = useState({
        name: '',
        phone: '',
        purpose: '',
        personToMeet: ''
    });

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/visitors`);
            if (response.ok) {
                const data = await response.json();
                setVisitors(data);
            }
        } catch (error) {
            console.error("Error fetching visitors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/visitors/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVisitor)
            });

            if (response.ok) {
                setNewVisitor({ name: '', phone: '', purpose: '', personToMeet: '' });
                fetchVisitors();
            }
        } catch (error) {
            console.error("Error checking in visitor", error);
        }
    };

    const handleCheckOut = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/visitors/${id}/checkout`, {
                method: 'PUT'
            });
            if (response.ok) {
                fetchVisitors();
            }
        } catch (error) {
            console.error("Error checking out visitor", error);
        }
    };

    // Filter visitors
    const activeVisitors = visitors.filter(v => v.status === 'IN' && (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.phone.includes(searchTerm)));
    const historyVisitors = visitors.filter(v => v.status === 'OUT' && (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.phone.includes(searchTerm)));

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-purple-700 dark:text-purple-400">
                        <FaUserShield /> Visitor Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Gate Pass & Security Log</p>
                </div>
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setShowHistory(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showHistory ? 'bg-white dark:bg-gray-700 shadow text-purple-700 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Active Visitors
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showHistory ? 'bg-white dark:bg-gray-700 shadow text-purple-700 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        History
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Check-In Form */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-purple-600 sticky top-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                            <FaSignInAlt className="text-purple-600" /> New Entry
                        </h2>
                        <form onSubmit={handleCheckIn} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visitor Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newVisitor.name}
                                    onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newVisitor.phone}
                                    onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose of Visit</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newVisitor.purpose}
                                    onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting With</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newVisitor.personToMeet}
                                    onChange={e => setNewVisitor({ ...newVisitor, personToMeet: e.target.value })}
                                    placeholder="e.g. Principal, Class Teacher..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-lg mt-4"
                            >
                                Generate Pass
                            </button>
                        </form>
                    </div>
                </div>

                {/* Visitors List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Search visitor by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
                        {showHistory ? 'Visitor History' : 'Currently On Campus'}
                    </h2>

                    <div className="space-y-3">
                        {loading && <p>Loading records...</p>}

                        {(showHistory ? historyVisitors : activeVisitors).length === 0 && !loading && (
                            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                                <p className="text-gray-400">No {showHistory ? 'past' : 'active'} visitors found.</p>
                            </div>
                        )}

                        <AnimatePresence>
                            {(showHistory ? historyVisitors : activeVisitors).map(visitor => (
                                <motion.div
                                    key={visitor.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 ${visitor.status === 'IN' ? 'border-green-500' : 'border-gray-400'} flex justify-between items-center`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg dark:text-white">{visitor.name}</h3>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{visitor.phone}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Meeting: <span className="font-medium text-gray-800 dark:text-gray-200">{visitor.personToMeet}</span> • {visitor.purpose}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">
                                            In: {new Date(visitor.checkInTime).toLocaleString()}
                                            {visitor.checkOutTime && ` • Out: ${new Date(visitor.checkOutTime).toLocaleString()}`}
                                        </div>
                                    </div>

                                    {visitor.status === 'IN' && (
                                        <button
                                            onClick={() => handleCheckOut(visitor.id)}
                                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold flex items-center gap-2"
                                        >
                                            <FaSignOutAlt /> Check Out
                                        </button>
                                    )}
                                    {visitor.status === 'OUT' && (
                                        <div className="text-gray-400 text-2xl">
                                            <FaCheckCircle />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitorManagement;
