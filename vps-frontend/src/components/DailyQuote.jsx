import React, { useState, useEffect } from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const DailyQuote = () => {
    const [quote, setQuote] = useState({ text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" });

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const res = await fetch('https://api.quotable.io/random?tags=education|wisdom|inspirational');
                if (res.ok) {
                    const data = await res.json();
                    setQuote({ text: data.content, author: data.author });
                }
            } catch (e) {
                console.log("Using default quote");
            }
        };

        fetchQuote();
    }, []);

    return (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--accent)' }}>
            <FaQuoteLeft style={{ position: 'absolute', top: '10px', right: '20px', fontSize: '40px', color: 'var(--primary)', opacity: 0.1 }} />
            <p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '10px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                "{quote.text}"
            </p>
            <p style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                — {quote.author}
            </p>
        </div>
    );
};

export default DailyQuote;
