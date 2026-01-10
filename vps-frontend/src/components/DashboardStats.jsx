import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardStats = ({ users }) => {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {/* Pie Chart */}
            <div className="glass-card" style={{ padding: '20px', height: '300px' }}>
                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: 'var(--text-main)' }}>User Roles</h4>
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="glass-card" style={{ padding: '20px', height: '300px' }}>
                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: 'var(--text-main)' }}>Students per Class</h4>
                {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={barData}>
                            <XAxis dataKey="name" fontSize={12} stroke="var(--text-muted)" />
                            <YAxis allowDecimals={false} stroke="var(--text-muted)" />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '10px', border: 'none', color: '#000' }} />
                            <Bar dataKey="students" fill="#82ca9d" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        No Student Data
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardStats;
