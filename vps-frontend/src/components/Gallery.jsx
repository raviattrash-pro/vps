import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaImages, FaPlus, FaTimes, FaExpand } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null); // For Lightbox

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
        <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 tracking-tight">
                        <FaImages className="text-pink-500" /> VPS Gallery
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Capturing Moments, Creating Memories</p>
                </div>
                {user.role === 'ADMIN' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-pink-500/30 flex items-center gap-2"
                    >
                        <FaPlus /> Upload Photo
                    </motion.button>
                )}
            </header>

            {/* Category Filter */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${filter === cat
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20 transform scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Upload Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                        <div className="glass-panel p-8 rounded-3xl border border-pink-100 dark:border-pink-900/30 shadow-xl">
                            <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text" placeholder="Image URL (e.g. https://...)" className="col-span-full p-4 border rounded-xl bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                                    value={newImage.imageUrl} onChange={e => setNewImage({ ...newImage, imageUrl: e.target.value })} required
                                />
                                <input
                                    type="text" placeholder="Title" className="p-4 border rounded-xl bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-pink-500/50 outline-none"
                                    value={newImage.title} onChange={e => setNewImage({ ...newImage, title: e.target.value })} required
                                />
                                <select className="p-4 border rounded-xl bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-pink-500/50 outline-none" value={newImage.category} onChange={e => setNewImage({ ...newImage, category: e.target.value })}>
                                    <option value="Sports">Sports</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Campus">Campus</option>
                                </select>
                                <textarea
                                    placeholder="Description" className="col-span-full p-4 border rounded-xl bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-pink-500/50 outline-none h-32 resize-none"
                                    value={newImage.description} onChange={e => setNewImage({ ...newImage, description: e.target.value })}
                                ></textarea>
                                <div className="col-span-full flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-2 bg-pink-600 text-white font-bold rounded-lg shadow-lg hover:bg-pink-700">Upload</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gallery Grid */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredImages.map((img, idx) => (
                        <motion.div
                            key={img.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="group relative rounded-2xl overflow-hidden shadow-lg h-72 cursor-pointer bg-gray-100 dark:bg-gray-800"
                            onClick={() => setSelectedImage(img)}
                        >
                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <span className="inline-block px-2 py-1 bg-pink-500/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-md mb-2 w-max shadow-sm">{img.category}</span>
                                <h3 className="text-white font-bold text-xl leading-tight mb-1">{img.title}</h3>
                                <p className="text-gray-300 text-sm line-clamp-2">{img.description}</p>
                                <div className="absolute top-4 right-4 text-white p-2 bg-white/20 backdrop-blur-md rounded-full transform translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                                    <FaExpand />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredImages.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <FaImages className="text-6xl mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-medium">No images found in this category.</p>
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
                            onClick={e => e.stopPropagation()} // Prevent close on content click
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <FaTimes className="text-2xl" />
                            </button>

                            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />

                            <div className="w-full bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-b-2xl mt-4 text-white">
                                <span className="text-pink-400 font-bold text-xs uppercase tracking-wider">{selectedImage.category}</span>
                                <h2 className="text-2xl font-bold mt-1">{selectedImage.title}</h2>
                                <p className="text-gray-300 mt-2 text-lg font-light leading-relaxed">{selectedImage.description}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
