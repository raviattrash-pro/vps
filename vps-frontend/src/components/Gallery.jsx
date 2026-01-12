import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaImages, FaPlus, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('All');

    const [newImage, setNewImage] = useState({
        imageUrl: '',
        title: '',
        description: '',
        category: 'Sports'
    });

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/gallery`);
            if (response.ok) {
                const data = await response.json();
                setImages(data);
            }
        } catch (error) {
            console.error("Error fetching images", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/gallery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newImage)
            });

            if (response.ok) {
                setShowForm(false);
                setNewImage({ imageUrl: '', title: '', description: '', category: 'Sports' });
                fetchImages();
            }
        } catch (error) {
            console.error("Error adding image", error);
        }
    };

    const categories = ['All', 'Sports', 'Cultural', 'Academic', 'Campus'];
    const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-pink-600 dark:text-pink-400">
                        <FaImages /> Event Gallery
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Memories from VPS</p>
                </div>
                {user.role === 'ADMIN' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                    >
                        <FaPlus /> Upload Photo
                    </button>
                )}
            </header>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Upload Form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 rounded-2xl overflow-hidden mb-6">
                    <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="Image URL (e.g. https://...)" className="col-span-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newImage.imageUrl} onChange={e => setNewImage({ ...newImage, imageUrl: e.target.value })} required
                        />
                        <input
                            type="text" placeholder="Title" className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newImage.title} onChange={e => setNewImage({ ...newImage, title: e.target.value })} required
                        />
                        <select className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newImage.category} onChange={e => setNewImage({ ...newImage, category: e.target.value })}>
                            <option value="Sports">Sports</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Academic">Academic</option>
                            <option value="Campus">Campus</option>
                        </select>
                        <textarea
                            placeholder="Description" className="col-span-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={newImage.description} onChange={e => setNewImage({ ...newImage, description: e.target.value })}
                        ></textarea>
                        <div className="col-span-full flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-pink-600 text-white rounded-lg">Upload</button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredImages.map(img => (
                        <motion.div
                            key={img.id}
                            layout
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="group relative rounded-xl overflow-hidden shadow-lg h-64 cursor-pointer"
                        >
                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <span className="text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">{img.category}</span>
                                <h3 className="text-white font-bold text-lg">{img.title}</h3>
                                <p className="text-gray-300 text-sm line-clamp-2">{img.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {filteredImages.length === 0 && <p className="text-center text-gray-500 py-12">No images found in this category.</p>}
        </div>
    );
};

export default Gallery;
