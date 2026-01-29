import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaCalendarAlt, FaPlus, FaTrash, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TimeTable = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const timetableRef = useRef(null);

    // Admin/Teacher State - Students should NOT be able to change these
    const isStudent = user.role === 'STUDENT';
    const [targetClass, setTargetClass] = useState(isStudent ? user.className : (user.className || '10'));
    const [targetSection, setTargetSection] = useState(isStudent ? user.section : (user.section || 'A'));
    const [showForm, setShowForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        dayOfWeek: 'MONDAY',
        periodTime: '09:00 - 10:00',
        subject: '',
        teacherName: '',
        roomNo: ''
    });

    useEffect(() => {
        // For students, always use their own class/section
        if (isStudent) {
            setTargetClass(user.className);
            setTargetSection(user.section);
        }

        if (targetClass && targetSection) {
            fetchTimeTable();
        }
    }, [targetClass, targetSection, isStudent, user.className, user.section]);

    const fetchTimeTable = async () => {
        setLoading(true);
        try {
            // Students always fetch their own timetable
            const className = isStudent ? user.className : targetClass;
            const section = isStudent ? user.section : targetSection;

            const url = `${API_BASE_URL}/api/timetable?className=${className}&section=${section}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                // Transform backend startTime/endTime to frontend periodTime
                const transformed = data.map(item => ({
                    ...item,
                    periodTime: `${item.startTime} - ${item.endTime}`
                }));
                setTimetable(transformed);
            }
        } catch (error) {
            console.error("Error fetching timetable", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const [start, end] = newEntry.periodTime.split(' - ');
        const payload = {
            ...newEntry,
            className: targetClass,
            section: targetSection,
            startTime: start.trim(),
            endTime: end.trim()
        };
        try {
            const response = await fetch(`${API_BASE_URL}/api/timetable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                setShowForm(false);
                fetchTimeTable();
                setNewEntry({ ...newEntry, subject: '', teacherName: '', roomNo: '' });
            }
        } catch (error) {
            console.error("Error creating entry", error);
        }
    };

    // PDF Export Function - Ultra-comprehensive oklch workaround
    const exportToPDF = async () => {
        setExporting(true);
        try {
            const element = timetableRef.current;

            // Ultra-aggressive style override to eliminate ALL oklch colors
            const style = document.createElement('style');
            style.id = 'pdf-export-override';
            style.textContent = `
                /* Force everything to RGB */
                .pdf-export-mode,
                .pdf-export-mode *,
                .pdf-export-mode *::before,
                .pdf-export-mode *::after {
                    color: rgb(0, 0, 0) !important;
                    background-color: rgb(255, 255, 255) !important;
                    background-image: none !important;
                    border-color: rgb(200, 200, 200) !important;
                    box-shadow: none !important;
                    text-shadow: none !important;
                    filter: none !important;
                    backdrop-filter: none !important;
                }
                
                /* Specific overrides for colored elements - READABLE */
                .pdf-export-mode [class*="indigo"],
                .pdf-export-mode [class*="purple"],
                .pdf-export-mode [class*="blue"] {
                    color: rgb(31, 41, 55) !important; /* dark text */
                    background-color: rgb(224, 231, 255) !important; /* light indigo bg */
                    border: 2px solid rgb(99, 102, 241) !important;
                }
                
                .pdf-export-mode [class*="green"],
                .pdf-export-mode [class*="emerald"] {
                    color: rgb(31, 41, 55) !important;
                    background-color: rgb(209, 250, 229) !important; /* light green bg */
                    border: 2px solid rgb(16, 185, 129) !important;
                }
                
                .pdf-export-mode [class*="text-"] {
                    color: rgb(31, 41, 55) !important;
                }
                
                .pdf-export-mode [class*="white"] {
                    background-color: rgb(249, 250, 251) !important; /* light gray instead */
                }
                
                /* Fix day labels - show horizontally, not rotated */
                .pdf-export-mode * {
                    transform: none !important;
                    writing-mode: horizontal-tb !important;
                }
                
                /* Ensure day label text is readable and horizontal */
                .pdf-export-mode span[class*="rotate"],
                .pdf-export-mode span[class*="transform"] {
                    transform: none !important;
                    writing-mode: horizontal-tb !important;
                    display: inline-block !important;
                    white-space: nowrap !important;
                }
            `;
            document.head.appendChild(style);

            // Apply the class
            element.classList.add('pdf-export-mode');

            // Much longer delay to ensure styles are computed
            await new Promise(resolve => setTimeout(resolve, 500));

            // Force reflow
            void element.offsetHeight;

            const canvas = await html2canvas(element, {
                scale: 2, // Good quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                removeContainer: true,
                foreignObjectRendering: false,
                allowTaint: true
            });

            // Cleanup
            element.classList.remove('pdf-export-mode');
            document.head.removeChild(style);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const className = isStudent ? user.className : targetClass;
            const section = isStudent ? user.section : targetSection;
            const fileName = `Timetable_Class${className}_Section${section}.pdf`;

            pdf.save(fileName);
        } catch (error) {
            console.error("PDF Export Error Details:", error);
            console.error("Error stack:", error.stack);
            alert(`Failed to export PDF.\n\nError: ${error.message}\n\nThis appears to be a compatibility issue with your browser's CSS rendering. Please try:\n1. Using Chrome or Firefox\n2. Updating your browser\n3. Contacting support if the issue persists`);

            // Thorough cleanup
            try {
                const style = document.getElementById('pdf-export-override');
                if (style?.parentNode) document.head.removeChild(style);

                const element = timetableRef.current;
                if (element) element.classList.remove('pdf-export-mode');
            } catch { }
        } finally {
            setExporting(false);
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

    // Helper to get color based on subject - RGB only for PDF compatibility
    const getSubjectStyle = (subject) => {
        if (!subject) return 'bg-white/10 dark:bg-white/5 border-white/20';
        const styles = [
            'bg-gradient-to-br from-blue-500/30 to-cyan-400/30 border-blue-300/40',
            'bg-gradient-to-br from-emerald-500/30 to-green-400/30 border-emerald-300/40',
            'bg-gradient-to-br from-purple-500/30 to-fuchsia-400/30 border-purple-300/40',
            'bg-gradient-to-br from-amber-500/30 to-orange-400/30 border-amber-300/40',
            'bg-gradient-to-br from-rose-500/30 to-pink-400/30 border-rose-300/40',
        ];
        let hash = 0;
        for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
        return styles[Math.abs(hash) % styles.length];
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-gray-900 dark:to-purple-900/20">
            {/* Animated Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                                     radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
                }}></div>
            </div>

            <header className="relative z-10 mb-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 flex items-center gap-3 filter drop-shadow-lg">
                            <FaCalendarAlt className="text-indigo-500 dark:text-indigo-400" />
                            Timetable
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-semibold text-base ml-1 mt-2">Weekly Academic Schedule</p>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col gap-3">
                        {/* Student View - Display Badge */}
                        {user.role === 'STUDENT' && (
                            <div className="glass-card px-5 py-3 flex items-center gap-3 border-2 border-indigo-200 dark:border-indigo-800 w-full lg:w-auto">
                                <div className="text-center flex-1">
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Your Schedule</div>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Class</span>
                                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{user.className}</span>
                                        </div>
                                        <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Section</span>
                                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{user.section}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin/Teacher Controls - NOT visible to students */}
                        {!isStudent && (
                            <div className="glass-card p-3 flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Class</label>
                                    <input
                                        className="w-16 px-3 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-xl font-black text-indigo-600 dark:text-indigo-400 outline-none text-center rounded-xl border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 transition-all"
                                        value={targetClass}
                                        onChange={e => setTargetClass(e.target.value)}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Section</label>
                                    <select
                                        className="w-20 px-3 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-xl font-black text-purple-600 dark:text-purple-400 outline-none text-center rounded-xl border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 transition-all cursor-pointer"
                                        value={targetSection}
                                        onChange={e => setTargetSection(e.target.value)}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                        <option value="E">E</option>
                                    </select>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowForm(!showForm)}
                                    className="glass-btn px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2 text-sm"
                                >
                                    <FaPlus /> Add
                                </motion.button>
                            </div>
                        )}

                        {/* Download PDF Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportToPDF}
                            disabled={exporting || timetable.length === 0}
                            className="glass-btn px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-green-500/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full lg:w-auto text-sm"
                        >
                            {exporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FaDownload /> Download PDF
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Loading Indicator */}
            {loading && (
                <div className="relative z-10 flex justify-center items-center py-12">
                    <div className="glass-card px-8 py-6 flex items-center gap-4 border-2 border-indigo-200 dark:border-indigo-800">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">Loading timetable...</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && timetable.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 flex flex-col items-center justify-center py-16 px-4"
                >
                    <div className="glass-card px-12 py-16 text-center max-w-lg border-2 border-indigo-200 dark:border-indigo-800">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <FaCalendarAlt className="text-5xl text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-3">No Timetable Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                            {user.role === 'STUDENT'
                                ? `No schedule available for Class ${user.className} - Section ${user.section}`
                                : `No schedule entries found for Class ${targetClass} - Section ${targetSection}`
                            }
                        </p>
                        {user.role === 'ADMIN' && (
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-6">
                                Click the "Add Period" button above to create schedule entries
                            </p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Timetable Grid */}
            {!loading && timetable.length > 0 && (
                <div className="relative z-10 overflow-x-auto pb-8">
                    <div ref={timetableRef} className="min-w-[1200px] p-10 glass-card border-2 border-white/30 dark:border-gray-700/30 relative overflow-hidden">
                        {/* Subtle Grid Pattern */}
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}></div>

                        {/* Header Row */}
                        <div className="grid grid-cols-8 gap-4 mb-6 relative z-10">
                            <div className="flex items-center justify-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-xl transform hover:rotate-6 transition-transform">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            {periods.map(time => (
                                <div key={time} className="flex flex-col items-center justify-center">
                                    <div className="glass-card px-3 py-2 mb-2 whitespace-nowrap border border-indigo-100 dark:border-indigo-900">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{time}</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                </div>
                            ))}
                        </div>

                        {/* Days Rows */}
                        {days.map(day => (
                            <div key={day} className="grid grid-cols-8 gap-4 mb-4 group relative z-10">
                                {/* Day Label */}
                                <div className="flex items-center justify-center">
                                    <div className="glass-card px-6 py-10 rounded-2xl w-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-indigo-100 dark:border-indigo-900">
                                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 uppercase tracking-wider transform -rotate-90">
                                            {day.substring(0, 3)}
                                        </span>
                                    </div>
                                </div>

                                {periods.map((time, index) => {
                                    const entry = timetable.find(t => t.dayOfWeek === day && t.periodTime === time);

                                    if (time === '11:00 - 11:30') {
                                        return index === 3 && day === 'MONDAY' ? (
                                            <div key={`${day}-${time}`} className="row-span-6 flex flex-col items-center justify-center opacity-40">
                                                <div className="h-full w-1 bg-dashed border-l-4 border-dotted border-gray-400 dark:border-gray-600 absolute"></div>
                                                <span className="glass-card px-3 py-2 rounded-lg text-xs font-black rotate-90 mt-20 z-10 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">BREAK</span>
                                            </div>
                                        ) : <div key={`${day}-${time}`}></div>;
                                    }

                                    return (
                                        <motion.div
                                            key={`${day}-${time}`}
                                            className="relative min-h-[160px]"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            {entry ? (
                                                <div className={`
                                                    relative h-full p-2 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 group/card
                                                    ${getSubjectStyle(entry.subject)}
                                                    backdrop-blur-xl border-2
                                                `}>
                                                    <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                                                        <div>
                                                            <div className="text-xs font-bold opacity-70 uppercase tracking-wider mb-2 flex justify-between items-center">
                                                                <span className="px-2 py-1 bg-white/20 dark:bg-black/20 rounded-lg">{entry.periodTime}</span>
                                                                {user.role === 'ADMIN' && (
                                                                    <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-700 transition-colors p-2"><FaTrash /></button>
                                                                )}
                                                            </div>
                                                            <h4 className="text-xl font-black leading-tight mb-2 text-gray-900 dark:text-white drop-shadow-sm">{entry.subject}</h4>
                                                            <p className="text-sm font-semibold opacity-90 text-gray-800 dark:text-gray-200">{entry.teacherName}</p>
                                                        </div>
                                                        <div className="flex justify-end mt-2">
                                                            <div className="w-10 h-10 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center text-sm font-black shadow-lg">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Shine Effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/20 to-white/0 opacity-0 group-hover/card:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none"></div>
                                                </div>
                                            ) : (
                                                <div className="h-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/5 dark:bg-black/5 backdrop-blur-sm">
                                                    {user.role === 'ADMIN' && (
                                                        <button
                                                            onClick={() => {
                                                                setNewEntry({ ...newEntry, dayOfWeek: day, periodTime: time });
                                                                setShowForm(true);
                                                            }}
                                                            className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-all shadow-lg"
                                                        >
                                                            <FaPlus className="text-xl" />
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
            )}

            {/* Modal Form for Adding */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="glass-card p-8 w-full max-w-md border-2 border-indigo-200 dark:border-indigo-800"
                        >
                            <h2 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                New Schedule Entry
                            </h2>
                            <form onSubmit={handleAdd} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4 glass-card p-5 border border-indigo-100 dark:border-indigo-900">
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Day</div>
                                        <div className="text-gray-900 dark:text-white font-black text-lg">{newEntry.dayOfWeek}</div>
                                    </div>
                                    <div className="text-center border-l-2 border-indigo-200 dark:border-indigo-800">
                                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Time</div>
                                        <div className="text-gray-900 dark:text-white font-black text-sm">{newEntry.periodTime}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-2 uppercase tracking-wide">Subject *</label>
                                    <input
                                        placeholder="e.g. Mathematics"
                                        className="glass-input w-full p-4 rounded-xl font-bold"
                                        value={newEntry.subject}
                                        onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-2 uppercase tracking-wide">Teacher</label>
                                    <input
                                        placeholder="e.g. Mr. Sharma"
                                        className="glass-input w-full p-4 rounded-xl font-bold"
                                        value={newEntry.teacherName}
                                        onChange={e => setNewEntry({ ...newEntry, teacherName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-2 uppercase tracking-wide">Room No.</label>
                                    <input
                                        placeholder="e.g. 101"
                                        className="glass-input w-full p-4 rounded-xl font-bold"
                                        value={newEntry.roomNo}
                                        onChange={e => setNewEntry({ ...newEntry, roomNo: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-4 glass-card rounded-xl font-bold transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
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
