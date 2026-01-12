import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaBoxes, FaLaptop, FaFlask, FaChair, FaPlus, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Inventory = () => {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [newAsset, setNewAsset] = useState({
        itemName: '',
        category: 'Furniture',
        quantity: 1,
        purchaseDate: '',
        status: 'AVAILABLE'
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
            case 'IT': return <FaLaptop className="text-blue-500" />;
            case 'Lab': return <FaFlask className="text-purple-500" />;
            case 'Sports': return <FaBoxes className="text-green-500" />;
            default: return <FaChair className="text-brown-500" />;
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-cyan-700 dark:text-cyan-400">
                        <FaBoxes /> Inventory Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Track Assets & Stocks</p>
                </div>
                {user.role === 'ADMIN' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-colors flex items-center gap-2"
                    >
                        <FaPlus /> Add Item
                    </button>
                )}
            </header>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl border-t-4 border-cyan-600">
                    <form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text" placeholder="Item Name" className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newAsset.itemName} onChange={e => setNewAsset({ ...newAsset, itemName: e.target.value })} required
                        />
                        <select className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newAsset.category} onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}>
                            <option value="Furniture">Furniture</option>
                            <option value="IT">IT / Electronics</option>
                            <option value="Lab">Lab Equipment</option>
                            <option value="Sports">Sports</option>
                            <option value="Other">Other</option>
                        </select>
                        <input
                            type="number" placeholder="Quantity" className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newAsset.quantity} onChange={e => setNewAsset({ ...newAsset, quantity: parseInt(e.target.value) })} required
                        />
                        <input
                            type="date" placeholder="Purchase Date" className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newAsset.purchaseDate} onChange={e => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                        />
                        <select className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newAsset.status} onChange={e => setNewAsset({ ...newAsset, status: e.target.value })}>
                            <option value="AVAILABLE">Available</option>
                            <option value="DAMAGED">Damaged</option>
                            <option value="LOST">Lost / Missing</option>
                        </select>
                        <div className="flex justify-end gap-2 items-center">
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-cyan-700 text-white rounded-lg">Save Asset</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                        <tr>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-center">Quantity</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {assets.map(asset => (
                            <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-4 font-semibold dark:text-white text-gray-800">{asset.itemName}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {getIcon(asset.category)}
                                        <span className="text-gray-600 dark:text-gray-300">{asset.category}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center font-mono dark:text-gray-300">{asset.quantity}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                            asset.status === 'DAMAGED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {user.role === 'ADMIN' && (
                                        <button onClick={() => handleDelete(asset.id)} className="text-red-400 hover:text-red-600">
                                            <FaTrash />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {assets.length === 0 && <div className="p-8 text-center text-gray-400">No assets recorded.</div>}
            </div>
        </div>
    );
};

export default Inventory;
