import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import './SummaryModal.css';

const SummaryModal = ({ isOpen, onClose, title, article }) => {
    const [keyPoints, setKeyPoints] = useState([]);
    const [detailedSummary, setDetailedSummary] = useState('');
    const [sources, setSources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !title) return;

        const fetchEnrichment = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/enrich?title=${encodeURIComponent(title)}`);
                if (!res.ok) throw new Error('Enrichment fetch failed');
                const data = await res.json();

                setKeyPoints(data.keyPoints || []);
                setDetailedSummary(data.detailedSummary || '');
                setSources(data.sources || []);
            } catch (error) {
                console.error('Error fetching summary:', error);
                // Fallback or error state could be handled here
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnrichment();
    }, [isOpen, title]);

    if (!isOpen) return null;

    // Use article image if available, otherwise fallback
    const imageUrl = article?.imageUrl && !article.imageUrl.includes('placehold.co')
        ? article.imageUrl
        : null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Hero Image */}
                {imageUrl && (
                    <div className="hero-image">
                        <img src={imageUrl} alt={title} />
                    </div>
                )}

                {/* Content */}
                <div className="modal-body">
                    {/* Title */}
                    <h1 className="article-title">{title}</h1>

                    {/* Meta */}
                    <div className="meta">
                        <span className="source-date">
                            {new Date().toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                        {sources.length > 0 && (
                            <span className="source-count">{sources.length} Quellen</span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Generating summary...</p>
                        </div>
                    ) : (
                        <>
                            {/* Key Points Section */}
                            <div className="key-points">
                                <ul>
                                    {keyPoints.map((point, i) => (
                                        <li key={i}>{point}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Detailed Summary Section */}
                            <div className="detailed-summary">
                                <div className="summary-text">
                                    {detailedSummary.split('\n\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Sources at the end */}
                            {sources.length > 0 && (
                                <div className="sources">
                                    <h3>Originalquellen</h3>
                                    <div className="sources-list">
                                        {sources.map((source, i) => (
                                            <a
                                                key={i}
                                                href={source.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="source-card"
                                            >
                                                <div className="source-icon">{i + 1}</div>
                                                <div className="source-info">
                                                    <strong>{source.name}</strong>
                                                    <span className="source-date">
                                                        {new Date(source.pubDate).toLocaleDateString('de-DE', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <ExternalLink size={16} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
