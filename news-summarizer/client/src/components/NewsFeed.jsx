import React from 'react';
import NewsCard from './NewsCard';
import './NewsFeed.css';

const NewsFeed = ({ news, onSummarize }) => {
    if (!news || news.length === 0) {
        return (
            <div className="empty-state">
                <p>No news found for this category.</p>
            </div>
        );
    }

    return (
        <div className="news-grid">
            {news.map(item => (
                <NewsCard key={item.id} news={item} onSummarize={onSummarize} />
            ))}
        </div>
    );
};

export default NewsFeed;
