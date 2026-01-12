import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaPaperPlane, FaReply, FaUserGraduate, FaChalkboardTeacher, FaComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AskDoubt = () => {
    const { user } = useAuth();
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState({ subject: 'General', question: '' });
    const [replyData, setReplyData] = useState({ doubtId: null, message: '' });

    const subjects = ['Maths', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'General'];

    useEffect(() => {
        fetchDoubts();
    }, []);

    const fetchDoubts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/doubts`);
            if (response.ok) {
                const data = await response.json();
                setDoubts(data);
            }
        } catch (error) {
            console.error("Error fetching doubts", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostDoubt = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newQuestion,
                student: { id: user.id } // Assume simple student mapping
            };

            const response = await fetch(`${API_BASE_URL}/api/doubts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setNewQuestion({ subject: 'General', question: '' });
                fetchDoubts();
            }
        } catch (error) {
            console.error("Error posting doubt", error);
        }
    };

    const handlePostReply = async (doubtId) => {
        if (!replyData.message.trim()) return;

        try {
            const payload = {
                replierName: user.name + (user.role === 'TEACHER' ? ' (Teacher)' : ''),
                replierRole: user.role,
                message: replyData.message
            };

            const response = await fetch(`${API_BASE_URL}/api/doubts/${doubtId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setReplyData({ doubtId: null, message: '' });
                fetchDoubts();
            }
        } catch (error) {
            console.error("Error posting reply", error);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    <FaComments /> Ask a Doubt
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Have a question? Ask experts and classmates!</p>
            </header>

            {/* Ask Box */}
            <div className="glass-panel p-6 rounded-2xl">
                <form onSubmit={handlePostDoubt} className="space-y-4">
                    <div className="flex gap-4">
                        <select
                            className="p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newQuestion.subject}
                            onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Type your question here..."
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            required
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <FaPaperPlane /> Post
                        </button>
                    </div>
                </form>
            </div>

            {/* Questions Feed */}
            <div className="space-y-6">
                {loading ? <p>Loading discussions...</p> : doubts.map(doubt => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={doubt.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <FaUserGraduate />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white">
                                            {doubt.student ? doubt.student.name : 'Unknown Student'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(doubt.createdAt).toLocaleDateString()} • <span className="text-indigo-500 font-medium">{doubt.subject}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${doubt.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {doubt.status || 'OPEN'}
                                </span>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 ml-13 pl-13 my-3">
                                {doubt.question}
                            </h3>

                            {/* Replies Section */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mt-4 space-y-4">
                                {doubt.replies && doubt.replies.length > 0 ? doubt.replies.map(reply => (
                                    <div key={reply.id} className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${reply.replierRole === 'TEACHER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {reply.replierRole === 'TEACHER' ? <FaChalkboardTeacher /> : <FaUserGraduate />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{reply.replierName}</span>
                                                <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{reply.message}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-gray-400 italic">No replies yet. Be the first to answer!</div>
                                )}

                                {/* Reply Input */}
                                <div className="flex gap-2 mt-4 pt-2 border-t dark:border-gray-700">
                                    <input
                                        type="text"
                                        placeholder="Write a reply..."
                                        className="flex-1 p-2 bg-white dark:bg-gray-800 border rounded-lg text-sm dark:border-gray-600 dark:text-white"
                                        value={replyData.doubtId === doubt.id ? replyData.message : ''}
                                        onChange={(e) => setReplyData({ doubtId: doubt.id, message: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handlePostReply(doubt.id)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg dark:hover:bg-gray-700"
                                    >
                                        <FaReply />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AskDoubt;
