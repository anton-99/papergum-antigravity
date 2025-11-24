'use client';

import React, { useState, useEffect } from 'react';
import NewsCard from '@/components/NewsCard';
import PerplexityModal from '@/components/PerplexityModal';
import { Newspaper } from 'lucide-react';

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        if (Array.isArray(data)) {
          setNews(data);
        } else {
          console.error("Data is not an array:", data);
          setNews([]);
        }
      } catch (error) {
        console.error("Failed to fetch news", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <main className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-opacity-90 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--glass-bg)', borderBottom: '2px solid var(--border-color)' }}>
        <div className="container flex items-center h-20 justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--text-primary)',
              boxShadow: '2px 2px 0px var(--accent-color)'
            }}>
              <img src="/icon.jpg" alt="Papergum Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Paper<span style={{ color: 'var(--accent-color)' }}>gum</span>
            </span>
          </div>
        </div>
      </header>

      <div className="container mt-8" style={{ marginTop: '2rem' }}>
        <div className="mb-8 text-center">
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Was gibt's Neues?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Deine tägliche Dosis Nachrichten, <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>frisch gekaut!</span>
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            Lade Nachrichten...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
            Fehler: {error}. Bitte versuche es später erneut.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {news.map(item => (
              <NewsCard
                key={item.id}
                news={item}
                onSummarize={setSelectedArticle}
              />
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <PerplexityModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </main>
  );
}
