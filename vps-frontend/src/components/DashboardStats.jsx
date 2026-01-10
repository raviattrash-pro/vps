import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CountUp from 'react-countup';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardStats = ({ users, loading }) => {
    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '20px', height: '300px' }}>
                    <Skeleton width={150} height={24} style={{ marginBottom: '20px', marginInline: 'auto', display: 'block' }} />
                    <Skeleton circle height={180} width={180} style={{ marginInline: 'auto', display: 'block' }} />
                </div>
                <div className="glass-card" style={{ padding: '20px', height: '300px' }}>
                    <Skeleton width={200} height={24} style={{ marginBottom: '20px', marginInline: 'auto', display: 'block' }} />
                    <Skeleton height={200} />
                </div>
            </div>
        );
    }

    // 1. Calculate Role Distribution
    const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(roleCounts).map(role => ({
        name: role,
        value: roleCounts[role]
    }));

    // 2. Calculate Class Distribution (only for students)
    const classCounts = users
        .filter(u => u.role === 'STUDENT' && u.className)
        .reduce((acc, user) => {
            acc[user.className] = (acc[user.className] || 0) + 1;
            return acc;
        }, {});

    const barData = Object.keys(classCounts)
        .sort((a, b) => parseInt(a) - parseInt(b)) // Sort strictly numerically
        .map(cls => ({
            name: `Class ${cls}`,
            students: classCounts[cls]
        }));

    // Fallback if no data
    if (users.length === 0) return null;

    return (
        <div style={{ paddingBottom: '20px' }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(82, 221, 105, 0.1) 0%, rgba(82, 221, 105, 0.05) 100%)', border: '1px solid var(--accent)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Total Users</h4>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        <CountUp end={users.length} duration={2.5} />
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Students</h4>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0088FE' }}>
                        <CountUp end={roleCounts['STUDENT'] || 0} duration={2.5} />
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Teachers</h4>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00C49F' }}>
                        <CountUp end={roleCounts['TEACHER'] || 0} duration={2.5} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Role Distribution Chart */}
                <div className="glass-card" style={{ padding: '20px', height: '350px' }}>
                    <h3 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '20px' }}>Role Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '10px', border: 'none' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Users by Class Chart */}
                <div className="glass-card" style={{ padding: '20px', height: '350px' }}>
                    <h3 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '20px' }}>Students per Class</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '10px', border: 'none' }} />
                            <Bar dataKey="students" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


export default DashboardStats;
