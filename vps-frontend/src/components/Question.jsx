import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { FaArrowLeft, FaTrash, FaPaperPlane, FaUserCircle, FaChalkboardTeacher, FaQuestionCircle, FaCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Question = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [question, setQuestion] = useState('');
    const [questionsList, setQuestionsList] = useState([]);
    const [replyText, setReplyText] = useState({}); // Map of questionId -> text

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = () => {
        fetch(`${API_BASE_URL}/api/questions`)
            .then(res => res.json())
            .then(data => setQuestionsList(data.reverse()))
            .catch(e => console.error(e));
    };

    const handleSubmitQuestion = async () => {
        if (!question.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionText: question,
                    studentName: user ? user.name : 'Anonymous',
                    studentId: user ? user.id : null,
                    date: new Date().toISOString().split('T')[0]
                })
            });
            if (res.ok) {
                alert('Question Posted!');
                setQuestion('');
                fetchQuestions();
            } else {
                alert('Failed to post question');
            }
        } catch (e) { console.error(e); alert('Failed to submit question'); }
    };

    const handleDeleteQuestion = async (e, id) => {
        e.stopPropagation();
        console.log("DEBUG: Delete Question ID:", id);

        // Debug mode: No confirm
        // if (window.confirm("Delete this question?")) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/questions/${id}`, { method: 'DELETE' });
            console.log("DEBUG: Delete status:", res.status);

            if (res.ok) {
                alert('Question Deleted!');
                fetchQuestions();
            } else {
                const err = await res.text();
                console.error("DEBUG: Delete failed:", err);
                alert(`Failed to delete: ${res.status} - ${err}`);
            }
        } catch (e) { console.error(e); alert("Network error deleting question"); }
        // }
    };

    const handleReply = async (qId) => {
        const text = replyText[qId];
        if (!text || !text.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/questions/${qId}/answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answerText: text,
                    authorName: user.name,
                    authorRole: user.role,
                    authorId: user.id
                })
            });
            if (res.ok) {
                setReplyText({ ...replyText, [qId]: '' });
                fetchQuestions();
            } else {
                alert('Failed to post reply');
            }
        } catch (e) { alert("Failed to reply"); }
    };

    const handleDeleteAnswer = async (e, ansId) => {
        e.stopPropagation();
        console.log("DEBUG: Delete Answer ID:", ansId);

        // Debug mode
        // if (window.confirm("Delete this answer?")) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/answers/${ansId}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Answer Deleted!');
                fetchQuestions();
            } else {
                const err = await res.text();
                alert(`Failed to delete answer: ${res.status} - ${err}`);
            }
        } catch (e) { alert("Failed to delete answer"); }
        // }
    };

    const canReply = user && (user.role === 'ADMIN' || user.role === 'TEACHER');

    return (
        <div className="page-container" style={{ padding: '20px 20px 100px 20px' }}>
            <div className="header" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                <div onClick={() => navigate('/')} style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <FaArrowLeft color="var(--primary)" />
                </div>
                <h1 style={{ marginLeft: '15px', color: 'var(--primary)', fontSize: '28px' }}>Q&A Forum</h1>
            </div>

            {/* Ask Question Box */}
            <div className="glass-card" style={{ padding: '25px', marginBottom: '40px', borderLeft: '5px solid var(--primary)' }}>
                <h3 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaQuestionCircle /> Ask a Question
                </h3>
                <textarea
                    className="glass-input"
                    placeholder="What's your doubt? (e.g. When is the Math exam?)"
                    style={{ height: '100px', resize: 'none', fontSize: '16px', marginTop: '15px' }}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                    <button onClick={handleSubmitQuestion} className="glass-btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaPaperPlane /> Post Question
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <h2 style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCommentDots /> Recent Discussions
                </h2>

                {questionsList.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>No questions asked yet. Be the first!</p>
                ) : questionsList.map((q, i) => (
                    <div key={i} className="glass-card" style={{ padding: '25px', position: 'relative' }}>
                        {/* Question Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{
                                    width: '45px', height: '45px', borderRadius: '50%', background: '#ffcc80',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e65100', fontSize: '20px'
                                }}>
                                    <FaUserCircle />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'var(--text-main)' }}>{q.studentName}</h4>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.date}</span>
                                </div>
                            </div>
                            {(user && (user.id === q.studentId || user.role === 'ADMIN')) && (
                                <button
                                    onClick={(e) => handleDeleteQuestion(e, q.id)}
                                    style={{ background: '#ffebee', color: '#c62828', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Delete Question"
                                >
                                    <FaTrash size={12} />
                                </button>
                            )}
                        </div>

                        {/* Question Text */}
                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', fontSize: '16px', fontStyle: 'italic', borderLeft: '3px solid #ffa726' }}>
                            "{q.questionText}"
                        </div>

                        {/* Answers Section */}
                        <div style={{ marginTop: '20px', paddingLeft: '20px' }}>
                            {q.answers && q.answers.length > 0 && <h5 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Replies:</h5>}

                            {q.answers && q.answers.map((ans, j) => (
                                <div key={j} style={{
                                    display: 'flex', gap: '10px', marginBottom: '15px',
                                    background: ans.authorRole === 'TEACHER' || ans.authorRole === 'ADMIN' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.4)',
                                    padding: '10px', borderRadius: '12px'
                                }}>
                                    <div style={{ marginTop: '5px' }}>
                                        {ans.authorRole === 'TEACHER' || ans.authorRole === 'ADMIN' ? (
                                            <FaChalkboardTeacher color="#2e7d32" size={20} />
                                        ) : (
                                            <FaUserCircle color="#666" size={20} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '13px', color: ans.authorRole === 'TEACHER' || ans.authorRole === 'ADMIN' ? '#2e7d32' : 'var(--text-main)' }}>
                                                {ans.authorName} {ans.authorRole !== 'STUDENT' && <span style={{ fontSize: '10px', border: '1px solid currentColor', padding: '1px 4px', borderRadius: '4px', marginLeft: '5px' }}>{ans.authorRole}</span>}
                                            </span>
                                            {(user && (user.id === ans.authorId || user.role === 'ADMIN')) && (
                                                <FaTrash color="red" size={10} style={{ cursor: 'pointer' }} onClick={(e) => handleDeleteAnswer(e, ans.id)} />
                                            )}
                                        </div>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', lineHeight: '1.4' }}>{ans.answerText}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Reply Input */}
                            {canReply && (
                                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <FaChalkboardTeacher size={14} />
                                    </div>
                                    <input
                                        className="glass-input"
                                        placeholder="Write a reply..."
                                        style={{ flex: 1, padding: '10px', borderRadius: '20px', fontSize: '14px' }}
                                        value={replyText[q.id] || ''}
                                        onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleReply(q.id);
                                        }}
                                    />
                                    <button
                                        onClick={() => handleReply(q.id)}
                                        className="glass-btn btn-primary"
                                        style={{ padding: '8px 15px', borderRadius: '20px', fontSize: '12px' }}
                                    >
                                        Reply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Question;
