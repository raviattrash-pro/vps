import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaImage, FaUpload, FaLink, FaTimes, FaCamera, FaCloudUploadAlt, FaSpinner, FaCheckCircle, FaTrash, FaEdit, FaDownload, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
    const [uploading, setUploading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Campus',
        description: '',
        imageUrl: '',
        file: null
    });

    const [previewUrl, setPreviewUrl] = useState('');

    // Edit State
    const [editingImage, setEditingImage] = useState(null);

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

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent modal opening if we had one
        if (!window.confirm("Are you sure you want to delete this memory?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setImages(images.filter(img => img.id !== id));
            } else {
                alert("Failed to delete image.");
            }
        } catch (error) {
            console.error("Error deleting image", error);
            alert("Delete failed due to error.");
        }
    };

    const handleStartEdit = (image) => {
        setEditingImage({ ...image });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const data = new FormData();
        data.append('title', editingImage.title);
        data.append('category', editingImage.category);
        data.append('description', editingImage.description);

        try {
            // Using FormData just to be consistent, but Controller expects RequestParams for update currently.
            // Actually, my backend update implementation uses @RequestParam, so FormData or URLSearchParams works.
            // Let's use URLSearchParams or simple fetch with params in URL to be safe with the current backend signature
            // which doesn't explicitly consume Multipart for update, just params.
            // WAit, I defined it to accept params. Let's stick to standard fetch params for safety.

            const params = new URLSearchParams();
            params.append('title', editingImage.title);
            params.append('category', editingImage.category);
            params.append('description', editingImage.description);

            const response = await fetch(`${API_BASE_URL}/api/gallery/${editingImage.id}?${params.toString()}`, {
                method: 'PUT',
            });

            if (response.ok) {
                const updated = await response.json();
                setImages(images.map(img => img.id === updated.id ? updated : img));
                setEditingImage(null);
                alert("Updated successfully!");
            } else {
                alert("Update failed.");
            }
        } catch (error) {
            console.error("Error updating", error);
            alert("Update failed.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDownload = async (imageUrl, title) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title.replace(/\s+/g, '_')}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
            window.open(imageUrl, '_blank'); // Fallback
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
        <div className="gallery-page min-h-screen relative overflow-hidden" style={{ padding: '0 20px 100px 20px' }}>
            {/* Canvas Background Effect */}
            <div className="absolute inset-0 z-[-1] opacity-30 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                    backgroundAttachment: 'fixed'
                }}>
            </div>

            {/* Header */}
            <div className="header sticky top-0 z-30 backdrop-blur-md bg-white/30 dark:bg-gray-900/30 pt-6 pb-4 mb-8 -mx-5 px-5 border-b border-white/20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.history.back()}>
                            <FaCamera className="text-emerald-600 dark:text-emerald-400 text-xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">VPS Virtual Gallery</h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Capturing Moments</p>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar max-w-full">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border
                                    ${activeCategory === cat
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                        : 'bg-white/40 border-white/40 hover:bg-white hover:border-white text-gray-600 dark:text-gray-300 backdrop-blur-sm'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upload Section (Admin Only) */}
            <AnimatePresence>
                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="glass-card mb-12 relative overflow-hidden group"
                        style={{ padding: '30px', maxWidth: '800px', margin: '0 auto 50px auto' }}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaCloudUploadAlt size={100} />
                        </div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                                Curate New Memory
                            </h3>
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('url')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2
                                        ${uploadMode === 'url' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}
                                >
                                    <FaLink /> Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('file')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2
                                        ${uploadMode === 'file' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}
                                >
                                    <FaUpload /> File
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Upload Box */}
                                <div className="md:col-span-1 aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 transition-colors bg-white/30 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center relative overflow-hidden cursor-pointer"
                                    onClick={() => !previewUrl && uploadMode === 'file' && document.getElementById('galleryFileInput').click()}>

                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setPreviewUrl(''); setFormData({ ...formData, file: null, imageUrl: '' }); }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 z-10"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            {uploadMode === 'file' ? (
                                                <>
                                                    <FaCloudUploadAlt size={32} className="mx-auto mb-2 text-emerald-500" />
                                                    <p className="text-xs font-bold text-gray-500">Tap to Upload</p>
                                                    <input type="file" id="galleryFileInput" accept="image/*" className="hidden" onChange={handleFileChange} />
                                                </>
                                            ) : (
                                                <div className="w-full">
                                                    <FaLink size={32} className="mx-auto mb-2 text-blue-500" />
                                                    <input
                                                        type="url"
                                                        placeholder="Paste URL..."
                                                        value={formData.imageUrl}
                                                        onChange={handleUrlChange}
                                                        className="w-full bg-transparent border-b border-gray-400 focus:border-emerald-500 outline-none text-center text-xs py-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Fields */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Annual Fest 2025"
                                                className="glass-input w-full"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Category</label>
                                            <select
                                                className="glass-input w-full"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Description</label>
                                        <textarea
                                            placeholder="Capture the moment in words..."
                                            className="glass-input w-full h-24 resize-none"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="glass-btn w-full py-3 flex justify-center items-center gap-2 font-bold tracking-wide"
                            >
                                {uploading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                                {uploading ? 'Publishing...' : 'Publish to Gallery'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gallery Grid - Standard Grid for better arrangement */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {filteredImages.map((img, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                key={img.id || idx}
                                className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-900"
                            >
                                {/* Image */}
                                <div className="aspect-[4/5] overflow-hidden">
                                    <img
                                        src={img.imageUrl}
                                        alt={img.title}
                                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300"></div>

                                {/* Content Overlay */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="transform origin-left transition-all duration-300">
                                        <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-lg">
                                            {img.category}
                                        </span>
                                        <h3 className="text-white font-black text-xl leading-tight mb-2 drop-shadow-md">{img.title}</h3>
                                        {img.description && (
                                            <p className="text-gray-200 text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-2">
                                                {img.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons - Larger and clearer */}
                                    <div className="flex gap-3 mt-2 transition-opacity duration-300">
                                        <button
                                            onClick={() => handleDownload(img.imageUrl, img.title)}
                                            className="flex-1 py-3 px-4 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-1"
                                            title="Download Image"
                                        >
                                            <FaDownload size={14} /> Download
                                        </button>
                                        {canEdit && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStartEdit(img)}
                                                    className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all transform hover:-translate-y-1"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(img.id, e)}
                                                    className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all transform hover:-translate-y-1"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {!loading && filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-white/5 mb-4">
                            <FaImage size={40} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-bold">No photos in {activeCategory} yet.</p>
                        <p className="text-gray-500 text-sm mt-1">Be the first to capture this moment!</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card w-full max-w-lg relative bg-white dark:bg-gray-900"
                            style={{ padding: '30px' }}
                        >
                            <button
                                onClick={() => setEditingImage(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                            >
                                <FaTimes size={20} />
                            </button>

                            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaEdit className="text-blue-500" /> Edit Memory
                            </h3>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full"
                                        value={editingImage.title}
                                        onChange={e => setEditingImage({ ...editingImage, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Category</label>
                                    <select
                                        className="glass-input w-full"
                                        value={editingImage.category}
                                        onChange={e => setEditingImage({ ...editingImage, category: e.target.value })}
                                    >
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Description</label>
                                    <textarea
                                        className="glass-input w-full h-32 resize-none"
                                        value={editingImage.description}
                                        onChange={e => setEditingImage({ ...editingImage, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingImage(null)}
                                        className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        {updating ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
