import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaPaperPlane, FaReply, FaUserGraduate, FaChalkboardTeacher, FaComments, FaCheckCircle, FaSearch, FaTrash, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AskDoubt = () => {
    const { user } = useAuth();
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newQuestion, setNewQuestion] = useState({ subject: 'General', question: '' });
    const [replyData, setReplyData] = useState({ doubtId: null, message: '' });

    // Edit State
    const [editingDoubt, setEditingDoubt] = useState(null);

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

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                subject: editingDoubt.subject,
                question: editingDoubt.question
            };

            const response = await fetch(`${API_BASE_URL}/api/doubts/${editingDoubt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setEditingDoubt(null);
                fetchDoubts();
                alert("Discussion updated successfully!");
            }
        } catch (error) {
            console.error("Error updating doubt", error);
            alert("Failed to update discussion.");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this discussion?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/doubts/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setDoubts(doubts.filter(d => d.id !== id));
            } else {
                alert("Failed to delete discussion.");
            }
        } catch (error) {
            console.error("Error deleting doubt", error);
            alert("Error deleting discussion.");
        }
    };

    const canEdit = (doubt) => user && (user.role === 'ADMIN' || (doubt.student && doubt.student.id === user.id));

    const filteredDoubts = doubts.filter(d =>
        d.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-300">
                        <FaComments className="text-indigo-600 dark:text-indigo-400" /> Ask a Doubt
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Collaborative Learning Forum</p>
                </div>
                <div className="relative w-full md:w-auto mt-4 md:mt-0">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {/* Ask Box */}
            <div className="glass-panel p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900 shadow-xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <FaPaperPlane className="text-indigo-500" /> Start a New Discussion
                </h2>

                <form onSubmit={handlePostDoubt} className="space-y-4 relative z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-indigo-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 dark:text-gray-200"
                            value={newQuestion.subject}
                            onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input
                            type="text"
                            className="flex-1 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-indigo-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:text-white"
                            placeholder="Type your question here..."
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            required
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                        >
                            Post
                        </motion.button>
                    </div>
                </form>
            </div>

            {/* Questions Feed */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredDoubts.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-xl font-bold text-gray-400">No discussions found.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredDoubts.map((doubt, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={doubt.id}
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative group hover:shadow-md transition-shadow"
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${doubt.status === 'RESOLVED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold shadow-inner">
                                                <FaUserGraduate />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-white text-base">
                                                    {doubt.student ? doubt.student.name : 'Unknown Student'}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                                    {new Date(doubt.createdAt).toLocaleDateString()}
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{doubt.subject}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 ${doubt.status === 'RESOLVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                {doubt.status === 'RESOLVED' && <FaCheckCircle />} {doubt.status || 'OPEN'}
                                            </div>
                                            {canEdit(doubt) && (
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => setEditingDoubt({ ...doubt })}
                                                        className="p-2.5 bg-gray-100 hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 rounded-xl transition-all"
                                                        title="Edit Discussion"
                                                    >
                                                        <FaEdit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(doubt.id, e)}
                                                        className="p-2.5 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                                                        title="Delete Discussion"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 ml-0 md:ml-14 pl-2 my-4 leading-relaxed whitespace-pre-line">
                                        {doubt.question}
                                    </h3>

                                    {/* Replies Section */}
                                    <div className="mt-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-4 md:p-6 space-y-4">
                                        {doubt.replies && doubt.replies.length > 0 ? (
                                            doubt.replies.map(reply => (
                                                <div key={reply.id} className="flex gap-4">
                                                    <div className={`mt-1 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs shadow-sm text-white ${reply.replierRole === 'TEACHER' || reply.replierRole === 'ADMIN' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                                                        {reply.replierRole === 'TEACHER' || reply.replierRole === 'ADMIN' ? <FaChalkboardTeacher /> : <FaUserGraduate />}
                                                    </div>
                                                    <div className={`flex-1 p-3 rounded-2xl rounded-tl-none ${reply.replierRole === 'TEACHER' || reply.replierRole === 'ADMIN' ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`font-bold text-xs ${reply.replierRole === 'TEACHER' || reply.replierRole === 'ADMIN' ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
                                                                {reply.replierName}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{reply.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-sm text-gray-400 italic">No replies yet. Be the first to answer!</div>
                                        )}

                                        {/* Reply Input */}
                                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                            <input
                                                type="text"
                                                placeholder="Write a helpful reply..."
                                                className="flex-1 p-3 bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 dark:text-white outline-none"
                                                value={replyData.doubtId === doubt.id ? replyData.message : ''}
                                                onChange={(e) => setReplyData({ doubtId: doubt.id, message: e.target.value })}
                                            />
                                            <button
                                                onClick={() => handlePostReply(doubt.id)}
                                                disabled={replyData.doubtId === doubt.id && !replyData.message.trim()}
                                                className={`p-3 rounded-xl transition-all ${replyData.doubtId === doubt.id && replyData.message.trim() ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'}`}
                                            >
                                                <FaReply />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingDoubt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg relative p-8"
                        >
                            <button
                                onClick={() => setEditingDoubt(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                            >
                                <FaTimes size={20} />
                            </button>

                            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaEdit className="text-indigo-500" /> Edit Discussion
                            </h3>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Subject</label>
                                    <select
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={editingDoubt.subject}
                                        onChange={(e) => setEditingDoubt({ ...editingDoubt, subject: e.target.value })}
                                    >
                                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Question</label>
                                    <textarea
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                        value={editingDoubt.question}
                                        onChange={(e) => setEditingDoubt({ ...editingDoubt, question: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingDoubt(null)}
                                        className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
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

export default AskDoubt;
