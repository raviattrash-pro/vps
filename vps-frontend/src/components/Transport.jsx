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
                        className="glass-panel p-8 rounded-3xl border border-white/20 shadow-xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
                        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Create New Route</h2>
                        <form onSubmit={handleAddRoute} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1">Route Name</label>
                                <input
                                    type="text" placeholder="e.g. Route 1 (North Campus)"
                                    className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none backdrop-blur-sm transition-all"
                                    value={newRoute.routeName} onChange={e => setNewRoute({ ...newRoute, routeName: e.target.value })} required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1">Vehicle Number</label>
                                <input
                                    type="text" placeholder="e.g. KA-01-AB-1234"
                                    className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none backdrop-blur-sm transition-all"
                                    value={newRoute.vehicleNumber} onChange={e => setNewRoute({ ...newRoute, vehicleNumber: e.target.value })} required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1">Driver Name</label>
                                <input
                                    type="text" placeholder="Driver Full Name"
                                    className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none backdrop-blur-sm transition-all"
                                    value={newRoute.driverName} onChange={e => setNewRoute({ ...newRoute, driverName: e.target.value })} required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1">Contact Phone</label>
                                <input
                                    type="tel" placeholder="Mobile Number"
                                    className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none backdrop-blur-sm transition-all"
                                    value={newRoute.driverPhone} onChange={e => setNewRoute({ ...newRoute, driverPhone: e.target.value })} required
                                />
                            </div>
                            <div className="col-span-full space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1">Coverage Areas</label>
                                <textarea
                                    placeholder="List main stops and areas covered (comma separated)..."
                                    className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none backdrop-blur-sm transition-all h-24 resize-none"
                                    value={newRoute.routeAreas} onChange={e => setNewRoute({ ...newRoute, routeAreas: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="col-span-full flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all">Save Route</button>
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
                                    {route.vehicleNumber}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{route.routeName}</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-700/30 p-3 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-gray-600 flex items-center justify-center text-orange-600">
                                        <FaUserTie size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Driver</p>
                                        <p className="font-bold text-sm">{route.driverName}</p>
                                    </div>
                                    <a href={`tel:${route.driverPhone}`} className="ml-auto w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
                                        <FaPhone size={12} />
                                    </a>
                                </div>

                                <div className="flex gap-3 text-gray-600 dark:text-gray-300">
                                    <div className="mt-1 min-w-[32px] h-8 rounded-full bg-blue-100 dark:bg-gray-600 flex items-center justify-center text-blue-600">
                                        <FaMapMarkerAlt size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Coverage</p>
                                        <p className="text-sm leading-relaxed font-medium break-words line-clamp-3" title={route.routeAreas}>{route.routeAreas}</p>
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
