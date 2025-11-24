import React from 'react';
import { Clock, ExternalLink, MessageSquare } from 'lucide-react';
import styles from './NewsCard.module.css';

const NewsCard = ({ news, onSummarize }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).format(date);
    };

    const sourceCount = news.sources ? news.sources.length : 1;
    const hasMultipleSources = sourceCount > 1;

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={news.imageUrl} alt={news.title} className={styles.image} />
                {hasMultipleSources && (
                    <span className={styles.sourceCount}>{sourceCount} Quellen</span>
                )}
                {!hasMultipleSources && news.sources && (
                    <span className={styles.category}>{news.sources[0].name}</span>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.meta}>
                    <Clock size={14} /> <span>{formatDate(news.pubDate)}</span>
                </div>

                <h3 className={styles.title}>{news.title}</h3>
                <p className={styles.excerpt}>{(news.summary || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}...</p>

                {hasMultipleSources && (
                    <div className={styles.sources}>
                        {news.sources.map((source, i) => (
                            <span key={i} className={styles.sourceTag}>{source.name}</span>
                        ))}
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        className="btn btn-primary"
                        onClick={() => onSummarize(news)}
                    >
                        <MessageSquare size={16} />
                        Zusammenfassen
                    </button>

                    <a href={news.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Original <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
