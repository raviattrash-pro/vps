import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaHeartbeat, FaPhone, FaUserMd, FaPills, FaAllergies } from 'react-icons/fa';

const HealthProfile = () => {
    const { user } = useAuth();
    const [healthData, setHealthData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

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
            fetchHealthProfile();
        }
    }, [user]);

    const fetchHealthProfile = async () => {
        setLoading(true);
        try {
            // For now assuming user is the student or we use user.id to find student.
            // If Admin, this page might need a "Select Student" dropdown, but let's stick to Student Dashboard for now.
            // Or Admin viewing a specific student. 
            // Simplified: Current user's profile if Student.

            const response = await fetch(`${API_BASE_URL}/api/health/${user.id}`);
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
                // No profile yet
                setHealthData(null);
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
                student: { id: user.id }
            };

            const response = await fetch(`${API_BASE_URL}/api/health`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsEditing(false);
                fetchHealthProfile();
            }
        } catch (error) {
            console.error("Error saving profile", error);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Health Profile...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-red-600 flex items-center gap-3">
                        <FaHeartbeat /> Student Health Card
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Emergency & Medical Information</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </header>

            {!isEditing && healthData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vitals Card */}
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                            Physical Vitals
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
                                <div className="text-xs text-red-500 uppercase font-bold">Blood Group</div>
                                <div className="text-3xl font-black text-red-700 dark:text-red-400">{healthData.bloodGroup || 'N/A'}</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                                <div className="text-xs text-blue-500 uppercase font-bold">Height</div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{healthData.height || '-'}</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                                <div className="text-xs text-purple-500 uppercase font-bold">Weight</div>
                                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{healthData.weight || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                            <FaPills className="text-yellow-500" /> Allergies & Meds
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-500">Known Allergies:</span>
                                <div className="font-semibold text-red-600 text-lg break-words">{healthData.allergies || 'None'}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Ongoing Medications:</span>
                                <div className="font-semibold text-gray-800 dark:text-gray-200 break-words">{healthData.medications || 'None'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="glass-panel p-6 rounded-2xl col-span-full border-2 border-red-100 dark:border-red-900/50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                            <FaPhone /> Emergency Contacts
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-red-100 p-3 rounded-full text-red-600 text-xl font-bold">SOS</div>
                                <div>
                                    <div className="text-sm text-gray-500">Primary Emergency Contact</div>
                                    <div className="text-xl font-bold dark:text-white">{healthData.emergencyContactName}</div>
                                    <a href={`tel:${healthData.emergencyContactNumber}`} className="text-2xl font-black text-red-600 hover:underline block mt-1">
                                        {healthData.emergencyContactNumber}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-xl"><FaUserMd /></div>
                                <div>
                                    <div className="text-sm text-gray-500">Family Doctor</div>
                                    <div className="text-xl font-bold dark:text-white">{healthData.doctorName}</div>
                                    <a href={`tel:${healthData.doctorContact}`} className="text-lg font-semibold text-blue-600 hover:underline block mt-1">
                                        {healthData.doctorContact}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : isEditing ? (
                <form onSubmit={handleSave} className="glass-panel p-8 rounded-2xl space-y-6">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Health Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                            <select
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.bloodGroup}
                                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height</label>
                            <input
                                type="text" placeholder="e.g. 165 cm"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.height}
                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                            <input
                                type="text" placeholder="e.g. 55 kg"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies</label>
                            <textarea
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.allergies}
                                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                                placeholder="List any known allergies..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Medications</label>
                            <textarea
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.medications}
                                onChange={e => setFormData({ ...formData, medications: e.target.value })}
                                placeholder="Any ongoing medicines..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="border-t pt-6 dark:border-gray-700">
                        <h3 className="font-bold text-red-600 mb-4">Emergency Contacts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.emergencyContactName}
                                    onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.emergencyContactNumber}
                                    onChange={e => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.doctorName}
                                    onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor Contact</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg"
                        >
                            Save Health Profile
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-block p-4 bg-gray-100 rounded-full mb-4 dark:bg-gray-800">
                        <FaHeartbeat className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No Health Profile Created</h3>
                    <p className="text-gray-500 mb-6">Please add vital medical information.</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                        Create Profile
                    </button>
                </div>
            )}
        </div>
    );
};

export default HealthProfile;
