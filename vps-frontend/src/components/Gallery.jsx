import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaImage, FaUpload, FaLink, FaTimes, FaCamera, FaSearch, FaCloudUploadAlt, FaSpinner, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Campus',
        description: '',
        imageUrl: '',
        file: null
    });

    const [previewUrl, setPreviewUrl] = useState('');

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, imageUrl: url });
        setPreviewUrl(url);
    };

    const clearForm = () => {
        setFormData({
            title: '',
            category: 'Campus',
            description: '',
            imageUrl: '',
            file: null
        });
        setPreviewUrl('');
        setUploading(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!formData.title || (!formData.file && !formData.imageUrl)) {
            alert("Please provide a title and an image (File or URL).");
            return;
        }

        setUploading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('description', formData.description);

        if (uploadMode === 'file' && formData.file) {
            data.append('file', formData.file);
        } else if (uploadMode === 'url' && formData.imageUrl) {
            data.append('imageUrl', formData.imageUrl);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/gallery`, {
                method: 'POST',
                body: data, // No Content-Type header manually set for FormData
            });

            if (response.ok) {
                await fetchImages();
                clearForm();
                setShowUpload(false);
                // Optional: Show success toast
            } else {
                const errText = await response.text();
                console.error("Server Error:", errText);
                alert("Upload failed. " + errText);
            }
        } catch (error) {
            console.error("Error uploading image", error);
            alert("Upload failed due to network error.");
        } finally {
            setUploading(false);
        }
    };

    // Categories
    const categories = ['All', 'Campus', 'Sports', 'Cultural', 'Academic', 'Events'];
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter(img => img.category === activeCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 mb-2"
                        >
                            <span className="flex items-center gap-3 justify-center md:justify-start">
                                <FaCamera className="text-emerald-600 dark:text-emerald-400" />
                                VPS Gallery
                            </span>
                        </motion.h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            Capturing the spirit of Vision Public School
                        </p>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUpload(!showUpload)}
                            className={`
                                px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 text-white
                                ${showUpload
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30 hover:shadow-emerald-500/40'}
                            `}
                        >
                            {showUpload ? <><FaTimes /> Close</> : <><FaUpload /> Upload Photo</>}
                        </motion.button>
                    )}
                </div>

                {/* Upload Modal / Section */}
                <AnimatePresence>
                    {showUpload && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-16"
                        >
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                                <div className="relative z-10 max-w-4xl mx-auto">
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                            <FaCloudUploadAlt size={24} />
                                        </div>
                                        Upload New Memory
                                    </h2>

                                    <form onSubmit={handleUpload} className="space-y-8">
                                        {/* Toggle Type */}
                                        <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl w-fit">
                                            <button
                                                type="button"
                                                onClick={() => setUploadMode('url')}
                                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                            >
                                                Image Link
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadMode('file')}
                                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                            >
                                                Upload File
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Left Column: Image Input */}
                                            <div className="space-y-6">
                                                <div className={`
                                                    border-3 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group
                                                    ${previewUrl ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                                                `}>
                                                    {previewUrl ? (
                                                        <>
                                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setPreviewUrl(''); setFormData({ ...formData, file: null, imageUrl: '' }); }}
                                                                    className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        uploadMode === 'file' ? (
                                                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-6">
                                                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                                    <FaUpload className="text-2xl text-emerald-600 dark:text-emerald-400" />
                                                                </div>
                                                                <p className="text-gray-900 dark:text-white font-bold text-lg">Click to browse</p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">supports JPG, PNG, WEBP</p>
                                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                                            </label>
                                                        ) : (
                                                            <div className="w-full px-8">
                                                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                                                                    <FaLink className="text-2xl text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                                <input
                                                                    type="url"
                                                                    placeholder="Paste image URL here..."
                                                                    value={formData.imageUrl}
                                                                    onChange={handleUrlChange}
                                                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column: Details */}
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Title</label>
                                                    <input
                                                        type="text"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                                                        placeholder="e.g. Annual Sports Day 2024"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Category</label>
                                                    <select
                                                        value={formData.category}
                                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all appearance-none"
                                                    >
                                                        {categories.filter(c => c !== 'All').map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Description</label>
                                                    <textarea
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all resize-none h-24"
                                                        placeholder="Brief description of the memory..."
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={uploading || (!formData.file && !formData.imageUrl)}
                                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                                                >
                                                    {uploading ? (
                                                        <><FaSpinner className="animate-spin" /> Uploading...</>
                                                    ) : (
                                                        <><FaCheckCircle /> Publish Memory</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300
                                ${activeCategory === cat
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        <AnimatePresence>
                            {filteredImages.map((img, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    key={img.id || idx}
                                    className="break-inside-avoid relative group rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="relative">
                                        <img
                                            src={img.imageUrl}
                                            alt={img.title}
                                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <span className="inline-block px-3 py-1 bg-emerald-500/90 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest mb-3">
                                                    {img.category}
                                                </span>
                                                <h3 className="text-white text-xl font-bold leading-tight mb-2">{img.title}</h3>
                                                {img.description && (
                                                    <p className="text-gray-200 text-sm line-clamp-3">{img.description}</p>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/20 text-xs text-gray-300 font-medium">
                                                {new Date(img.uploadDate || Date.now()).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredImages.length === 0 && (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaImage className="text-4xl text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No memories found</h3>
                        <p className="text-gray-500 mt-2">Check back later or upload a new photo!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
