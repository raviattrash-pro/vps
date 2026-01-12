import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaPoll, FaCheck, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PollSystem = () => {
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [votedPolls, setVotedPolls] = useState([]); // Track locally handled votes for UI feedback
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
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-teal-600 dark:text-teal-400">
                        <FaPoll /> School Polls
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Your Voice Matters</p>
                </div>
                {user.role === 'ADMIN' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                        Create Poll
                    </button>
                )}
            </header>

            {showForm && (
                <div className="glass-panel p-6 rounded-2xl mb-6">
                    <form onSubmit={createPoll} className="space-y-4">
                        <input
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="Poll Question"
                            value={question} onChange={e => setQuestion(e.target.value)} required
                        />
                        {options.map((opt, idx) => (
                            <input
                                key={idx}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                placeholder={`Option ${idx + 1}`}
                                value={opt} onChange={e => {
                                    const newOpts = [...options];
                                    newOpts[idx] = e.target.value;
                                    setOptions(newOpts);
                                }} required
                            />
                        ))}
                        <button type="button" onClick={() => setOptions([...options, ''])} className="text-sm text-teal-600 font-bold">+ Add Option</button>
                        <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-lg">Launch Poll</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {polls.map(poll => {
                    const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                    const hasVoted = votedPolls.includes(poll.id);

                    return (
                        <div key={poll.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-lg mb-4 dark:text-white">{poll.question}</h3>
                            <div className="space-y-3">
                                {poll.options.map(option => {
                                    const count = poll.votes[option] || 0;
                                    const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);

                                    return (
                                        <div
                                            key={option}
                                            className={`relative p-3 rounded-lg border cursor-pointer overflow-hidden transition-all ${hasVoted ? 'border-gray-200 dark:border-gray-700 cursor-default' : 'border-gray-200 hover:border-teal-500 hover:bg-teal-50'
                                                }`}
                                            onClick={() => !hasVoted && handleVote(poll.id, option)}
                                        >
                                            {/* Progress Bar Background */}
                                            {hasVoted && (
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: `${percent}%` }}
                                                    className="absolute left-0 top-0 bottom-0 bg-teal-100 dark:bg-teal-900/30 z-0"
                                                />
                                            )}

                                            <div className="relative z-10 flex justify-between items-center">
                                                <span className="font-medium dark:text-gray-200">{option}</span>
                                                {hasVoted && (
                                                    <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{percent}%</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 text-xs text-gray-400 text-right">
                                {totalVotes} votes • {hasVoted ? 'Voted' : 'Tap option to vote'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PollSystem;
