import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaPenNib, FaHeart, FaUserCircle, FaTrash, FaEdit, FaDownload, FaSave, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SchoolBlog = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // New Post
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Edit Post
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/blog`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Error fetching posts", error);
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                content,
                author: { id: user.id }
            };

            const response = await fetch(`${API_BASE_URL}/api/blog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowForm(false);
                setTitle('');
                setContent('');
                fetchPosts();
            }
        } catch (error) {
            console.error("Error publishing post", error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: editingPost.title,
                content: editingPost.content
            };

            const response = await fetch(`${API_BASE_URL}/api/blog/${editingPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setEditingPost(null);
                fetchPosts();
                alert("Post updated successfully!");
            }
        } catch (error) {
            console.error("Error updating post", error);
            alert("Failed to update post.");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this chronicle?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setPosts(posts.filter(p => p.id !== id));
            } else {
                alert("Failed to delete post.");
            }
        } catch (error) {
            console.error("Error deleting post", error);
            alert("Error deleting post.");
        }
    };

    const handleDownload = (post) => {
        const element = document.createElement("div");
        element.innerHTML = `
            <div style="padding: 40px; font-family: 'Times New Roman', serif; color: #333; background: #fffbeeb0;">
                <h1 style="font-size: 32px; color: #d32f2f; margin-bottom: 10px;">${post.title}</h1>
                <p style="font-size: 14px; color: #666; font-style: italic; margin-bottom: 20px;">By ${post.author?.name} | Class ${post.author?.className}</p>
                <div style="font-size: 16px; line-height: 1.6;">${post.content.replace(/\n/g, '<br/>')}</div>
                <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">Vision Public School Chronicle</p>
            </div>
        `;
        document.body.appendChild(element);

        html2canvas(element).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${post.title.replace(/\s+/g, '_')}_Chronicle.pdf`);
            document.body.removeChild(element);
        });
    };

    const handleLike = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/blog/${id}/like`, { method: 'POST' });
            fetchPosts();
        } catch (error) {
            console.error("Error liking post", error);
        }
    };

    const canEdit = (post) => user && (user.role === 'ADMIN' || (post.author && post.author.id === user.id));

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 min-h-screen">
            <header className="relative flex flex-col md:flex-row justify-between items-center pb-8 border-b-0">
                {/* Decorative Background Blob */}
                <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-serif font-black flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 italic tracking-tighter">
                        The Chronicle <FaPenNib className="text-4xl text-red-600 rotate-12" />
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 font-serif text-lg tracking-wide border-l-4 border-red-500 pl-3">
                        Where <span className="font-bold text-red-600">Student Voices</span> Echo
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(220, 38, 38, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className="relative z-10 px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full font-bold shadow-xl flex items-center gap-2 mt-6 md:mt-0 overflow-hidden group"
                >
                    <span className="relative z-10">Pen a Story</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </motion.button>
            </header>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card mb-12 relative" style={{ padding: '25px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                            <h2 style={{ marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>
                                Draft Your Masterpiece
                            </h2>
                            <form onSubmit={handlePublish} className="space-y-6">
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Headline</label>
                                    <textarea
                                        className="glass-input resize-none overflow-hidden"
                                        placeholder="An Epic Title..."
                                        rows="2"
                                        value={title} onChange={e => setTitle(e.target.value)} required
                                        style={{ fontSize: '18px', fontWeight: 'bold' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Story Content</label>
                                    <textarea
                                        className="glass-input resize-none"
                                        style={{ height: '300px', fontFamily: 'serif', fontSize: '16px', lineHeight: '1.6' }}
                                        placeholder="Once upon a time in the corridors of VPS..."
                                        value={content} onChange={e => setContent(e.target.value)} required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm">Discard Draft</button>
                                    <button type="submit" className="glass-btn px-8">Publish Now</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-12">
                {posts.map((post, idx) => (
                    <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative"
                    >
                        {/* Connecting Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -z-10 group-last:hidden"></div>

                        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border border-white/60 dark:border-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-500 group-hover:-translate-y-2 relative">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Author Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
                                        <FaUserCircle className="text-2xl text-red-600 dark:text-red-400" />
                                    </div>
                                </div>

                                <div className="flex-grow space-y-4">
                                    <div className="flex flex-wrap items-center justify-between">
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                                            <span className="text-red-600 dark:text-red-400">By {post.author?.name}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>Class {post.author?.className}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{new Date(post.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownload(post)}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Download PDF"
                                            >
                                                <FaDownload />
                                            </button>
                                            {canEdit(post) && (
                                                <>
                                                    <button
                                                        onClick={() => setEditingPost({ ...post })}
                                                        className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                                                        title="Edit Post"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(post.id, e)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete Post"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white leading-tight cursor-pointer group-hover:text-red-700 transition-colors">
                                        {post.title}
                                    </h2>

                                    <div className="text-gray-700 dark:text-gray-300 text-lg md:text-xl font-serif leading-relaxed opacity-90 whitespace-pre-line">
                                        {post.content}
                                    </div>

                                    <div className="pt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50">
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => handleLike(post.id)}
                                            className="flex items-center gap-2.5 px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <motion.div
                                                animate={post.likes > 0 ? { scale: [1, 1.2, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <FaHeart className={`text-xl ${post.likes > 0 ? "text-red-500 drop-shadow-lg" : "text-gray-400"}`} />
                                            </motion.div>
                                            <span className={`font-bold ${post.likes > 0 ? "text-red-600" : "text-gray-500"}`}>{post.likes}</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.article>
                ))}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingPost && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card w-full max-w-2xl relative bg-white dark:bg-gray-900"
                            style={{ padding: '30px' }}
                        >
                            <button
                                onClick={() => setEditingPost(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                            >
                                <FaTimes size={20} />
                            </button>

                            <h3 className="text-2xl font-serif font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaEdit className="text-red-500" /> Edit Chronicle
                            </h3>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Headline</label>
                                    <textarea
                                        className="glass-input resize-none overflow-hidden w-full font-serif font-bold text-xl"
                                        rows="2"
                                        value={editingPost.title}
                                        onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Story Content</label>
                                    <textarea
                                        className="glass-input resize-none w-full font-serif text-lg leading-relaxed"
                                        style={{ height: '300px' }}
                                        value={editingPost.content}
                                        onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPost(null)}
                                        className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-red-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <FaSave /> Save Changes
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

export default SchoolBlog;
