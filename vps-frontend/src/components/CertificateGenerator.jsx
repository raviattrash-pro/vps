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

    // Print Handling
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Certificate_${generatedCert?.student?.name || 'Student'}_${new Date().toISOString().split('T')[0]}`,
        pageStyle: `
        @page {
            size: A4 landscape;
            margin: 10mm;
        }
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin: 0;
                padding: 0;
            }
            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
      `
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

    // Enhanced Ornamental SVG Corners with intricate designs
    const CornerOrnament = ({ className }) => (
        <svg className={`absolute w-32 h-32 ${className}`} viewBox="0 0 120 120" fill="none">
            {/* Outer ornate border */}
            <path d="M0 0 L45 0 C35 0 30 5 25 10 C20 15 15 20 10 25 C5 30 0 35 0 45 Z"
                fill="url(#goldGradient)" opacity="0.9" />
            {/* Inner decorative layer */}
            <path d="M5 5 L40 5 C32 5 28 8 24 12 C20 16 16 20 12 24 C8 28 5 32 5 40 Z"
                fill="#D4AF37" opacity="0.7" />
            {/* Filigree details */}
            <circle cx="15" cy="15" r="3" fill="#8B6914" opacity="0.8" />
            <circle cx="25" cy="8" r="2" fill="#FFD700" opacity="0.6" />
            <circle cx="8" cy="25" r="2" fill="#FFD700" opacity="0.6" />
            {/* Decorative curves */}
            <path d="M0 20 Q10 15 20 0" stroke="#8B6914" strokeWidth="1" opacity="0.5" />
            <path d="M0 30 Q15 20 30 0" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" />
            {/* Gradient definition */}
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
            </defs>
        </svg>
    );

    // Decorative Divider
    const DecorativeDivider = () => (
        <svg className="w-48 h-4 mx-auto" viewBox="0 0 200 20" fill="none">
            <path d="M0 10 Q50 5 100 10 Q150 15 200 10" stroke="url(#dividerGradient)" strokeWidth="2" />
            <circle cx="100" cy="10" r="4" fill="#D4AF37" />
            <circle cx="40" cy="10" r="2" fill="#B8860B" />
            <circle cx="160" cy="10" r="2" fill="#B8860B" />
            <defs>
                <linearGradient id="dividerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
                </linearGradient>
            </defs>
        </svg>
    );

    // Enhanced Certificate Component
    const CertificateContent = ({ forPrint = false }) => (
        <div
            className="relative bg-white text-black overflow-hidden"
            style={{
                width: forPrint ? '277mm' : '900px',
                height: forPrint ? '190mm' : '637px',
                fontFamily: '"Georgia", serif',
                background: 'linear-gradient(135deg, #ffffff 0%, #fefaf6 100%)'
            }}
        >
            {/* Ornate outer border with gradient */}
            <div
                className="absolute inset-3 pointer-events-none z-20"
                style={{
                    border: '6px double',
                    borderImage: 'linear-gradient(135deg, #B8860B, #FFD700, #D4AF37, #B8860B) 1',
                    boxShadow: 'inset 0 0 20px rgba(184, 134, 11, 0.1)'
                }}
            />

            {/* Inner elegant border */}
            <div
                className="absolute pointer-events-none z-20"
                style={{
                    top: '18px',
                    left: '18px',
                    right: '18px',
                    bottom: '18px',
                    border: '2px solid #D4AF37',
                    opacity: 0.5
                }}
            />

            {/* Corner ornaments */}
            <CornerOrnament className="top-0 left-0" />
            <CornerOrnament className="top-0 right-0 transform scale-x-[-1]" />
            <CornerOrnament className="bottom-0 left-0 transform scale-y-[-1]" />
            <CornerOrnament className="bottom-0 right-0 transform scale-x-[-1] scale-y-[-1]" />

            {/* Subtle background pattern */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none select-none z-0"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        #D4AF37 10px,
                        #D4AF37 11px
                    )`
                }}
            />

            {/* Authenticity Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none z-0">
                <div
                    className="rounded-full flex items-center justify-center font-black"
                    style={{
                        width: '400px',
                        height: '400px',
                        border: '25px solid #B8860B',
                        fontSize: '120px',
                        transform: 'rotate(-20deg)',
                        color: '#8B6914'
                    }}
                >
                    VPS
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col h-full px-20 py-12 justify-between text-center">
                {/* Header */}
                <header className="space-y-3">
                    <div
                        className="w-20 h-20 text-white text-3xl font-black rounded-full flex items-center justify-center mx-auto mb-4 font-sans shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #B8860B 0%, #FFD700 50%, #D4AF37 100%)'
                        }}
                    >
                        VPS
                    </div>
                    <h1
                        className="font-bold uppercase mb-2"
                        style={{
                            fontSize: '3.5rem',
                            letterSpacing: '0.3em',
                            background: 'linear-gradient(135deg, #8B6914 0%, #B8860B 50%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontFamily: '"Times New Roman", serif',
                            textShadow: '2px 2px 4px rgba(184, 134, 11, 0.1)'
                        }}
                    >
                        Vision Public School
                    </h1>
                    <p
                        className="font-semibold tracking-wide"
                        style={{
                            color: '#6B5D4F',
                            fontSize: '0.95rem',
                            letterSpacing: '0.1em'
                        }}
                    >
                        Excellence in Education • Established 2000
                    </p>
                    <div className="mt-6">
                        <DecorativeDivider />
                    </div>
                </header>

                {/* Content */}
                <main className="py-6 space-y-6">
                    <h2
                        className="italic font-serif mb-8"
                        style={{
                            fontSize: '2.8rem',
                            color: '#1e3a8a',
                            fontWeight: '600',
                            textShadow: '1px 1px 2px rgba(30, 58, 138, 0.1)'
                        }}
                    >
                        {generatedCert?.type === 'STUDY' ? 'Certificate of Bonafide' :
                            generatedCert?.type === 'CHARACTER' ? 'Certificate of Character' :
                                generatedCert?.type === 'TRANSFER' ? 'Transfer Certificate' : 'Certificate of Merit'}
                    </h2>

                    <div className="px-12 space-y-4" style={{ lineHeight: '2.2' }}>
                        <p className="text-gray-800" style={{ fontSize: '1.25rem' }}>
                            This is to certify that{' '}
                            <span
                                className="font-bold italic font-serif px-3 py-1 mx-2"
                                style={{
                                    fontSize: '1.75rem',
                                    borderBottom: '3px double #B8860B',
                                    color: '#1e3a8a',
                                    display: 'inline-block'
                                }}
                            >
                                {generatedCert?.student?.name || '.....................'}
                            </span>
                        </p>
                        <p className="text-gray-800" style={{ fontSize: '1.25rem' }}>
                            is a bona fide student of this institution, currently studying in{' '}
                            <span
                                className="font-bold px-2"
                                style={{
                                    fontSize: '1.5rem',
                                    color: '#1e3a8a'
                                }}
                            >
                                Class {generatedCert?.student?.className || '...'}
                            </span>
                        </p>
                        <p
                            className="text-gray-600 italic mt-4"
                            style={{
                                fontSize: '1rem',
                                lineHeight: '1.8',
                                borderLeft: '3px solid #D4AF37',
                                paddingLeft: '20px',
                                marginTop: '1.5rem'
                            }}
                        >
                            {generatedCert?.type === 'CHARACTER' && "This student demonstrates exemplary behavior, high moral character, and outstanding conduct in all academic and co-curricular activities."}
                            {generatedCert?.type === 'STUDY' && "This student is a dedicated and sincere pupil, currently enrolled and actively participating in this academic session."}
                            {generatedCert?.type === 'TRANSFER' && "This student bears an excellent moral character, has fulfilled all academic requirements, and has cleared all institutional dues."}
                            {generatedCert?.type === 'MERIT' && "This award is presented in recognition of exceptional academic performance, outstanding achievements, and unwavering dedication to excellence."}
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="flex justify-between items-end px-8">
                    <div className="text-center">
                        <p className="font-bold text-lg mb-2" style={{ color: '#1e3a8a' }}>
                            {generatedCert?.issueDate ? new Date(generatedCert.issueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'Date'}
                        </p>
                        <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                        <p
                            className="text-xs uppercase mt-2 tracking-widest font-semibold"
                            style={{ color: '#6B5D4F' }}
                        >
                            Date of Issue
                        </p>
                    </div>

                    <div className="text-center relative">
                        {/* Enhanced Gold Seal with 3D effect */}
                        <div
                            className="rounded-full flex items-center justify-center shadow-2xl relative"
                            style={{
                                width: '100px',
                                height: '100px',
                                background: 'radial-gradient(circle at 30% 30%, #FFD700, #D4AF37, #B8860B)',
                                border: '5px double #8B6914',
                                boxShadow: '0 4px 15px rgba(184, 134, 11, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <FaStamp
                                className="opacity-90"
                                style={{
                                    fontSize: '3rem',
                                    color: '#8B6914',
                                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
                                }}
                            />
                        </div>
                        <div
                            className="text-xs font-bold mt-2 tracking-wider"
                            style={{ color: '#6B5D4F' }}
                        >
                            OFFICIAL SEAL
                        </div>
                    </div>

                    <div className="text-center">
                        <div
                            className="mb-2"
                            style={{
                                fontFamily: 'cursive',
                                fontSize: '2rem',
                                color: '#1e3a8a',
                                fontWeight: '600'
                            }}
                        >
                            Principal Sign
                        </div>
                        <div className="w-44 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                        <p
                            className="text-xs uppercase mt-2 tracking-widest font-semibold"
                            style={{ color: '#6B5D4F' }}
                        >
                            Principal Signature
                        </p>
                    </div>
                </footer>

                {/* Certificate Number at bottom */}
                <div
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-mono tracking-wider"
                    style={{ color: '#999', opacity: 0.7 }}
                >
                    Certificate No: {generatedCert?.certificateNumber || 'XXXX-XXXX'}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 min-h-screen">
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
                style={{ padding: '30px', maxWidth: '100%', margin: '0 auto' }}
            >
                <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full relative">
                        <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>Student Name</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="glass-input pl-10 w-full"
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setStudentId('');
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
                                            setSearchTerm(student.name);
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
                        {studentId && <div className="text-xs text-green-500 font-bold mt-2 ml-2 flex items-center gap-1">✅ Student Selected (ID: {studentId})</div>}
                    </div>
                    <div className="flex-1 w-full">
                        <label style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>Document Type</label>
                        <select
                            className="glass-input appearance-none w-full"
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
                        className="glass-btn px-8 py-3 w-full md:w-auto flex items-center justify-center gap-2 font-bold whitespace-nowrap"
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : 'Generate Preview'}
                    </button>
                </form>
            </motion.div>

            <AnimatePresence mode="wait">
                {generatedCert && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="space-y-6 flex flex-col items-center"
                    >
                        {/* Header */}
                        <div
                            className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-yellow-500 w-full"
                            style={{ maxWidth: '900px' }}
                        >
                            <div>
                                <h3 className="font-black text-xl text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                                    <span className="text-yellow-500">★</span> Certificate Ready
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">Ref: {generatedCert.certificateNumber}</p>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 transform hover:scale-105"
                            >
                                <FaPrint /> Print Official Copy
                            </button>
                        </div>

                        {/* Certificate Preview */}
                        <div className="w-full overflow-x-auto p-4 md:p-8 bg-gradient-to-br from-gray-100/80 via-amber-50/30 to-gray-100/80 dark:from-black/20 dark:via-yellow-900/5 dark:to-black/20 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-2xl flex justify-center">
                            <CertificateContent forPrint={false} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HIDDEN PRINTABLE CERTIFICATE */}
            <div style={{ display: 'none' }}>
                {generatedCert && (
                    <div ref={componentRef}>
                        <CertificateContent forPrint={true} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateGenerator;
