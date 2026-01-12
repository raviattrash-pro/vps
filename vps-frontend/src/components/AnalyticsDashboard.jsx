import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaChartBar, FaSearch } from 'react-icons/fa';
// Simple bar chart visualization without external huge libraries for this demo
// In a real app, use 'recharts' or 'react-chartjs-2'

const AnalyticsDashboard = () => {
    const { user } = useAuth();
    const [className, setClassName] = useState(user.className || '10');
    const [averages, setAverages] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAverages();
    }, [className]);

    const fetchAverages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/analytics/class-average?className=${className}`);
            if (response.ok) {
                const data = await response.json();
                setAverages(data);
            }
        } catch (error) {
            console.error("Error fetching analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const maxMark = 100;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                        <FaChartBar /> Result Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Class Performance Overview</p>
                </div>
                {user.role === 'ADMIN' && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Class:</label>
                        <input
                            type="text"
                            className="p-2 border rounded w-20 text-center dark:bg-gray-800 dark:text-white"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                    </div>
                )}
            </header>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-6 text-center dark:text-white">Average Marks per Subject (Class {className})</h2>

                {loading ? (
                    <p className="text-center py-10">Loading analytics...</p>
                ) : Object.keys(averages).length > 0 ? (
                    <div className="flex justify-around items-end h-64 gap-4 px-4">
                        {Object.entries(averages).map(([subject, avg]) => (
                            <div key={subject} className="flex flex-col items-center gap-2 w-full group">
                                <div className="relative w-full max-w-[60px] h-full flex items-end bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                                    <div
                                        style={{ height: `${(avg / maxMark) * 100}%` }}
                                        className="w-full bg-indigo-500 hover:bg-indigo-400 transition-all duration-500 relative group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {avg.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate w-full text-center" title={subject}>{subject}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-10 text-gray-400">No data available for this class.</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                    <h3 className="text-green-800 dark:text-green-300 font-bold mb-1">Top Performing Subject</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {Object.entries(averages).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
                    </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">
                    <h3 className="text-red-800 dark:text-red-300 font-bold mb-1">Needs Improvement</h3>
                    <p className="text-2xl font-bold text-red-600">
                        {Object.entries(averages).sort((a, b) => a[1] - b[1])[0]?.[0] || '-'}
                    </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-1">Overall Class Average</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {(Object.values(averages).reduce((a, b) => a + b, 0) / (Object.values(averages).length || 1)).toFixed(1)}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
