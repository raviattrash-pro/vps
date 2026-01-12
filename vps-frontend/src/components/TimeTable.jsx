import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

const TimeTable = () => {
    const { user } = useAuth();
    const [timeTable, setTimeTable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days] = useState(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']);

    // Form State (for Admin/Teacher)
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({
        dayOfWeek: 'MONDAY',
        startTime: '',
        endTime: '',
        subject: '',
        teacherName: '',
        className: user?.className || '',
        section: user?.section || ''
    });

    useEffect(() => {
        fetchTimeTable();
    }, [user, user?.className, user?.section]); // Re-fetch if user class/section changes (for students)

    const fetchTimeTable = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/timetable`;
            if (user.role === 'STUDENT') {
                url += `?studentId=${user.id}`;
            } else if (newItem.className && newItem.section) {
                // For admin viewing a specific class
                url += `?className=${newItem.className}&section=${newItem.section}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setTimeTable(data);
            }
        } catch (error) {
            console.error("Error fetching timetable", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/timetable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            if (response.ok) {
                setShowForm(false);
                fetchTimeTable(); // Refresh
                // Reset minimal form fields
                setNewItem({ ...newItem, subject: '', teacherName: '', startTime: '', endTime: '' });
            }
        } catch (error) {
            console.error("Error adding item", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this period?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/timetable/${id}`, { method: 'DELETE' });
            fetchTimeTable();
        } catch (error) {
            console.error("Error deleting item", error);
        }
    };

    // Helper to filter items for a day
    const getItemsForDay = (day) => {
        return timeTable.filter(item => item.dayOfWeek === day);
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Class Time-Table</h1>
                    <p className="text-gray-500 dark:text-gray-400">Weekly Schedule</p>
                </div>
                {user.role !== 'STUDENT' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showForm ? 'Close Form' : 'Manage Schedule'}
                    </button>
                )}
            </header>

            {/* Admin Filter / Add Form */}
            {user.role !== 'STUDENT' && (
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Class (e.g. 10)"
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newItem.className}
                            onChange={(e) => setNewItem({ ...newItem, className: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Section (e.g. A)"
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newItem.section}
                            onChange={(e) => setNewItem({ ...newItem, section: e.target.value })}
                        />
                        <button onClick={fetchTimeTable} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                            Load
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 dark:border-gray-700">
                            <select
                                value={newItem.dayOfWeek}
                                onChange={e => setNewItem({ ...newItem, dayOfWeek: e.target.value })}
                                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Subject"
                                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newItem.subject}
                                onChange={e => setNewItem({ ...newItem, subject: e.target.value })}
                                required
                            />
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newItem.startTime}
                                    onChange={e => setNewItem({ ...newItem, startTime: e.target.value })}
                                    required
                                />
                                <input
                                    type="time"
                                    className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newItem.endTime}
                                    onChange={e => setNewItem({ ...newItem, endTime: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Teacher Name"
                                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newItem.teacherName}
                                onChange={e => setNewItem({ ...newItem, teacherName: e.target.value })}
                            />
                            <button type="submit" className="col-span-full md:col-span-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                Add Period
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Time Table Grid */}
            <div className="space-y-6">
                {days.map(day => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={day}
                        className="glass-panel p-6 rounded-2xl"
                    >
                        <h2 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400 border-b pb-2 dark:border-gray-700">
                            {day}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {getItemsForDay(day).length === 0 ? (
                                <p className="text-gray-400 italic">No classes scheduled.</p>
                            ) : (
                                getItemsForDay(day).map(item => (
                                    <div key={item.id} className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                            {item.startTime} - {item.endTime}
                                        </div>
                                        <div className="font-bold text-lg text-gray-800 dark:text-white">
                                            {item.subject}
                                        </div>
                                        {item.teacherName && (
                                            <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                                👨‍🏫 {item.teacherName}
                                            </div>
                                        )}
                                        {user.role !== 'STUDENT' && (
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TimeTable;
