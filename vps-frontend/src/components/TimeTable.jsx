import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TimeTable = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);

    // Admin/Teacher State
    const [targetClass, setTargetClass] = useState(user.className || '10');
    const [targetSection, setTargetSection] = useState(user.section || 'A');
    const [showForm, setShowForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        dayOfWeek: 'MONDAY',
        periodTime: '09:00 - 10:00',
        subject: '',
        teacherName: '',
        roomNumber: ''
    });

    useEffect(() => {
        if (targetClass && targetSection) {
            fetchTimeTable();
        }
    }, [targetClass, targetSection]);

    const fetchTimeTable = async () => {
        setLoading(true);
        try {
            const url = user.role === 'STUDENT'
                ? `${API_BASE_URL}/api/timetable?className=${user.className}&section=${user.section}`
                : `${API_BASE_URL}/api/timetable?className=${targetClass}&section=${targetSection}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setTimetable(data);
            }
        } catch (error) {
            console.error("Error fetching timetable", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/timetable?className=${targetClass}&section=${targetSection}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry)
            });
            if (response.ok) {
                setShowForm(false);
                fetchTimeTable();
                setNewEntry({ ...newEntry, subject: '', teacherName: '', roomNumber: '' });
            }
        } catch (error) {
            console.error("Error creating entry", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this period?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/timetable/${id}`, { method: 'DELETE' });
            fetchTimeTable();
        } catch (error) {
            console.error("Error deleting", error);
        }
    };


    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const periods = [
        '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
        '11:00 - 11:30', // Break
        '11:30 - 12:30', '12:30 - 01:30', '01:30 - 02:30'
    ];

    // Helper to get color based on subject (Diamonds)
    const getSubjectStyle = (subject) => {
        if (!subject) return 'bg-white/5 dark:bg-white/5 border-white/10';
        const styles = [
            'bg-gradient-to-br from-blue-400/20 to-cyan-300/20 border-blue-200/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
            'bg-gradient-to-br from-emerald-400/20 to-green-300/20 border-emerald-200/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
            'bg-gradient-to-br from-purple-400/20 to-fuchsia-300/20 border-purple-200/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
            'bg-gradient-to-br from-amber-400/20 to-orange-300/20 border-amber-200/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
            'bg-gradient-to-br from-rose-400/20 to-pink-300/20 border-rose-200/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
        ];
        let hash = 0;
        for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
        return styles[Math.abs(hash) % styles.length];
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-gray-900">
            {/* Diamond Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-10" style={{
                backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px), radial-gradient(#4f46e5 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
            }}></div>

            <header className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-4 filter drop-shadow-sm">
                        <FaCalendarAlt className="text-indigo-500" />
                        Timetable
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg ml-1">Weekly Academic Schedule</p>
                </div>

                {user.role !== 'STUDENT' && (
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700">
                        <div className="flex items-center gap-2 px-4 border-r border-gray-300 dark:border-gray-600">
                            <span className="text-xs font-bold text-gray-400 uppercase">Class</span>
                            <input
                                className="w-12 bg-transparent text-xl font-black text-gray-700 dark:text-white outline-none text-center"
                                value={targetClass} onChange={e => setTargetClass(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            <span className="text-xs font-bold text-gray-400 uppercase">Sec</span>
                            <input
                                className="w-12 bg-transparent text-xl font-black text-gray-700 dark:text-white outline-none text-center"
                                value={targetSection} onChange={e => setTargetSection(e.target.value)}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowForm(!showForm)}
                            className="ml-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
                        >
                            <FaPlus /> Add Period
                        </motion.button>
                    </div>
                )}
            </header>

            <div className="relative z-10 overflow-x-auto pb-8 custom-scrollbar">
                <div className="min-w-[1200px] p-8 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border-4 border-white/50 dark:border-gray-700 relative overflow-hidden" id="timetable-canvas">
                    {/* Canvas Texture/Watermark */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    {/* Header Row */}
                    <div className="grid grid-cols-8 gap-4 mb-6 relative z-10">
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-xl shadow-lg transform rotate-3">
                                <FaCalendarAlt />
                            </div>
                        </div>
                        {periods.map(time => (
                            <div key={time} className="flex flex-col items-center justify-center">
                                <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 mb-2">
                                    <span className="text-xs font-bold text-gray-500">{time}</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            </div>
                        ))}
                    </div>

                    {/* Days Rows */}
                    {days.map(day => (
                        <div key={day} className="grid grid-cols-8 gap-4 mb-4 group relative z-10">
                            {/* Day Label */}
                            <div className="flex items-center justify-center">
                                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-8 rounded-2xl border border-gray-100 dark:border-gray-700 w-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    <span className="text-xl font-black text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors uppercase tracking-widest transform -rotate-90">
                                        {day.substring(0, 3)}
                                    </span>
                                </div>
                            </div>

                            {periods.map((time, index) => {
                                const entry = timetable.find(t => t.dayOfWeek === day && t.periodTime === time);

                                if (time === '11:00 - 11:30') {
                                    return index === 3 && day === 'MONDAY' ? (
                                        <div key={`${day}-${time}`} className="row-span-6 flex flex-col items-center justify-center opacity-30">
                                            <div className="h-full w-[2px] bg-dashed border-l-2 border-gray-400 absolute"></div>
                                            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-[10px] font-bold rotate-90 mt-20 z-10">BREAK</span>
                                        </div>
                                    ) : <div key={`${day}-${time}`}></div>;
                                }

                                return (
                                    <motion.div
                                        key={`${day}-${time}`}
                                        className="relative min-h-[140px]"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {entry ? (
                                            <div className={`
                                                relative h-full p-1 rounded-2xl bg-gradient-to-br transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group/card
                                                ${getSubjectStyle(entry.subject)}
                                                backdrop-blur-xl border-t border-l border-white/30
                                             `}>
                                                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-2xl"></div>
                                                <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                                                    <div>
                                                        <div className="text-xs font-bold opacity-60 uppercase tracking-wider mb-1 flex justify-between">
                                                            <span>{entry.roomNumber ? `R-${entry.roomNumber}` : 'N/A'}</span>
                                                            {user.role === 'ADMIN' && (
                                                                <button onClick={() => handleDelete(entry.id)} className="hover:text-red-500"><FaTrash /></button>
                                                            )}
                                                        </div>
                                                        <h4 className="text-lg font-black leading-tight drop-shadow-sm mb-1">{entry.subject}</h4>
                                                        <p className="text-xs font-semibold opacity-80">{entry.teacherName}</p>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shadow-inner">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Shine Effect */}
                                                <div className="absolute -top-[100%] -left-[100%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/20 to-transparent transform rotate-45 transition-transform duration-1000 group-hover/card:translate-x-full group-hover/card:translate-y-full pointer-events-none"></div>
                                            </div>
                                        ) : (
                                            <div className="h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                {user.role === 'ADMIN' && (
                                                    <button
                                                        onClick={() => {
                                                            setNewEntry({ ...newEntry, dayOfWeek: day, periodTime: time });
                                                            setShowForm(true);
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white shadow-sm transition-all"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Form for Adding */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
                        >
                            <h2 className="text-2xl font-black mb-6 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                                New Schedule Entry
                            </h2>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-gray-400 uppercase">Day</div>
                                        <div className="dark:text-white font-black">{newEntry.dayOfWeek}</div>
                                    </div>
                                    <div className="text-center border-l dark:border-gray-700">
                                        <div className="text-xs font-bold text-gray-400 uppercase">Time</div>
                                        <div className="dark:text-white font-black text-sm">{newEntry.periodTime}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-2">Subject</label>
                                    <input
                                        placeholder="e.g. Mathematics"
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold dark:text-white"
                                        value={newEntry.subject} onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })} required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-2">Teacher</label>
                                    <input
                                        placeholder="e.g. Mr. Sharma"
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold dark:text-white"
                                        value={newEntry.teacherName} onChange={e => setNewEntry({ ...newEntry, teacherName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-2">Room No.</label>
                                    <input
                                        placeholder="e.g. 101"
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold dark:text-white"
                                        value={newEntry.roomNumber} onChange={e => setNewEntry({ ...newEntry, roomNumber: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-105"
                                    >
                                        Add Entry
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

export default TimeTable;
