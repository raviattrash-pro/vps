import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';

const ComingSoon = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);

    const isAdmin = user && user.role === 'ADMIN';

    useEffect(() => {
        if (isAdmin) {
            fetch(`${API_BASE_URL}/api/feedback`)
                .then(res => res.json())
                .then(data => setFeedbacks(data.reverse()))
                .catch(err => console.error(err));
        }
    }, [user]);

    const submitFeedback = async () => {
        if (!message) return;
        try {
            const feedback = {
                message,
                userId: user.id,
                userName: user.name,
                userRole: user.role
            };
            const res = await fetch(`${API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback)
            });
            if (res.ok) {
                alert('Feedback Submitted! Thank you.');
                setMessage('');
            } else {
                alert('Failed to submit.');
            }
        } catch (e) {
            console.error(e);
            alert('Error submitting feedback');
        }
    };

    return (
        <div className="page-container" style={{ padding: '20px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '20px', color: '#2D6A4F' }}>
                {isAdmin ? 'User Feedback & Issues' : 'Coming Soon / Feedback'}
            </h1>

            {isAdmin ? (
                /* Admin View: List of Feedbacks */
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                    {feedbacks.length === 0 ? <p style={{ textAlign: 'center' }}>No feedback received yet.</p> : (
                        feedbacks.map(f => (
                            <div key={f.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong style={{ color: '#2D6A4F' }}>{f.userName} ({f.userRole})</strong>
                                    <span style={{ fontSize: '12px', color: '#888' }}>{f.date}</span>
                                </div>
                                <p style={{ margin: 0, color: '#333' }}>{f.message}</p>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* User View: Submit Feedback */
                <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <h3>We Value Your Feedback</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Have a feature request or facing an issue? Let us know!
                    </p>
                    <textarea
                        rows="5"
                        placeholder="Write your message here..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px' }}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={submitFeedback}
                    >
                        Submit Feedback
                    </button>
                </div>
            )}
        </div>
    );
};

export default ComingSoon;
