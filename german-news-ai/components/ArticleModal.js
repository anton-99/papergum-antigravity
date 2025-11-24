import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import styles from './ArticleModal.module.css';

const ArticleModal = ({ article, onClose }) => {
    const [keyPoints, setKeyPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (article) {
            fetchKeyPoints();
        }
    }, [article]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const fetchKeyPoints = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleContext: article })
            });
            const data = await res.json();
            setKeyPoints(JSON.parse(data.response));
        } catch (error) {
            console.error(error);
            setKeyPoints(["Fehler beim Laden der Zusammenfassung."]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setChatHistory(prev => [...prev, userMsg]);
        setInput('');

        // Add temporary loading message
        setChatHistory(prev => [...prev, { role: 'assistant', content: '...', loading: true }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content, articleContext: article })
            });
            const data = await res.json();

            setChatHistory(prev => {
                const newHistory = prev.filter(msg => !msg.loading);
                return [...newHistory, { role: 'assistant', content: data.response }];
            });
        } catch (error) {
            setChatHistory(prev => {
                const newHistory = prev.filter(msg => !msg.loading);
                return [...newHistory, { role: 'assistant', content: "Entschuldigung, ich konnte das nicht verarbeiten." }];
            });
        }
    };

    if (!article) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>

                <div className={styles.content}>
                    <div className={styles.articleSection}>
                        <div className={styles.header}>
                            <span className={styles.source}>{article.source}</span>
                            <h2 className={styles.title}>{article.title}</h2>
                        </div>

                        <div className={styles.summaryBox}>
                            <h3 className={styles.sectionTitle}><Sparkles size={18} /> Wichtige Punkte</h3>
                            {loading ? (
                                <div className={styles.loader}>Generiere Zusammenfassung...</div>
                            ) : (
                                <ul className={styles.pointsList}>
                                    {keyPoints.map((point, i) => (
                                        <li key={i} className={styles.point}>{point}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className={styles.originalContent}>
                            <h4>Original-Auszug:</h4>
                            <p>{article.summary.replace(/<[^>]*>?/gm, '')}</p>
                        </div>
                    </div>

                    <div className={styles.chatSection}>
                        <div className={styles.chatHeader}>
                            <h3 className={styles.sectionTitle}><MessageSquare size={18} /> Fragen & Antworten</h3>
                        </div>

                        <div className={styles.chatMessages}>
                            {chatHistory.length === 0 && (
                                <div className={styles.emptyChat}>
                                    <p>Stellen Sie eine Frage zu diesem Artikel.</p>
                                    <div className={styles.suggestions}>
                                        <button onClick={() => setInput("Wer ist betroffen?")}>Wer ist betroffen?</button>
                                        <button onClick={() => setInput("Was sind die Folgen?")}>Was sind die Folgen?</button>
                                    </div>
                                </div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.aiMsg}`}>
                                    {msg.content}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className={styles.inputArea}>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Frage stellen..."
                                className={styles.input}
                            />
                            <button onClick={handleSend} className={styles.sendBtn}><Send size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleModal;
