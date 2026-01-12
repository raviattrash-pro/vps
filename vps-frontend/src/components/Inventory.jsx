import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaBoxes, FaLaptop, FaFlask, FaChair, FaPlus, FaTrash, FaSearch, FaDumbbell, FaExclamationTriangle, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory = () => {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newAsset, setNewAsset] = useState({
        itemName: '', category: 'Furniture', quantity: 1, purchaseDate: '', status: 'AVAILABLE'
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/assets`);
            if (response.ok) {
                const data = await response.json();
                setAssets(data);
            }
        } catch (error) {
            console.error("Error fetching assets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAsset)
            });

            if (response.ok) {
                setShowForm(false);
                setNewAsset({ itemName: '', category: 'Furniture', quantity: 1, purchaseDate: '', status: 'AVAILABLE' });
                fetchAssets();
            }
        } catch (error) {
            console.error("Error adding asset", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this asset?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/assets/${id}`, { method: 'DELETE' });
            fetchAssets();
        } catch (error) {
            console.error("Error deleting asset", error);
        }
    };

    const getIcon = (cat) => {
        switch (cat) {
            case 'IT': return <FaLaptop className="text-cyan-500" />;
            case 'Lab': return <FaFlask className="text-purple-500" />;
            case 'Sports': return <FaDumbbell className="text-orange-500" />;
            default: return <FaChair className="text-amber-600" />;
        }
    };

    const filteredAssets = assets.filter(a => a.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Stats
    const totalItems = assets.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStock = assets.filter(a => a.quantity < 5).length;
    const damaged = assets.filter(a => a.status === 'DAMAGED').length;

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className={`p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4`}>
            <div className={`p-4 rounded-xl bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400 text-2xl`}>
                <Icon />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white leading-tight">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                        <FaBoxes className="text-cyan-600 dark:text-cyan-400" /> Asset & Inventory
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Track Equipment, Supplies, and Infrastructure</p>
                </div>
                {user.role === 'ADMIN' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2"
                    >
                        <FaPlus /> Registry Entry
                    </motion.button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Inventory Count" value={totalItems} icon={FaClipboardList} color="blue" />
                <StatCard label="Low Stock Alerts" value={lowStock} icon={FaExclamationTriangle} color="orange" />
                <StatCard label="Damaged / Repairs" value={damaged} icon={FaTrash} color="red" />
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card mb-8" style={{ padding: '25px', maxWidth: '1000px', margin: '0 auto' }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>New Asset Registration</h3>
                            <form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Item Name</label>
                                    <input
                                        className="glass-input"
                                        value={newAsset.itemName} onChange={e => setNewAsset({ ...newAsset, itemName: e.target.value })} required placeholder="e.g. Projector X1"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Category</label>
                                    <select
                                        className="glass-input"
                                        style={{ appearance: 'none' }}
                                        value={newAsset.category} onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                                    >
                                        <option value="Furniture">Furniture</option>
                                        <option value="IT">IT / Electronics</option>
                                        <option value="Lab">Lab Equipment</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Quantity</label>
                                    <input
                                        type="number" className="glass-input"
                                        value={newAsset.quantity} onChange={e => setNewAsset({ ...newAsset, quantity: parseInt(e.target.value) })} required min="1"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Status</label>
                                    <select
                                        className="glass-input"
                                        style={{ appearance: 'none' }}
                                        value={newAsset.status} onChange={e => setNewAsset({ ...newAsset, status: e.target.value })}
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="DAMAGED">Damaged</option>
                                        <option value="LOST">Lost / Missing</option>
                                    </select>
                                </div>

                                <div className="lg:col-span-4 flex justify-end gap-4 mt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500 hover:text-gray-700 font-bold text-sm">Cancel</button>
                                    <button type="submit" className="glass-btn px-8">Save to Registry</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search */}
            <div className="relative max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="Search inventory..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-6">Item Details</th>
                            <th className="p-6">Category</th>
                            <th className="p-6 text-center">Stock Level</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        <AnimatePresence>
                            {filteredAssets.map(asset => (
                                <motion.tr
                                    layout
                                    exit={{ opacity: 0 }}
                                    key={asset.id}
                                    className="hover:bg-cyan-50/30 dark:hover:bg-gray-700/30 transition-colors group"
                                >
                                    <td className="p-6">
                                        <span className="font-bold text-gray-900 dark:text-white text-lg block">{asset.itemName}</span>
                                        <span className="text-xs text-gray-400">Purchased: {asset.purchaseDate || 'N/A'}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-lg">
                                                {getIcon(asset.category)}
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">{asset.category}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`inline-block px-4 py-1 rounded-lg font-mono font-bold ${asset.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                            {asset.quantity}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-bold border ${asset.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-200' :
                                            asset.status === 'DAMAGED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${asset.status === 'AVAILABLE' ? 'bg-green-500' :
                                                asset.status === 'DAMAGED' ? 'bg-red-500' : 'bg-gray-500'
                                                }`}></span>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        {user.role === 'ADMIN' && (
                                            <button
                                                onClick={() => handleDelete(asset.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Asset"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredAssets.length === 0 && (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <FaBoxes className="text-6xl mb-4 opacity-20" />
                        <p>No inventory items match your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
