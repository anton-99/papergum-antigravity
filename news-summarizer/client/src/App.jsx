import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NewsFeed from './components/NewsFeed';
import SummaryModal from './components/SummaryModal';

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [news, setNews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSummary, setCurrentSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const fetchNews = async (category) => {
    try {
      const response = await fetch(`http://localhost:5000/api/news?category=${category}`);
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleSummarize = async (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    setIsSummarizing(true);
    setCurrentSummary('');

    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: article.summary }) // Sending summary as text for now
      });
      const data = await response.json();
      setCurrentSummary(data.summary);
    } catch (error) {
      console.error('Error summarizing:', error);
      setCurrentSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="app">
      <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <main className="container" style={{ marginTop: '80px', paddingBottom: '40px' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {activeCategory === 'All' ? 'Latest Headlines' : `${activeCategory} News`}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Stay updated with the most important stories of the day.
          </p>
        </div>

        <NewsFeed news={news} onSummarize={handleSummarize} />
      </main>

      <SummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        summary={currentSummary}
        isLoading={isSummarizing}
        title={selectedArticle?.title}
      />
    </div>
  );
}

export default App;
