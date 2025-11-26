'use client';
import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import styles from './PerplexityModal.module.css';

export default function PerplexityModal({ article, onClose }) {
    // State for key points, detailed summary and loading
    const [keyPoints, setKeyPoints] = useState([]);
    const [detailedSummary, setDetailedSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasMultipleSources, setHasMultipleSources] = useState(false);

    // Helper to extract bullet points from a block of text
    const extractKeyPoints = (text) => {
        const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        // Split on sentence boundaries (simple heuristic)
        let sentences = clean
            .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
            .map((s) => s.trim())
            .filter((s) => s.length > 10);
        // If not enough, also split on semicolons/colons
        if (sentences.length < 3) {
            const extra = [];
            sentences.forEach((s) => {
                const parts = s.split(/[;:]/).map((p) => p.trim()).filter((p) => p.length > 10);
                extra.push(...parts);
            });
            sentences = extra;
        }
        // Deduplicate and limit to 5 points
        const uniq = [...new Set(sentences)];
        return uniq.slice(0, 5).map((s) => {
            let p = s.charAt(0).toUpperCase() + s.slice(1);
            if (!p.endsWith('.')) p += '.';
            return p;
        });
    };

    // Fetch enrichment data (key points + detailed summary) from backend
    useEffect(() => {
        if (!article) return;
        const fetchEnrichment = async () => {
            try {
                const res = await fetch(`/api/enrich?title=${encodeURIComponent(article.title)}`);
                if (!res.ok) throw new Error('Enrichment fetch failed');
                const data = await res.json();
                // Expected shape: { keyPoints: [], detailedSummary: '', sources: [] }
                const points = data.keyPoints && data.keyPoints.length ? data.keyPoints : extractKeyPoints(article.content || article.summary || '');
                setKeyPoints(points);
                setDetailedSummary(data.detailedSummary || article.content || article.summary || '');
                setHasMultipleSources(Array.isArray(data.sources) && data.sources.length > 1);
            } catch (e) {
                console.error(e);
                // Fallback to simple extraction from article itself
                const points = extractKeyPoints(article.content || article.summary || '');
                setKeyPoints(points);
                setDetailedSummary(article.content || article.summary || '');
                setHasMultipleSources(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEnrichment();
    }, [article]);

    if (!article) return null;

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
                                minute: '2-digit',
                            })}
                        </span>
                        {hasMultipleSources && (
                            <span className={styles.sourceCount}>{article.sources?.length || 0} Quellen</span>
                        )}
                    </div>

                    {/* Key Points Section */}
                    {isLoading ? (
                        <div className={styles.skeleton}>
                            <div className={styles.skeletonLine} />
                            <div className={styles.skeletonLine} />
                            <div className={styles.skeletonLine} style={{ width: '80%' }} />
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
                                                    minute: '2-digit',
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
                                                minute: '2-digit',
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
