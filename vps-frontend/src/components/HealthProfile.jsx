import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaHeartbeat, FaPhone, FaUserMd, FaPills, FaAllergies, FaSearch, FaUser } from 'react-icons/fa';

const HealthProfile = () => {
    const { user } = useAuth();
    const [healthData, setHealthData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Admin State
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        bloodGroup: '',
        height: '',
        weight: '',
        allergies: '',
        medications: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        doctorName: '',
        doctorContact: ''
    });

    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') {
                fetchStudents();
            } else {
                setSelectedStudentId(user.id);
            }
        }
    }, [user]);

    useEffect(() => {
        if (selectedStudentId) {
            fetchHealthProfile(selectedStudentId);
        } else {
            setHealthData(null);
        }
    }, [selectedStudentId]);

    const fetchStudents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/students`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("Error fetching students", error);
        }
    };

    const fetchHealthProfile = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/health/${id}`);
            if (response.ok) {
                const data = await response.json();
                setHealthData(data);
                setFormData({
                    bloodGroup: data.bloodGroup || '',
                    height: data.height || '',
                    weight: data.weight || '',
                    allergies: data.allergies || '',
                    medications: data.medications || '',
                    emergencyContactName: data.emergencyContactName || '',
                    emergencyContactNumber: data.emergencyContactNumber || '',
                    doctorName: data.doctorName || '',
                    doctorContact: data.doctorContact || ''
                });
            } else {
                setHealthData(null);
                setFormData({
                    bloodGroup: '', height: '', weight: '', allergies: '', medications: '',
                    emergencyContactName: '', emergencyContactNumber: '', doctorName: '', doctorContact: ''
                });
            }
        } catch (error) {
            console.error("Error fetching health profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                student: { id: selectedStudentId }
            };

            const response = await fetch(`${API_BASE_URL}/api/health`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsEditing(false);
                fetchHealthProfile(selectedStudentId);
                alert("Health profile saved!");
            }
        } catch (error) {
            console.error("Error saving profile", error);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-red-600 flex items-center gap-3">
                        <FaHeartbeat /> Student Health Card
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Emergency & Medical Information</p>
                </div>

                {user.role === 'ADMIN' && (
                    <div className="relative w-full md:w-96">
                        <div className="relative z-20">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Student..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto z-50">
                                {filteredStudents.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => {
                                            setSelectedStudentId(student.id);
                                            setSearchTerm('');
                                        }}
                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm dark:text-gray-200">{student.name}</div>
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Selection Status for Admin */}
            {user.role === 'ADMIN' && selectedStudentId && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex justify-between items-center border border-red-100 dark:border-red-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                            <FaUser />
                        </div>
                        <div>
                            <div className="text-xs text-red-500 font-bold uppercase">Viewing Profile Of</div>
                            <div className="font-bold text-gray-800 dark:text-white">
                                {students.find(s => s.id === selectedStudentId)?.name || 'Unknown Student'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedStudentId(null)}
                        className="text-sm text-red-600 hover:underline font-bold"
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="py-20 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading vital records...</p>
                </div>
            )}

            {/* Profile Content */}
            {!loading && selectedStudentId && (
                <>
                    <div className="flex justify-end mb-6">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-bold"
                            >
                                {healthData ? 'Edit Profile' : 'Create Profile'}
                            </button>
                        )}
                    </div>

                    {!isEditing && healthData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Vitals Card */}
                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                                <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                                    Physical Vitals
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl text-center bg-gray-50 dark:bg-gray-800">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Blood</div>
                                        <div className="text-2xl font-black text-red-600">{healthData.bloodGroup || 'N/A'}</div>
                                    </div>
                                    <div className="p-4 rounded-xl text-center bg-gray-50 dark:bg-gray-800">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Height</div>
                                        <div className="text-xl font-bold text-gray-800 dark:text-white">{healthData.height || '-'}</div>
                                    </div>
                                    <div className="p-4 rounded-xl text-center bg-gray-50 dark:bg-gray-800">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Weight</div>
                                        <div className="text-xl font-bold text-gray-800 dark:text-white">{healthData.weight || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Info */}
                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                                    <FaPills className="text-yellow-500" /> Allergies & Meds
                                </h2>
                                <div className="space-y-6">
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-wide block mb-1">Known Allergies</span>
                                        <div className="font-semibold text-gray-800 dark:text-white break-words text-lg">{healthData.allergies || 'None'}</div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <span className="text-xs font-bold text-blue-500 uppercase tracking-wide block mb-1">Ongoing Medications</span>
                                        <div className="font-semibold text-gray-800 dark:text-white break-words text-lg">{healthData.medications || 'None'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="glass-panel p-6 rounded-2xl col-span-full border-2 border-red-100 dark:border-red-900/50 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <FaPhone className="text-9xl text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600 relative z-10">
                                    <FaPhone /> Emergency Contacts
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="bg-red-100 p-3 rounded-full text-red-600 text-xl font-bold">SOS</div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase">Primary Contact</div>
                                            <div className="text-lg font-bold dark:text-white mt-1">{healthData.emergencyContactName}</div>
                                            <a href={`tel:${healthData.emergencyContactNumber}`} className="text-xl font-black text-red-600 hover:underline block mt-0.5">
                                                {healthData.emergencyContactNumber}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-xl"><FaUserMd /></div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase">Family Doctor</div>
                                            <div className="text-lg font-bold dark:text-white mt-1">{healthData.doctorName}</div>
                                            <a href={`tel:${healthData.doctorContact}`} className="text-lg font-semibold text-blue-600 hover:underline block mt-0.5">
                                                {healthData.doctorContact}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : isEditing ? (
                        <form onSubmit={handleSave} className="glass-panel p-8 rounded-2xl space-y-8 animate-fadeIn">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
                                <FaEdit className="text-blue-600" /> {healthData ? 'Edit Health Details' : 'Create New Profile'}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Blood Group</label>
                                    <select
                                        className="glass-input w-full dark:text-white"
                                        value={formData.bloodGroup}
                                        onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Height</label>
                                    <input
                                        type="text" placeholder="e.g. 165 cm"
                                        className="glass-input w-full dark:text-white"
                                        value={formData.height}
                                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Weight</label>
                                    <input
                                        type="text" placeholder="e.g. 55 kg"
                                        className="glass-input w-full dark:text-white"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Known Allergies</label>
                                    <textarea
                                        className="glass-input w-full dark:text-white resize-none"
                                        rows="3"
                                        value={formData.allergies}
                                        onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                                        placeholder="List any known allergies..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Medications</label>
                                    <textarea
                                        className="glass-input w-full dark:text-white resize-none"
                                        rows="3"
                                        value={formData.medications}
                                        onChange={e => setFormData({ ...formData, medications: e.target.value })}
                                        placeholder="Any ongoing medicines..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                <h3 className="font-bold text-red-600 mb-6 flex items-center gap-2">
                                    <FaPhone /> Emergency Contact Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Name</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full dark:text-white"
                                            value={formData.emergencyContactName}
                                            onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full dark:text-white"
                                            value={formData.emergencyContactNumber}
                                            onChange={e => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Doctor Name (Optional)</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full dark:text-white"
                                            value={formData.doctorName}
                                            onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Doctor Contact (Optional)</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full dark:text-white"
                                            value={formData.doctorContact}
                                            onChange={e => setFormData({ ...formData, doctorContact: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 shadow-lg font-bold flex items-center gap-2"
                                >
                                    <FaSave /> Save Profile
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-full mb-4 shadow-sm">
                                <FaHeartbeat className="text-5xl text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">No Health Records Found</h3>
                            <p className="text-gray-500 mb-8 mt-2 max-w-md mx-auto">This student hasn't added their health information yet. Please create a profile to ensure their safety.</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-bold shadow-lg"
                            >
                                Create Health Profile
                            </button>
                        </div>
                    )}
                </>
            )}

            {!loading && user.role === 'ADMIN' && !selectedStudentId && (
                <div className="text-center py-20">
                    <div className="inline-block p-6 bg-red-50 dark:bg-red-900/10 rounded-full mb-4">
                        <FaSearch className="text-5xl text-red-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-400">Search for a Student</h2>
                    <p className="text-gray-400">Use the search bar above to find a student's health record.</p>
                </div>
            )}
        </div>
    );
};

export default HealthProfile;
