import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaImage, FaUpload, FaLink, FaTimes, FaCamera, FaSearch, FaCloudUploadAlt } from 'react-icons/fa';
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
    const [previewUrl, setPreviewUrl] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);

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

    // Client-side compression to avoid 500 payload too large error
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Max dimensions
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG at 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsCompressing(true);
            try {
                const compressedDataUrl = await compressImage(file);
                setPreviewUrl(compressedDataUrl);
                setNewImage({ ...newImage, imageUrl: compressedDataUrl });
            } catch (err) {
                console.error("Compression error", err);
                alert("Failed to process image");
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

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
                setPreviewUrl('');
                setShowUpload(false);
                fetchImages();
                alert("Image uploaded successfully!");
            } else {
                const errText = await response.text();
                console.error("Server Error:", errText);
                alert("Upload failed. The server might be rejecting the file size. Try a smaller image.");
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
        <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto space-y-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-200 dark:border-gray-800 pb-8">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 flex items-center justify-center md:justify-start gap-4">
                        <FaCamera className="text-emerald-600 dark:text-emerald-400" />
                        VPS Gallery
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 text-lg">
                        Capturing Moments, Creating Memories
                    </p>
                </div>

                {user.role === 'ADMIN' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUpload(!showUpload)}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-bold shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
                    >
                        {showUpload ? <FaTimes /> : <FaUpload />}
                        {showUpload ? 'Close Upload' : 'Upload Photo'}
                    </motion.button>
                )}
            </header>

            {/* Upload Section */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-2xl mb-12 relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <span className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <FaCloudUploadAlt className="text-2xl" />
                                </span>
                                Upload New Memory
                            </h2>

                            <form onSubmit={handleUpload} className="space-y-8">
                                {/* Upload Mode Toggle */}
                                <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-2xl w-full md:w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setUploadMode('url')}
                                        className={`flex-1 md:flex-none px-6 py-2 rounded-xl font-bold text-sm transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Image Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMode('file')}
                                        className={`flex-1 md:flex-none px-6 py-2 rounded-xl font-bold text-sm transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Local File
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        {/* Image Input Area */}
                                        {uploadMode === 'url' ? (
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Image URL</label>
                                                <div className="relative">
                                                    <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="url"
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={newImage.imageUrl}
                                                        onChange={e => setNewImage({ ...newImage, imageUrl: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                />
                                                <div className={`
                                                    border-3 border-dashed rounded-3xl p-10 text-center transition-all duration-300
                                                    ${previewUrl ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50/30'}
                                                `}>
                                                    {isCompressing ? (
                                                        <div className="py-8">
                                                            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                                            <p className="text-emerald-600 font-bold">Compressing Image...</p>
                                                        </div>
                                                    ) : previewUrl ? (
                                                        <div className="relative">
                                                            <img src={previewUrl} alt="Preview" className="h-48 mx-auto rounded-xl shadow-lg object-cover" />
                                                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                                                                <FaCloudUploadAlt /> Ready to Upload
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="py-6">
                                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                                <FaUpload className="text-2xl text-gray-400 group-hover:text-emerald-500" />
                                                            </div>
                                                            <p className="text-gray-900 dark:text-gray-100 font-bold text-lg">Click to Upload</p>
                                                            <p className="text-gray-500 text-sm mt-1">SVG, PNG, JPG or GIF</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Category</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white appearance-none"
                                                    value={newImage.category}
                                                    onChange={e => setNewImage({ ...newImage, category: e.target.value })}
                                                >
                                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Title</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                                    placeholder="e.g. Sports Day"
                                                    value={newImage.title}
                                                    onChange={e => setNewImage({ ...newImage, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-full">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">Description</label>
                                        <textarea
                                            className="w-full flex-1 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white resize-none"
                                            placeholder="Write a caption..."
                                            value={newImage.description}
                                            onChange={e => setNewImage({ ...newImage, description: e.target.value })}
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading || isCompressing}
                                            className="mt-6 w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Publishing...' : 'Publish to Gallery'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${activeCategory === cat
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20">
                <AnimatePresence>
                    {filteredImages.map((img, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            key={img.id || idx}
                            className="break-inside-avoid relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={img.imageUrl}
                                    alt={img.title}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">

                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="inline-block px-3 py-1 bg-emerald-500/90 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest mb-3">
                                            {img.category}
                                        </span>
                                        <h3 className="text-white text-xl font-bold leading-tight mb-2">{img.title}</h3>
                                        {img.description && (
                                            <p className="text-gray-200 text-sm line-clamp-2 leading-relaxed opacity-90">{img.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20 text-xs text-gray-300">
                                        <span>{new Date(img.uploadDate || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredImages.length === 0 && !loading && (
                <div className="text-center py-24">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaImage className="text-4xl text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No memories found</h3>
                    <p className="text-gray-500 dark:text-gray-500 mt-2">Be the first to upload a photo in this category!</p>
                </div>
            )}
        </div>
    );
};

export default Gallery;
