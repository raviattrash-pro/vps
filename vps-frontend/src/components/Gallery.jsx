import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaImage, FaUpload, FaLink, FaTimes, FaCamera, FaCloudUploadAlt, FaSpinner, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
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
                alert("Memory published successfully!");
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

    const canEdit = user && (user.role === 'ADMIN');

    return (
        <div className="gallery-page" style={{ padding: '0 20px 100px 20px' }}>
            {/* Header */}
            <div className="header" style={{ padding: '0 0 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => window.history.back()}>
                        <FaCamera className="text-emerald-600 dark:text-emerald-400 text-xl" />
                    </div>
                    <h1 style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: 'bold' }}>VPS Gallery</h1>
                </div>
            </div>

            {/* Upload Section (Admin Only) */}
            {canEdit && (
                <div className="glass-card mb-8" style={{ padding: '25px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 'bold' }}>Upload New Memory</h3>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setUploadMode('url')}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2
                                    ${uploadMode === 'url'
                                        ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300'
                                        : 'bg-transparent border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 dark:border-gray-700 dark:text-gray-400'}`}
                            >
                                <FaLink /> Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadMode('file')}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2
                                    ${uploadMode === 'file'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-400 dark:text-emerald-300'
                                        : 'bg-transparent border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-500 dark:border-gray-700 dark:text-gray-400'}`}
                            >
                                <FaCloudUploadAlt /> File
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-6">
                        {/* Upload Box */}
                        <div className="upload-box relative group cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.3)', border: '2px dashed var(--primary-light)', borderRadius: '16px', padding: '30px', textAlign: 'center', transition: 'all 0.3s' }}>

                            {previewUrl ? (
                                <div className="relative h-64 w-full">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setPreviewUrl(''); setFormData({ ...formData, file: null, imageUrl: '' }); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 z-10"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ) : (
                                uploadMode === 'file' ? (
                                    <div onClick={() => document.getElementById('galleryFileInput').click()} className="h-full flex flex-col items-center justify-center">
                                        <FaCloudUploadAlt size={40} color="var(--primary)" className="mb-3" />
                                        <p className="font-medium text-gray-700 dark:text-gray-300">Click to Upload Photo</p>
                                        <p className="text-xs text-gray-500 mt-1">High quality images preferred</p>
                                        <input type="file" id="galleryFileInput" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <FaLink size={30} className="text-blue-500 mb-3" />
                                        <input
                                            type="url"
                                            placeholder="Paste image URL here..."
                                            value={formData.imageUrl}
                                            onChange={handleUrlChange}
                                            className="w-full max-w-md bg-transparent border-b border-gray-400 focus:border-emerald-500 outline-none text-center py-2"
                                        />
                                    </div>
                                )
                            )}
                        </div>

                        {/* Fields Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sports Day"
                                    className="glass-input"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Category</label>
                                <select
                                    className="glass-input appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Description</label>
                            <textarea
                                placeholder="Add a caption..."
                                className="glass-input"
                                style={{ height: '80px', resize: 'none' }}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="glass-btn w-full flex justify-center items-center gap-2"
                        >
                            {uploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
                            {uploading ? 'Publishing...' : 'Publish to Gallery'}
                        </button>
                    </form>
                </div>
            )}

            {/* Gallery Grid */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="flex overflow-x-auto pb-4 gap-3 mb-8 no-scrollbar md:justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all
                                ${activeCategory === cat
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-white/50 text-gray-600 hover:bg-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    <AnimatePresence>
                        {filteredImages.map((img, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={img.id || idx}
                                className="break-inside-avoid glass-card group overflow-hidden"
                                style={{ padding: '0', borderRadius: '16px' }}
                            >
                                <div className="relative">
                                    <img src={img.imageUrl} alt={img.title} className="w-full h-auto object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{img.category}</span>
                                        <h3 className="text-white font-bold text-lg">{img.title}</h3>
                                        {img.description && <p className="text-gray-300 text-sm line-clamp-2">{img.description}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {!loading && filteredImages.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <FaImage size={40} className="mx-auto mb-4 opacity-50" />
                        <p>No photos in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
