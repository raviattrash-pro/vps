import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
                ? `${API_BASE_URL}/api/timetable/my-table` // Assuming backend extracts class from logged in user
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

    // Helper to get color based on subject (simple hash)
    const getSubjectColor = (subject) => {
        if (!subject) return 'bg-gray-50 dark:bg-gray-800';
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200 dark:border-blue-800',
            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-200 dark:border-green-800',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border-purple-200 dark:border-purple-800',
            'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border-orange-200 dark:border-orange-800',
            'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200 border-pink-200 dark:border-pink-800',
            'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 border-teal-200 dark:border-teal-800',
        ];
        let hash = 0;
        for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="p-4 md:p-8 max-w-[95%] mx-auto space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-gray-800 dark:text-white">
                        <FaCalendarAlt className="text-indigo-600" /> Class Schedule
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Weekly Academic Planner</p>
                </div>

                {user.role !== 'STUDENT' && (
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <input
                            placeholder="Class"
                            className="w-16 p-2 bg-transparent text-center font-bold outline-none border-b-2 border-indigo-100 focus:border-indigo-500 transition-colors"
                            value={targetClass} onChange={e => setTargetClass(e.target.value)}
                        />
                        <input
                            placeholder="Sec"
                            className="w-12 p-2 bg-transparent text-center font-bold outline-none border-b-2 border-indigo-100 focus:border-indigo-500 transition-colors"
                            value={targetSection} onChange={e => setTargetSection(e.target.value)}
                        />
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                        >
                            <FaPlus /> Add
                        </button>
                    </div>
                )}
            </header>

            {/* Timetable Grid */}
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="min-w-[1000px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="grid grid-cols-8 divide-x divide-gray-200 dark:divide-gray-700">
                        {/* Header Row */}
                        <div className="p-4 font-black text-gray-400 uppercase tracking-widest text-xs bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">Day / Time</div>
                        {periods.map(time => (
                            <div key={time} className="p-4 font-bold text-gray-600 dark:text-gray-300 text-center text-xs bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">
                                {time}
                            </div>
                        ))}

                        {/* Data Rows */}
                        {days.map(day => (
                            <React.Fragment key={day}>
                                <div className="p-4 font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 flex items-center justify-center border-t border-gray-100 dark:border-gray-700">
                                    {day.substring(0, 3)}
                                </div>
                                {periods.map(time => {
                                    const entry = timetable.find(t => t.dayOfWeek === day && t.periodTime === time);

                                    // Handle Break Time specifically if modeled or just visual
                                    if (time === '11:00 - 11:30') {
                                        return day === 'MONDAY' ? ( // Clean way to render it just once visually or for valid grid structure render empty but styled
                                            <div key={`${day}-${time}`} className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-t border-gray-100 dark:border-gray-700">
                                                <span className="text-[10px] font-bold text-gray-400 -rotate-90">BREAK</span>
                                            </div>
                                        ) : (
                                            <div key={`${day}-${time}`} className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-t border-gray-100 dark:border-gray-700">
                                                <span className="text-[10px] font-bold text-gray-400 -rotate-90"></span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={`${day}-${time}`} className="min-h-[100px] p-2 border-t border-gray-100 dark:border-gray-700 relative group">
                                            {entry ? (
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`h-full w-full rounded-xl p-3 flex flex-col justify-between border ${getSubjectColor(entry.subject)} shadow-sm`}
                                                >
                                                    <div>
                                                        <div className="font-black text-sm leading-tight">{entry.subject}</div>
                                                        <div className="text-[10px] font-bold opacity-80 mt-1">{entry.teacherName}</div>
                                                    </div>
                                                    <div className="text-[10px] font-mono opacity-70 bg-white/30 rounded px-1 w-max">
                                                        R-{entry.roomNumber}
                                                    </div>

                                                    {user.role === 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-all"
                                                        >
                                                            <FaTrash className="text-[10px]" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user.role === 'ADMIN' && (
                                                        <button
                                                            onClick={() => {
                                                                setNewEntry({ ...newEntry, dayOfWeek: day, periodTime: time });
                                                                setShowForm(true);
                                                            }}
                                                            className="text-gray-300 hover:text-indigo-500 text-2xl"
                                                        >
                                                            +
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Modal Form for Adding */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Add Schedule Entry</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="dark:text-white font-mono text-sm">{newEntry.dayOfWeek}</div>
                                <div className="dark:text-white font-mono text-sm">{newEntry.periodTime}</div>
                            </div>
                            <input
                                placeholder="Subject"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg outline-none border focus:border-indigo-500 transition-colors"
                                value={newEntry.subject} onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })} required
                            />
                            <input
                                placeholder="Teacher Name"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg outline-none border focus:border-indigo-500 transition-colors"
                                value={newEntry.teacherName} onChange={e => setNewEntry({ ...newEntry, teacherName: e.target.value })}
                            />
                            <input
                                placeholder="Room Number"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg outline-none border focus:border-indigo-500 transition-colors"
                                value={newEntry.roomNumber} onChange={e => setNewEntry({ ...newEntry, roomNumber: e.target.value })}
                            />
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Save</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TimeTable;
