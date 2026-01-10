import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaBook, FaUserCog, FaSearch, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../AuthContext';
import './CommandPalette.css'; // We'll add some styles

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { toggleTheme } = useTheme();
    const { logout } = useAuth(); // Assuming useAuth provides logout

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <Command.Dialog open={open} onOpenChange={setOpen} label="Global Search" className="cmd-dialog">
            <div className="cmd-wrapper glass-card">
                <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                    <FaSearch style={{ color: 'var(--text-muted)', marginRight: '10px' }} />
                    <Command.Input
                        placeholder="Type a command or search..."
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: 'var(--text-main)' }}
                    />
                </div>

                <Command.List style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px' }}>
                    <Command.Empty style={{ padding: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>No results found.</Command.Empty>

                    <Command.Group heading="Navigation" style={{ marginBottom: '10px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold' }}>
                        <CommandItem onSelect={() => runCommand(() => navigate('/'))} icon={<FaHome />}>Home</CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/calendar'))} icon={<FaCalendarAlt />}>Calendar</CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/attendance'))} icon={<FaCalendarAlt />}>Attendance</CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/reports'))} icon={<FaBook />}>Reports</CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/admin'))} icon={<FaUserCog />}>Admin Dashboard</CommandItem>
                    </Command.Group>

                    <Command.Group heading="Settings" style={{ marginBottom: '10px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold' }}>
                        <CommandItem onSelect={() => runCommand(toggleTheme)} icon={<FaMoon />}>Toggle Theme</CommandItem>
                        <CommandItem onSelect={() => runCommand(logout)} icon={<FaUserCog />}>Logout</CommandItem>
                    </Command.Group>
                </Command.List>
            </div>
        </Command.Dialog>
    );
};

const CommandItem = ({ children, onSelect, icon }) => {
    return (
        <Command.Item
            onSelect={onSelect}
            className="cmd-item"
            style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px',
                cursor: 'pointer', color: 'var(--text-main)', transition: '0.2s'
            }}
        >
            {icon}
            {children}
        </Command.Item>
    );
};

export default CommandPalette;
