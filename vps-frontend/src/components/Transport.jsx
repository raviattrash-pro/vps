import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaBus, FaRoute, FaUserTie, FaMapMarkerAlt, FaTrash, FaPlus, FaPhone } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Transport = () => {
    const { user } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [newRoute, setNewRoute] = useState({
        routeName: '',
        vehicleNumber: '',
        driverName: '',
        driverPhone: '',
        routeAreas: ''
    });

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/transport`);
            if (response.ok) {
                const data = await response.json();
                setRoutes(data);
            }
        } catch (error) {
            console.error("Error fetching routes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/transport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoute)
            });

            if (response.ok) {
                setShowForm(false);
                setNewRoute({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', routeAreas: '' });
                fetchRoutes();
            }
        } catch (error) {
            console.error("Error adding route", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this route?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/transport/${id}`, { method: 'DELETE' });
            fetchRoutes();
        } catch (error) {
            console.error("Error deleting route", error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300">
                        <FaBus className="text-orange-600 dark:text-orange-400" /> Transport & Routes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage School Bus Connectivity</p>
                </div>
                {user.role === 'ADMIN' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2"
                    >
                        <FaPlus /> {showForm ? 'Close Form' : 'Add New Route'}
                    </motion.button>
                )}
            </header>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card mb-8"
                        style={{ padding: '25px', maxWidth: '800px', margin: '0 auto' }}
                    >
                        <h2 style={{ marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>Create New Route</h2>
                        <form onSubmit={handleAddRoute} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Route Name</label>
                                <input
                                    type="text" placeholder="e.g. Route 1 (North Campus)"
                                    className="glass-input"
                                    value={newRoute.routeName} onChange={e => setNewRoute({ ...newRoute, routeName: e.target.value })} required
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Vehicle Number</label>
                                <input
                                    type="text" placeholder="e.g. KA-01-AB-1234"
                                    className="glass-input"
                                    value={newRoute.vehicleNumber} onChange={e => setNewRoute({ ...newRoute, vehicleNumber: e.target.value })} required
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Driver Name</label>
                                <input
                                    type="text" placeholder="Driver Full Name"
                                    className="glass-input"
                                    value={newRoute.driverName} onChange={e => setNewRoute({ ...newRoute, driverName: e.target.value })} required
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Contact Phone</label>
                                <input
                                    type="tel" placeholder="Mobile Number"
                                    className="glass-input"
                                    value={newRoute.driverPhone} onChange={e => setNewRoute({ ...newRoute, driverPhone: e.target.value })} required
                                />
                            </div>
                            <div className="col-span-full">
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Coverage Areas</label>
                                <textarea
                                    placeholder="List main stops and areas covered (comma separated)..."
                                    className="glass-input resize-none h-24"
                                    value={newRoute.routeAreas} onChange={e => setNewRoute({ ...newRoute, routeAreas: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="col-span-full flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm">Cancel</button>
                                <button type="submit" className="glass-btn px-8">Save Route</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {routes.map((route, index) => (
                        <motion.div
                            key={route.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl p-6 border border-white/50 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-100/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-t-3xl -z-10"></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm text-orange-500 text-2xl">
                                    <FaBus />
                                </div>
                                <div className="text-xs font-black tracking-wider text-orange-600/60 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-3 py-1 rounded-full uppercase">
                                    {route.vehicleNumber || 'No Number'}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{route.routeName || 'Unnamed Route'}</h3>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-200 bg-gray-50/80 dark:bg-gray-700/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-gray-600 flex items-center justify-center text-orange-600 shadow-sm flex-shrink-0">
                                        <FaUserTie size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5">Driver</p>
                                        <p className="font-bold text-sm truncate">{route.driverName || 'N/A'}</p>
                                    </div>
                                    <a href={`tel:${route.driverPhone}`} className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-xl hover:bg-green-600 hover:scale-105 transition-all shadow-green-500/20 shadow-lg">
                                        <FaPhone size={14} />
                                    </a>
                                </div>

                                <div className="flex gap-4 text-gray-700 dark:text-gray-300">
                                    <div className="mt-1 w-10 h-10 rounded-full bg-blue-50 dark:bg-gray-700/50 flex items-center justify-center text-blue-500 border border-blue-100 dark:border-gray-600 flex-shrink-0">
                                        <FaMapMarkerAlt size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2">Route Coverage</p>
                                        <p className="text-sm leading-relaxed font-medium text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            {route.routeAreas || 'No details available'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {user.role === 'ADMIN' && (
                                <button
                                    onClick={() => handleDelete(route.id)}
                                    className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all flex items-center justify-center gap-2 group-hover:border-red-200"
                                >
                                    <FaTrash /> Remove Route
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {routes.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <FaBus className="text-6xl mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-bold text-gray-400">No transport routes defined yet.</p>
                </div>
            )}
        </div>
    );
};

export default Transport;
