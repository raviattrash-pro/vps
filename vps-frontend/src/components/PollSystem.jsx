import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaPoll, FaCheck, FaPlus, FaFireAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const PollSystem = () => {
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [votedPolls, setVotedPolls] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // New Poll Form
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/polls`);
            if (response.ok) {
                const data = await response.json();
                setPolls(data);
            }
        } catch (error) {
            console.error("Error fetching polls", error);
        }
    };

    const handleVote = async (pollId, option) => {
        if (votedPolls.includes(pollId)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/polls/${pollId}/vote?option=${encodeURIComponent(option)}`, {
                method: 'POST'
            });
            if (response.ok) {
                setVotedPolls([...votedPolls, pollId]);
                fetchPolls();

                // Trigger Confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#2dd4bf', '#0d9488', '#99f6e4']
                });
            }
        } catch (error) {
            console.error("Error voting", error);
        }
    };

    const createPoll = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/polls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, options: options.filter(o => o.trim() !== '') })
            });

            if (response.ok) {
                setShowForm(false);
                setQuestion('');
                setOptions(['', '']);
                fetchPolls();
            }
        } catch (error) {
            console.error("Error creating poll", error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500 tracking-tight">
                        <FaPoll className="text-teal-500" /> Pulse of VPS
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Cast your vote, shape your campus.</p>
                </div>
                {user.role === 'ADMIN' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-teal-500/30 flex items-center gap-2"
                    >
                        <FaPlus /> New Poll
                    </motion.button>
                )}
            </header>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card mb-8" style={{ padding: '25px', maxWidth: '800px', margin: '0 auto 30px auto' }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold' }}>Create a New Poll</h3>
                            <form onSubmit={createPoll} className="space-y-6">
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Question</label>
                                    <textarea
                                        className="glass-input resize-none h-32"
                                        placeholder="What's your question?"
                                        value={question} onChange={e => setQuestion(e.target.value)} required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Options</label>
                                    {options.map((option, index) => (
                                        <div key={index} className="flex gap-3">
                                            <input
                                                className="glass-input"
                                                placeholder={`Option ${index + 1}`}
                                                value={option}
                                                onChange={e => handleOptionChange(index, e.target.value)}
                                                required
                                            />
                                            {options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setOptions([...options, ''])}
                                        className="px-6 py-3 border-2 border-teal-500 text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-2"
                                    >
                                        <FaPlus /> Add Option
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 glass-btn flex justify-center items-center gap-2"
                                    >
                                        Launch Poll
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {polls.map(poll => {
                    const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                    const hasVoted = votedPolls.includes(poll.id);
                    // Find leading option
                    const leadingOption = Object.entries(poll.votes).sort((a, b) => b[1] - a[1])[0]?.[0];

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={poll.id}
                            className="relative overflow-hidden bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-transparent rounded-bl-[4rem] -mr-8 -mt-8 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative">
                                <h3 className="text-2xl font-bold dark:text-white leading-snug w-4/5">{poll.question}</h3>
                                {totalVotes > 50 && (
                                    <div className="flex items-center gap-1 text-orange-500 font-bold text-xs bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                        <FaFireAlt /> Hot
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 relative">
                                {poll.options.map(option => {
                                    const count = poll.votes[option] || 0;
                                    const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                                    const isLeading = leadingOption === option && totalVotes > 0;

                                    return (
                                        <div
                                            key={option}
                                            className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${!hasVoted ? 'cursor-pointer hover:shadow-md transform active:scale-98' : ''}`}
                                            onClick={() => !hasVoted && handleVote(poll.id, option)}
                                        >
                                            {/* Bar Background Base */}
                                            <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900/50"></div>

                                            {/* Progress Bar */}
                                            {hasVoted && (
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`absolute left-0 top-0 bottom-0 z-0 ${isLeading
                                                        ? 'bg-gradient-to-r from-teal-400 to-emerald-500'
                                                        : 'bg-gray-200 dark:bg-gray-700'}`}
                                                />
                                            )}

                                            <div className="relative z-10 flex justify-between items-center p-4">
                                                <div className="flex items-center gap-3">
                                                    {!hasVoted && <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-teal-500 transition-colors"></div>}
                                                    {isLeading && hasVoted && <FaPoll className="text-white drop-shadow-md" />}
                                                    <span className={`font-semibold ${isLeading && hasVoted ? 'text-white text-shadow-sm' : 'text-gray-700 dark:text-gray-200'} transition-colors`}>
                                                        {option}
                                                    </span>
                                                </div>

                                                {hasVoted && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`font-black text-sm ${isLeading ? 'text-white' : 'text-gray-500'}`}
                                                    >
                                                        {percent}%
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <span>{totalVotes} Votes recorded</span>
                                <span>{hasVoted ? 'Vote Submitted' : 'Tap to Vote'}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default PollSystem;
