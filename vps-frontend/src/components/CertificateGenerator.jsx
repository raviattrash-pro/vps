import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaCertificate, FaPrint, FaSearch, FaStamp } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence } from 'framer-motion';

const CertificateGenerator = () => {
    const { user } = useAuth();
    const [studentId, setStudentId] = useState('');
    const [type, setType] = useState('STUDY');
    const [generatedCert, setGeneratedCert] = useState(null);
    const [loading, setLoading] = useState(false);

    // Search State
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

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

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                student: { id: studentId },
                type: type
            };

            const response = await fetch(`${API_BASE_URL}/api/certificates/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedCert(data);
            } else {
                alert("Failed to generate. Check Student ID.");
            }
        } catch (error) {
            console.error("Error generating certificate", error);
        } finally {
            setLoading(false);
        }
    };

    // Ornamental SVG Corner
    const CornerOrnament = ({ className }) => (
        <svg className={`absolute text-yellow-600 w-24 h-24 ${className}`} viewBox="0 0 100 100" fill="currentColor">
            <path d="M0 0 L40 0 C20 0 20 20 0 40 Z M0 0 L0 40 C0 20 20 20 40 0 Z" />
            <path d="M5 5 L35 5 C20 5 20 20 5 35 Z" opacity="0.5" />
        </svg>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-500 dark:from-yellow-400 dark:to-amber-300">
                        <FaCertificate className="text-yellow-600 dark:text-yellow-400" /> Certificate Hub
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Issue Verified Official Documents</p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '25px', maxWidth: '900px', margin: '0 auto' }}
            >
                <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full relative">
                        <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Student Name</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="glass-input pl-10"
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setStudentId(''); // Reset ID on new search
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Search by Name..."
                                required={!studentId}
                            />
                        </div>
                        {showDropdown && searchTerm && !studentId && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto z-50">
                                {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => {
                                            setStudentId(student.id);
                                            setSearchTerm(student.name); // Show name in input
                                            setShowDropdown(false);
                                        }}
                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-xs">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm dark:text-gray-200">{student.name}</div>
                                            <div className="text-xs text-gray-500">Class {student.className}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {studentId && <div className="text-xs text-green-500 font-bold mt-1 ml-2">✓ Student Selected (ID: {studentId})</div>}
                    </div>
                    <div className="flex-1 w-full">
                        <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '5px' }}>Document Type</label>
                        <select
                            className="glass-input appearance-none"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="STUDY">Study / Bonafide Certificate</option>
                            <option value="CHARACTER">Character / Conduct Certificate</option>
                            <option value="TRANSFER">Transfer Certificate (TC)</option>
                            <option value="MERIT">Merit / Appreciation Award</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="glass-btn px-8 w-full md:w-auto flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : 'Generate Preview'}
                    </button>
                </form>
            </motion.div>

            <AnimatePresence>
                {generatedCert && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
                            <div>
                                <h3 className="font-bold text-lg mb-1">Preview Ready</h3>
                                <p className="text-gray-400 text-sm">Certificate #{generatedCert.certificateNumber}</p>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="mt-4 md:mt-0 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <FaPrint /> Print Official Copy
                            </button>
                        </div>

                        {/* Certificate Preview Area */}
                        <div className="overflow-auto p-8 bg-gray-200 dark:bg-black/50 rounded-3xl flex justify-center backdrop-blur-sm">
                            <div
                                ref={componentRef}
                                className="w-[800px] h-[600px] bg-[#fff] text-black relative shadow-2xl overflow-hidden print:w-[100%] print:h-[100%] print:shadow-none"
                                style={{ fontFamily: '"Georgia", serif' }}
                            >
                                {/* Border Frame */}
                                <div className="absolute inset-4 border-4 border-double border-yellow-700 pointer-events-none z-20"></div>
                                <CornerOrnament className="top-0 left-0" />
                                <CornerOrnament className="top-0 right-0 transform scale-x-[-1]" />
                                <CornerOrnament className="bottom-0 left-0 transform scale-y-[-1]" />
                                <CornerOrnament className="bottom-0 right-0 transform scale-x-[-1] scale-y-[-1]" />

                                {/* Authenticity Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                                    <div className="w-96 h-96 rounded-full border-[20px] border-black flex items-center justify-center text-9xl font-black rotate-[-20deg]">
                                        VPS
                                    </div>
                                </div>

                                <div className="relative z-10 flex flex-col h-full p-16 justify-between text-center">
                                    {/* Header */}
                                    <header>
                                        <div className="w-16 h-16 bg-yellow-600 text-white text-2xl font-black rounded-full flex items-center justify-center mx-auto mb-4 font-sans">VPS</div>
                                        <h1 className="text-5xl font-bold text-yellow-800 uppercase tracking-widest mb-2" style={{ fontFamily: '"Times New Roman", serif' }}>
                                            Vision Public School
                                        </h1>
                                        <p className="text-gray-600 font-medium tracking-wide">Excellence in Education • Est. 2000</p>
                                        <div className="w-24 h-1 bg-yellow-600 mx-auto mt-6"></div>
                                    </header>

                                    {/* Content */}
                                    <main className="py-4">
                                        <h2 className="text-4xl italic text-blue-900 mb-8 font-serif">
                                            {generatedCert.type === 'STUDY' ? 'Bonafide Certificate' :
                                                generatedCert.type === 'CHARACTER' ? 'Character Certificate' :
                                                    generatedCert.type === 'TRANSFER' ? 'Transfer Certificate' : 'Certificate of Merit'}
                                        </h2>

                                        <p className="text-xl leading-loose px-8 text-gray-800">
                                            This is to certify that <span className="font-bold text-2xl border-b-2 border-dashed border-gray-400 px-2 italic font-serif">{generatedCert.student ? generatedCert.student.name : '...................'}</span>
                                            <br />
                                            is a bona fide student of this institution, currently studying in
                                            <span className="font-bold text-2xl px-2">Class {generatedCert.student ? generatedCert.student.className : '...'}</span>.
                                            <br />
                                            <span className="text-base text-gray-600 mt-2 block">
                                                {generatedCert.type === 'CHARACTER' && "He/She shows exemplary behavior and high moral character."}
                                                {generatedCert.type === 'STUDY' && "He/She is a dedicated pupil and is currently enrolled for this academic session."}
                                            </span>
                                        </p>
                                    </main>

                                    {/* Footer */}
                                    <footer className="flex justify-between items-end px-4">
                                        <div className="text-center">
                                            <p className="font-bold text-lg">{new Date(generatedCert.issueDate).toLocaleDateString()}</p>
                                            <div className="w-32 h-px bg-black mt-2"></div>
                                            <p className="text-xs uppercase mt-1 tracking-widest text-gray-500">Date of Issue</p>
                                        </div>

                                        <div className="text-center relative">
                                            {/* Gold Seal */}
                                            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 shadow-lg border-4 border-yellow-300 border-dotted">
                                                <FaStamp className="text-5xl opacity-80" />
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="font-cursive text-3xl mb-1 text-blue-900" style={{ fontFamily: 'cursive' }}>Principal Sign</div>
                                            <div className="w-40 h-px bg-black mt-2"></div>
                                            <p className="text-xs uppercase mt-1 tracking-widest text-gray-500">Principal Signature</p>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CertificateGenerator;
