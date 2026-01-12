import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaPenNib, FaHeart, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SchoolBlog = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // New Post
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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

    const handleLike = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/blog/${id}/like`, { method: 'POST' });
            fetchPosts();
        } catch (error) {
            console.error("Error liking post", error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
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
                        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/50 dark:border-gray-700 p-8 rounded-3xl shadow-2xl mb-12 relative">
                            <h2 className="text-2xl font-bold mb-6 font-serif text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                                Draft Your Masterpiece
                            </h2>
                            <form onSubmit={handlePublish} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Headline</label>
                                    <input
                                        className="w-full text-4xl font-bold border-b-2 border-gray-200 dark:border-gray-600 focus:border-red-600 outline-none p-2 bg-transparent dark:text-white font-serif placeholder-gray-300/50 transition-colors"
                                        placeholder="An Epic Title..."
                                        value={title} onChange={e => setTitle(e.target.value)} required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Story Content</label>
                                    <textarea
                                        className="w-full h-80 p-6 border-none rounded-2xl bg-white/50 dark:bg-black/20 dark:text-gray-200 font-serif leading-relaxed text-lg resize-none focus:ring-4 focus:ring-red-500/10 outline-none shadow-inner"
                                        placeholder="Once upon a time in the corridors of VPS..."
                                        value={content} onChange={e => setContent(e.target.value)} required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium">Discard Draft</button>
                                    <button type="submit" className="px-10 py-3 bg-gray-900 dark:bg-white dark:text-black text-white font-bold rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all">Publish Now</button>
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

                        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border border-white/60 dark:border-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-500 group-hover:-translate-y-2">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Author Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
                                        <FaUserCircle className="text-2xl text-red-600 dark:text-red-400" />
                                    </div>
                                </div>

                                <div className="flex-grow space-y-4">
                                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                                        <span className="text-red-600 dark:text-red-400">By {post.author?.name}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>Class {post.author?.className}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>{new Date(post.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white leading-tight cursor-pointer group-hover:text-red-700 transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl font-serif leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500 opacity-90">
                                        {post.content}
                                    </p>

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

                                        <button className="text-sm font-bold text-gray-900 dark:text-white border-b-2 border-black dark:border-white hover:border-red-500 hover:text-red-600 transition-all pb-0.5">
                                            Read Full Chronicle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    );
};

export default SchoolBlog;
