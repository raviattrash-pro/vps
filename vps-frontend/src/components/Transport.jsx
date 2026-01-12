import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaBus, FaRoute, FaUserTie, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
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
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-orange-600 dark:text-orange-400">
                        <FaBus /> Transport & Routes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage School Bus Schedules</p>
                </div>
                {user.role === 'ADMIN' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        + Add Route
                    </button>
                )}
            </header>

            {/* Add Route Form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 rounded-2xl overflow-hidden">
                    <form onSubmit={handleAddRoute} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="Route Name (e.g. Route 1)"
                            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newRoute.routeName} onChange={e => setNewRoute({ ...newRoute, routeName: e.target.value })} required
                        />
                        <input
                            type="text" placeholder="Vehicle Number (e.g. KA-01-AB-1234)"
                            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newRoute.vehicleNumber} onChange={e => setNewRoute({ ...newRoute, vehicleNumber: e.target.value })} required
                        />
                        <input
                            type="text" placeholder="Driver Name"
                            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newRoute.driverName} onChange={e => setNewRoute({ ...newRoute, driverName: e.target.value })} required
                        />
                        <input
                            type="text" placeholder="Driver Phone"
                            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newRoute.driverPhone} onChange={e => setNewRoute({ ...newRoute, driverPhone: e.target.value })} required
                        />
                        <textarea
                            placeholder="Areas Covered (comma separated)"
                            className="col-span-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newRoute.routeAreas} onChange={e => setNewRoute({ ...newRoute, routeAreas: e.target.value })}
                        ></textarea>
                        <div className="col-span-full flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg">Save Route</button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Routes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map(route => (
                    <div key={route.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-orange-800 dark:text-orange-300">{route.routeName}</h3>
                                <div className="text-sm text-gray-500 font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded inline-block mt-1 shadow-sm">
                                    {route.vehicleNumber}
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                                <FaBus />
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="flex items-start gap-3">
                                <FaUserTie className="text-gray-400 mt-1" />
                                <div>
                                    <div className="text-sm font-semibold dark:text-white">{route.driverName}</div>
                                    <div className="text-xs text-gray-500">{route.driverPhone}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {route.routeAreas}
                                </div>
                            </div>

                            {user.role === 'ADMIN' && (
                                <button
                                    onClick={() => handleDelete(route.id)}
                                    className="w-full mt-2 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <FaTrash /> Remove Route
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Transport;
