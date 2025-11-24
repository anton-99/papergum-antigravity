import React from 'react';
import { Sparkles, ExternalLink, Clock } from 'lucide-react';
import './NewsCard.css';

const NewsCard = ({ news, onSummarize }) => {
    return (
        <div className="news-card animate-fade-in">
            <div className="card-image-container">
                <img src={news.imageUrl} alt={news.title} className="card-image" />
                <span className="card-category">{news.category}</span>
            </div>

            <div className="card-content">
                <div className="card-meta">
                    <span className="card-source">{news.source}</span>
                    <span className="card-dot">•</span>
                    <span className="card-time"><Clock size={14} /> 2h ago</span>
                </div>

                <h3 className="card-title">{news.title}</h3>
                <p className="card-excerpt">{news.summary}</p>

                <div className="card-actions">
                    <button
                        className="btn btn-primary btn-sm summarize-btn"
                        onClick={() => onSummarize(news)}
                    >
                        <Sparkles size={16} />
                        Summarize
                    </button>

                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="read-more-link">
                        Read Full <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
