import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaPenNib, FaHeart, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b pb-6 dark:border-gray-700">
                <div>
                    <h1 className="text-4xl font-serif font-black flex items-center gap-3 text-gray-800 dark:text-gray-100 italic">
                        The VPS Chronicles <FaPenNib className="text-2xl text-red-600" />
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-serif">Student Voices, Stories & Creativity</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-black dark:bg-white dark:text-black text-white rounded-full font-bold hover:scale-105 transition-transform"
                >
                    Write an Article
                </button>
            </header>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-8 rounded-none border border-gray-200 shadow-xl mb-12">
                    <h2 className="text-xl font-bold mb-6 font-serif">Submit New Article</h2>
                    <form onSubmit={handlePublish} className="space-y-6">
                        <input
                            className="w-full text-3xl font-bold border-b-2 border-gray-200 focus:border-red-600 outline-none p-2 bg-transparent dark:text-white font-serif placeholder-gray-300"
                            placeholder="Enter a catchy title..."
                            value={title} onChange={e => setTitle(e.target.value)} required
                        />
                        <textarea
                            className="w-full h-64 p-4 border rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 font-serif leading-relaxed text-lg resize-none focus:ring-2 focus:ring-gray-200 outline-none"
                            placeholder="Start writing your story here..."
                            value={content} onChange={e => setContent(e.target.value)} required
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500">Discard</button>
                            <button type="submit" className="px-8 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">Publish</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-12">
                {posts.map((post, idx) => (
                    <article key={post.id} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <FaUserCircle className="text-lg" />
                            <span className="font-bold text-gray-800 dark:text-gray-200">{post.author?.name}</span>
                            <span>•</span>
                            <span>Class {post.author?.className}</span>
                            <span>•</span>
                            <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                        </div>

                        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white leading-tight hover:text-red-700 transition-colors cursor-pointer">
                            {post.title}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300 text-lg font-serif leading-relaxed line-clamp-4">
                            {post.content}
                        </p>

                        <div className="flex items-center gap-6 pt-4 border-t w-full border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => handleLike(post.id)}
                                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group"
                            >
                                <FaHeart className={post.likes > 0 ? "text-red-500" : "group-hover:scale-125 transition-transform"} />
                                <span className="font-medium">{post.likes} Likes</span>
                            </button>
                            <button className="text-blue-600 hover:underline font-medium text-sm">Read Full Story</button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default SchoolBlog;
