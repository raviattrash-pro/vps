import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaImage, FaUpload, FaLink, FaTimes, FaCamera, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
    const [showUpload, setShowUpload] = useState(false);

    // Form State
    const [newImage, setNewImage] = useState({
        imageUrl: '',
        title: '',
        category: 'Campus',
        description: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
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
            if (file.size > 5000000) { // 5MB limit
                alert("File size should be less than 5MB");
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                // In a real app, you'd upload to Cloudinary/S3 here and get a URL.
                // For this request, we'll send the Date URI if the backend supports text, 
                // or just alert the user if it fails.
                setNewImage({ ...newImage, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!newImage.imageUrl) {
            alert("Please provide an image URL or select a file.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/gallery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newImage)
            });

            if (response.ok) {
                setNewImage({ imageUrl: '', title: '', category: 'Campus', description: '' });
                setSelectedFile(null);
                setPreviewUrl('');
                setShowUpload(false);
                fetchImages();
            } else {
                alert("Upload failed. The server might not accept large files encoded as text. Please use an Image URL.");
            }
        } catch (error) {
            console.error("Error uploading image", error);
            alert("Upload failed. Check console.");
        }
    };

    // Masonry Grid Columns based on categories
    const categories = ['All', 'Campus', 'Sports', 'Cultural', 'Academic'];
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter(img => img.category === activeCategory);

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 transition-all">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 flex items-center gap-4 justify-center md:justify-start">
                        <FaCamera className="text-emerald-600 dark:text-emerald-400" /> VPS Gallery
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">Capturing Moments, Creating Memories</p>
                </div>

                {user.role === 'ADMIN' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUpload(!showUpload)}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-bold shadow-lg hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
                    >
                        {showUpload ? <FaTimes /> : <FaUpload />} {showUpload ? 'Close Upload' : 'Upload Photo'}
                    </motion.button>
                )}
            </header>

            {/* Upload Section */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-panel p-8 mb-12 border-t-4 border-emerald-500 relative">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaUpload className="text-emerald-500" /> Upload New Memory
                            </h2>

                            <form onSubmit={handleUpload} className="space-y-6">
                                {/* Upload Mode Toggle */}
                                <div className="flex gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setUploadMode('url')}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${uploadMode === 'url' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-2 ring-emerald-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        <FaLink /> Image Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMode('file')}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${uploadMode === 'file' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-2 ring-emerald-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        <FaImage /> Local File
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        {/* Image Input */}
                                        {uploadMode === 'url' ? (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                                                <input
                                                    type="url"
                                                    className="w-full p-4 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm"
                                                    placeholder="https://example.com/image.jpg"
                                                    value={newImage.imageUrl}
                                                    onChange={e => setNewImage({ ...newImage, imageUrl: e.target.value })}
                                                />
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-2xl p-8 text-center bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100/50 transition-colors cursor-pointer relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                                />
                                                <div className="pointer-events-none relative z-10">
                                                    {previewUrl ? (
                                                        <div className="relative">
                                                            <img src={previewUrl} alt="Preview" className="h-48 mx-auto rounded-lg shadow-lg object-cover" />
                                                            <p className="text-sm text-center mt-2 text-emerald-600 font-bold">Image Selected</p>
                                                        </div>
                                                    ) : (
                                                        <div className="py-4">
                                                            <FaUpload className="text-4xl text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                                            <p className="text-gray-500 dark:text-gray-400 font-medium">Click or Drag photo here</p>
                                                            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
                                                            <p className="text-[10px] text-amber-500 mt-2">* Large files may be rejected by server</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                                <select
                                                    className="w-full p-4 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm appearance-none"
                                                    value={newImage.category}
                                                    onChange={e => setNewImage({ ...newImage, category: e.target.value })}
                                                >
                                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-4 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm"
                                                    placeholder="e.g. Annual Sports Day"
                                                    value={newImage.title}
                                                    onChange={e => setNewImage({ ...newImage, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex flex-col">
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                            <textarea
                                                className="w-full p-4 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm h-full min-h-[150px] resize-none"
                                                placeholder="Tell the story behind this photo..."
                                                value={newImage.description}
                                                onChange={e => setNewImage({ ...newImage, description: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
                                        >
                                            Publish to Gallery
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-full font-medium transition-all transform ${activeCategory === cat ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 ga-6 space-y-6">
                <AnimatePresence>
                    {filteredImages.map((img, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            key={img.id || idx}
                            className="break-inside-avoid relative group rounded-2xl overflow-hidden mb-6 shadow-md hover:shadow-2xl transition-all"
                        >
                            <img
                                src={img.imageUrl}
                                alt={img.title}
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">{img.category}</span>
                                <h3 className="text-white text-xl font-bold leading-tight">{img.title}</h3>
                                {img.description && <p className="text-gray-200 text-sm mt-2 line-clamp-2">{img.description}</p>}
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-gray-400 text-xs">{new Date(img.uploadDate || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredImages.length === 0 && !loading && (
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaImage className="text-4xl text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-lg">No photos found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default Gallery;
