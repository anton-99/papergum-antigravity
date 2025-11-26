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
                // Prioritize content over summary as it's likely longer
                const text = article.content || article.summary || '';
                const cleanText = text.replace(/<[^>]*>/g, '')
                    .replace(/\s+/g, ' ') // Normalize whitespace
                    .trim();

                // Split into sentences using a more robust regex that handles abbreviations better
                // This is still a simple heuristic but better than just [.!?]+
                let sentences = cleanText
                    .split(/(?<=[.!?])\s+(?=[A-Z])/)
                    .map(s => s.trim())
                    .filter(s => s.length > 10); // Keep sentences with some substance

                // If we don't have enough sentences, try splitting by semicolons or long clauses
                if (sentences.length < 3) {
                    const clauseSentences = [];
                    sentences.forEach(s => {
                        const clauses = s.split(/[;:]/).map(c => c.trim()).filter(c => c.length > 10);
                        if (clauses.length > 1) {
                            clauseSentences.push(...clauses);
                        } else {
                            clauseSentences.push(s);
                        }
                    });
                    sentences = clauseSentences;
                }

                // Deduplicate
                sentences = [...new Set(sentences)];

                let mainPoints = [];

                // Select up to 5 points
                if (sentences.length > 0) {
                    mainPoints = sentences.slice(0, 5).map(s => {
                        // Ensure it starts with uppercase
                        let point = s.charAt(0).toUpperCase() + s.slice(1);
                        // Ensure it doesn't end with punctuation if it's a bullet point style
                        // but for sentences, we might want to keep it. Let's keep it clean.
                        if (!point.endsWith('.')) point += '.';
                        return point;
                    });
                }

                // Fallback if we still have absolutely nothing (should be rare if article exists)
                if (mainPoints.length === 0) {
                    mainPoints = [article.title];
                }

                // If we have fewer than 3 points, we just show what we have. 
                // We explicitly DO NOT add generic filler text like "Weitere Details...".

                setKeyPoints(mainPoints);

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
