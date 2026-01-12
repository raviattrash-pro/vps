import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { FaCertificate, FaPrint, FaSearch } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';

const CertificateGenerator = () => {
    const { user } = useAuth();
    const [studentId, setStudentId] = useState('');
    const [type, setType] = useState('STUDY');
    const [generatedCert, setGeneratedCert] = useState(null);
    const [loading, setLoading] = useState(false);

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app we might fetch Student Details first to confirm name
            // For now, assume backend handles validation or we just send ID

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

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                    <FaCertificate /> Certificate Generator
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Issue official school documents</p>
            </header>

            <div className="glass-panel p-6 rounded-2xl">
                <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={studentId}
                            onChange={e => setStudentId(e.target.value)}
                            placeholder="Enter Student ID"
                            required
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate Type</label>
                        <select
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="STUDY">Study / Bonafide</option>
                            <option value="CHARACTER">Character Certificate</option>
                            <option value="TRANSFER">Transfer Certificate (TC)</option>
                            <option value="MERIT">Merit / Appreciation</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold shadow-lg"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </form>
            </div>

            {generatedCert && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="text-gray-600 dark:text-gray-300">
                            Certificate #: <span className="font-mono font-bold text-black dark:text-white">{generatedCert.certificateNumber}</span>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <FaPrint /> Print Certificate
                        </button>
                    </div>

                    {/* Certificate Preview Area */}
                    <div className="overflow-auto p-4 bg-gray-200 dark:bg-gray-900 rounded-2xl flex justify-center">
                        <div
                            ref={componentRef}
                            className="w-[800px] h-[600px] bg-white text-black p-12 relative shadow-2xl border-[20px] border-double border-yellow-600"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 0%, #fefbea 100%)' }}
                        >
                            {/* Watermark/Logo placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <div className="text-9xl font-black">VPS</div>
                            </div>

                            <div className="text-center space-y-6 h-full flex flex-col justify-between">
                                <div>
                                    <h1 className="text-4xl font-serif font-bold text-yellow-800 uppercase tracking-widest mb-1">Vision Public School</h1>
                                    <p className="text-sm text-gray-600">Excellence in Education • Est. 2000</p>
                                    <div className="w-full h-1 bg-yellow-600 mt-4 mx-auto max-w-lg"></div>
                                </div>

                                <div className="py-8">
                                    <h2 className="text-3xl font-cursive text-blue-900 mb-8 underline decoration-double decoration-yellow-400/50">
                                        {generatedCert.type === 'STUDY' ? 'Bonafide Certificate' :
                                            generatedCert.type === 'CHARACTER' ? 'Character Certificate' :
                                                generatedCert.type === 'TRANSFER' ? 'Transfer Certificate' : 'Certificate of Merit'}
                                    </h2>

                                    <p className="text-lg leading-loose font-serif px-12">
                                        This is to certify that <span className="font-bold text-xl border-b-2 border-dashed border-gray-400 px-2">{generatedCert.student ? generatedCert.student.name : 'Unknown'}</span>,
                                        son/daughter of the guardians,
                                        is a bona fide student of this institution studying in Class <span className="font-bold">{generatedCert.student ? generatedCert.student.className : 'N/A'}</span>.
                                        <br /><br />
                                        {generatedCert.type === 'CHARACTER' && "He/She bears a good moral character and has shown exemplary behavior during their time here."}
                                        {generatedCert.type === 'STUDY' && "He/She is a dedicated pupil and is currently enrolled for the academic session."}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end px-12 pb-8">
                                    <div className="text-center">
                                        <p className="font-bold">{new Date(generatedCert.issueDate).toLocaleDateString()}</p>
                                        <div className="w-32 h-px bg-black mt-1"></div>
                                        <p className="text-xs uppercase mt-1">Date</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-20 h-20 mb-2 mx-auto border-2 border-yellow-600 rounded-full flex items-center justify-center text-xs text-yellow-800 font-bold opacity-70 rotate-12">
                                            SEAL
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-signature text-2xl mb-1">Principal</div>
                                        <div className="w-40 h-px bg-black"></div>
                                        <p className="text-xs uppercase mt-1">Principal Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateGenerator;
