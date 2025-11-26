'use client';
import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import styles from './PerplexityModal.module.css';

export default function PerplexityModal({ article, onClose }) {
    const [keyPoints, setKeyPoints] = useState([]);
    const [detailedSummary, setDetailedSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (article) {
            setTimeout(() => {
                // Extract sentences from summary/content for key points
                const text = article.summary || article.content || '';
                const cleanText = text.replace(/<[^>]*>/g, ''); // Remove HTML tags

                // Split into sentences and extract 3-5 key bullet points
                const sentences = cleanText
                    .split(/[.!?]+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 20 && s.length < 200) // Reasonable length
                    .slice(0, 5); // Max 5 points

                // Use extracted sentences as key points
                let mainPoints;
                if (sentences.length >= 3) {
                    mainPoints = sentences.map(s => s.charAt(0).toUpperCase() + s.slice(1));
                } else {
                    // Fallback: use title and generic points
                    mainPoints = [
                        article.title,
                        "Weitere Details in der ausführlichen Zusammenfassung"
                    ];
                }

                setKeyPoints(mainPoints.slice(0, 4)); // 3-4 points

                // Generate detailed summary from all article content
                let detailedText = cleanText;

                // If we have multiple sources, combine their summaries
                if (article.sources && article.sources.length > 1) {
                    const sourceSummaries = article.sources
                        .map(s => (s.summary || s.content || '').replace(/<[^>]*>/g, '').trim())
                        .filter(s => s.length > 50);

                    if (sourceSummaries.length > 0) {
                        detailedText = sourceSummaries.join('\n\n');
                    }
                }

                // Ensure we have a fallback
                if (!detailedText || detailedText.length < 50) {
                    detailedText = `Diese Nachricht behandelt aktuelle Entwicklungen.\n\nFür die neuesten Updates und ausführliche Analysen empfehlen wir, die vollständigen Artikel der jeweiligen Nachrichtenquellen zu lesen.`;
                }

                setDetailedSummary(detailedText);
                setIsLoading(false);
            }, 800);
        }
    }, [article]);

    if (!article) return null;

    const hasMultipleSources = article.sources && article.sources.length > 1;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Hero Image */}
                {article.imageUrl && (
                    <div className={styles.heroImage}>
                        <img src={article.imageUrl} alt={article.title} />
                    </div>
                )}

                {/* Content */}
                <div className={styles.content}>
                    {/* Title */}
                    <h1 className={styles.title}>{article.title}</h1>

                    {/* Meta */}
                    <div className={styles.meta}>
                        <span className={styles.date}>
                            {new Date(article.pubDate).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        {hasMultipleSources && (
                            <span className={styles.sourceCount}>{article.sources.length} Quellen</span>
                        )}
                    </div>

                    {/* Key Points Section */}
                    {isLoading ? (
                        <div className={styles.skeleton}>
                            <div className={styles.skeletonLine}></div>
                            <div className={styles.skeletonLine}></div>
                            <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.keyPoints}>
                                <ul>
                                    {keyPoints.map((point, i) => (
                                        <li key={i}>{point}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Detailed Summary Section */}
                            <div className={styles.detailedSummary}>
                                <div className={styles.summaryText}>
                                    {detailedSummary.split('\n\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Tag */}
                            {article.category && (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <span className={styles.tag}>{article.category}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Sources at the end */}
                    {hasMultipleSources ? (
                        <div className={styles.sources}>
                            <h3>Originalquellen</h3>
                            <div className={styles.sourcesList}>
                                {article.sources.map((source, i) => (
                                    <a
                                        key={i}
                                        href={source.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.sourceCard}
                                    >
                                        <div className={styles.sourceIcon}>{i + 1}</div>
                                        <div className={styles.sourceInfo}>
                                            <strong>{source.name}</strong>
                                            <span className={styles.sourceDate}>
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
                    ) : (
                        <div className={styles.sources}>
                            <h3>Originalquelle</h3>
                            <div className={styles.sourcesList}>
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.sourceCard}
                                >
                                    <div className={styles.sourceIcon}>1</div>
                                    <div className={styles.sourceInfo}>
                                        <strong>{article.sources?.[0]?.name || 'Quelle'}</strong>
                                        <span className={styles.sourceDate}>
                                            {new Date(article.pubDate).toLocaleDateString('de-DE', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
