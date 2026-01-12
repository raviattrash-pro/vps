import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaChartBar, FaSearch, FaTrophy, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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

    // Transform data for Recharts
    const chartData = Object.entries(averages).map(([subject, avg]) => ({
        subject,
        average: parseFloat(avg.toFixed(1))
    }));


    // Calculate insights
    const sortedData = [...chartData].sort((a, b) => b.average - a.average);
    const topSubject = sortedData[0];
    const lowSubject = sortedData[sortedData.length - 1];
    const overallAvg = (chartData.reduce((acc, curr) => acc + curr.average, 0) / (chartData.length || 1)).toFixed(1);

    // Ranking State
    const [rankings, setRankings] = useState([]);
    const [myRank, setMyRank] = useState(null);

    useEffect(() => {
        if (className) {
            fetchRankings();
        }
    }, [className]);

    const fetchRankings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/analytics/rankings?className=${className}`);
            if (response.ok) {
                const data = await response.json();
                setRankings(data);

                if (user.role === 'STUDENT') {
                    const me = data.find(r => r.studentId === user.id);
                    setMyRank(me);
                }
            }
        } catch (error) {
            console.error("Error fetching rankings", error);
        }
    };

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c'];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                        <FaChartBar /> Performance Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Class {className} Overview</p>
                </div>
                {user.role === 'ADMIN' && (
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <label className="text-sm font-bold text-gray-500 px-2">Class:</label>
                        <input
                            type="text"
                            className="p-1 border-b-2 border-indigo-100 focus:border-indigo-500 bg-transparent text-center font-bold w-16 outline-none dark:text-white transition-colors"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                    </div>
                )}
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : chartData.length > 0 ? (
                <>
                    {/* Unique Ranking Section per Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Common Stats */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-1 flex items-center gap-2"><FaChartLine /> Class Average</h3>
                                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{overallAvg}%</p>
                                <p className="text-sm font-bold text-blue-700/60 dark:text-blue-500/60 mt-1">Overall Performance</p>
                            </div>
                            <FaChartLine className="absolute -bottom-4 -right-4 text-8xl text-blue-200 dark:text-blue-800/50 opacity-50 rotate-12" />
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-800 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-green-800 dark:text-green-300 font-bold mb-1 flex items-center gap-2"><FaTrophy /> Top Subject</h3>
                                <p className="text-2xl font-black text-green-600 dark:text-green-400 truncate">{topSubject?.subject}</p>
                                <p className="text-sm font-bold text-green-700/60 dark:text-green-500/60 mt-1">{topSubject?.average}% Average</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-800 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-red-800 dark:text-red-300 font-bold mb-1 flex items-center gap-2"><FaExclamationTriangle /> Focus Area</h3>
                                <p className="text-2xl font-black text-red-600 dark:text-red-400 truncate">{lowSubject?.subject}</p>
                                <p className="text-sm font-bold text-red-700/60 dark:text-red-500/60 mt-1">{lowSubject?.average}% Average</p>
                            </div>
                        </div>

                        {/* Student Rank Card */}
                        {user.role === 'STUDENT' && myRank && (
                            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-100 dark:from-purple-900/30 dark:to-fuchsia-900/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-800 shadow-sm relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-purple-800 dark:text-purple-300 font-bold mb-1 flex items-center gap-2"><FaTrophy /> My Rank</h3>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-black text-purple-600 dark:text-purple-400">#{myRank.rank}</p>
                                        <span className="text-sm text-purple-600/70 font-bold">of {rankings.length}</span>
                                    </div>
                                    <p className="text-sm font-bold text-purple-700/60 dark:text-purple-500/60 mt-1">Avg: {myRank.averagePercentage}%</p>
                                </div>
                                <FaTrophy className="absolute -bottom-4 -right-4 text-8xl text-purple-200 dark:text-purple-800/50 opacity-50 rotate-12" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-8 text-gray-800 dark:text-white">Subject Performance Breakdown</h2>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <RechartsTooltip
                                            cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar dataKey="average" radius={[8, 8, 0, 0]} animationDuration={1500}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Admin Leaderboard */}
                        {user.role === 'ADMIN' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaTrophy className="text-yellow-500" /> Top Performers
                                </h2>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {rankings.slice(0, 10).map((student, index) => (
                                        <div key={student.studentId} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-600' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}
                                            `}>
                                                {student.rank}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-800 dark:text-gray-200 truncate">{student.name}</div>
                                                <div className="text-xs text-gray-400">Class {className}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-indigo-600 dark:text-indigo-400">{student.averagePercentage}%</div>
                                            </div>
                                        </div>
                                    ))}
                                    {rankings.length === 0 && <div className="text-center text-gray-400 py-4">No ranking data available.</div>}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-400 font-medium">No performance data found for Class {className}.</p>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
