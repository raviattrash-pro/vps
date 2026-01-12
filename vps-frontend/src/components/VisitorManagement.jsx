import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaUserShield, FaSignInAlt, FaSignOutAlt, FaHistory, FaCheckCircle, FaSearch, FaIdBadge, FaClock, FaPhone, FaUserTie } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const VisitorManagement = () => {
    const { user } = useAuth();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('active'); // active, history

    const [newVisitor, setNewVisitor] = useState({
        name: '', phone: '', purpose: '', personToMeet: ''
    });

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/visitors`);
            if (response.ok) {
                const data = await response.json();
                setVisitors(dataSorted(data));
            }
        } catch (error) {
            console.error("Error fetching visitors", error);
        } finally {
            setLoading(false);
        }
    };

    const dataSorted = (data) => {
        return data.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
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
            if (response.ok) fetchVisitors();
        } catch (error) {
            console.error("Error checking out visitor", error);
        }
    };

    const activeVisitors = visitors.filter(v => v.status === 'IN');
    const historyVisitors = visitors.filter(v => v.status === 'OUT');

    const filteredList = (viewMode === 'active' ? activeVisitors : historyVisitors).filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm)
    );

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className={`p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4`}>
            <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400 text-xl`}>
                <Icon />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-purple-600 dark:text-purple-400">
                        <FaUserShield /> Security Command Center
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Digital Gate Pass System & Visitor Logs</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-end w-full md:w-auto">
                    <StatCard label="On Campus" value={activeVisitors.length} icon={FaSignInAlt} color="green" />
                    <StatCard label="Total Today" value={visitors.filter(v => new Date(v.checkInTime).toDateString() === new Date().toDateString()).length} icon={FaHistory} color="purple" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Check-In Form Panel */}
                <div className="lg:col-span-4">
                    <div className="glass-card sticky top-6" style={{ padding: '25px', color: 'var(--text-primary)' }}>
                        <h2 style={{ marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }} className="flex items-center gap-3">
                            <FaIdBadge className="text-purple-500" /> Issue New Pass
                        </h2>

                        <form onSubmit={handleCheckIn} className="space-y-5">
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Visitor Name</label>
                                <input
                                    className="glass-input"
                                    value={newVisitor.name} onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })}
                                    placeholder="Full Name" required
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Contact</label>
                                <input
                                    className="glass-input"
                                    value={newVisitor.phone} onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                                    placeholder="Phone Number" required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Meeting With</label>
                                    <input
                                        className="glass-input"
                                        value={newVisitor.personToMeet} onChange={e => setNewVisitor({ ...newVisitor, personToMeet: e.target.value })}
                                        placeholder="Staff Name" required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Purpose</label>
                                    <input
                                        className="glass-input"
                                        value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                                        placeholder="Reason" required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="glass-btn w-full flex justify-center items-center gap-2 mt-4">
                                <FaSignInAlt /> GENERATE ENTRY PASS
                            </button>
                        </form>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-wrap">
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('active')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-white dark:bg-gray-600 shadow text-purple-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                            >
                                Active Passes
                            </button>
                            <button
                                onClick={() => setViewMode('history')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-white dark:bg-gray-600 shadow text-purple-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                            >
                                Visitor Log
                            </button>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full md:w-64 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                                placeholder="Search records..."
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence mode='popLayout'>
                            {filteredList.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="col-span-full py-16 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700"
                                >
                                    <FaUserShield className="text-6xl mx-auto mb-4 opacity-20" />
                                    <p>No records found for current filter.</p>
                                </motion.div>
                            ) : (
                                filteredList.map((visitor, idx) => (
                                    <motion.div
                                        key={visitor.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                        className={`relative p-6 rounded-[2rem] border ${viewMode === 'active' ? 'bg-white dark:bg-gray-800 border-green-500 dark:border-green-600 shadow-xl' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100'}`}
                                    >
                                        {/* Status Badge */}
                                        <div className={`absolute -top-3 -right-3 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md ${viewMode === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {viewMode === 'active' ? 'ON SITE' : 'CHECKED OUT'}
                                        </div>

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center text-2xl text-purple-600 dark:text-purple-300 shadow-sm">
                                                <FaUserTie />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">{visitor.name}</h3>
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                    <FaPhone className="text-xs" /> {visitor.phone}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Meeting</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200 truncate ml-2 text-right">{visitor.personToMeet}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Purpose</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200 truncate ml-2 text-right">{visitor.purpose}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">In Time</span>
                                                <span className="font-mono text-gray-800 dark:text-gray-200">{new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {visitor.checkOutTime && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Out Time</span>
                                                    <span className="font-mono text-gray-800 dark:text-gray-200">{new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {viewMode === 'active' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleCheckOut(visitor.id)}
                                                    className="flex-1 py-3 px-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-bold flex items-center justify-center gap-2 transition-colors border border-red-100 dark:border-red-900/50"
                                                >
                                                    <FaSignOutAlt /> Checkout
                                                </button>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 font-bold flex items-center justify-center gap-2 transition-colors"
                                                    title="Download/Print Pass"
                                                >
                                                    <FaIdBadge />
                                                </button>
                                            </div>
                                        )}
                                        {viewMode === 'history' && (
                                            <div className="text-center text-xs text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1">
                                                <FaCheckCircle /> Visit Completed
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default VisitorManagement;
