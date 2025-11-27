const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Parser = require('rss-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const parser = new Parser();

app.use(cors());
app.use(express.json());

const FEEDS = [
    {
        source: 'Tagesschau',
        url: 'https://www.tagesschau.de/xml/rss2/',
        category: 'General'
    },
    {
        source: 'n-tv',
        url: 'https://www.n-tv.de/rss',
        category: 'General'
    }
];

// Helper to parse RSS
const fetchNewsFromFeeds = async () => {
    let allNews = [];
    let idCounter = 1;

    for (const feed of FEEDS) {
        try {
            const feedContent = await parser.parseURL(feed.url);
            const items = feedContent.items.map(item => {
                // Try to find an image
                let imageUrl = 'https://placehold.co/600x400/334155/ffffff?text=News';
                if (item.enclosure && item.enclosure.url) {
                    imageUrl = item.enclosure.url;
                } else if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
                    imageUrl = item['media:content'].$.url;
                }

                return {
                    id: `${feed.source}-${idCounter++}`,
                    title: item.title,
                    summary: item.contentSnippet || item.content || "No summary available.",
                    source: feed.source,
                    category: feed.category, // RSS feeds often mix categories, we'll default to General or try to parse
                    imageUrl: imageUrl,
                    url: item.link,
                    pubDate: new Date(item.pubDate)
                };
            });
            allNews = [...allNews, ...items];
        } catch (error) {
            console.error(`Error fetching feed ${feed.source}:`, error);
        }
    }

    // Sort by date descending
    return allNews.sort((a, b) => b.pubDate - a.pubDate);
};

// Routes
app.get('/api/news', async (req, res) => {
    const { category } = req.query;
    let news = await fetchNewsFromFeeds();

    // Filter if category is provided and not 'All'
    // Note: Since we are fetching from general feeds, categorization might be weak.
    // We can try to filter by title keywords if needed, but for now we return all.
    if (category && category !== 'All') {
        // Simple keyword filtering for demo purposes since RSS feeds are mixed
        if (category === 'Technology') {
            news = news.filter(item => /tech|digital|ki|ai|computer/i.test(item.title + item.summary));
        } else if (category === 'Business') {
            news = news.filter(item => /wirtschaft|börse|aktien|markt|finanz/i.test(item.title + item.summary));
        } else if (category === 'Sports') {
            news = news.filter(item => /sport|fussball|liga/i.test(item.title + item.summary));
        } else if (category === 'Science') {
            news = news.filter(item => /wissenschaft|forschung|raumfahrt|klima/i.test(item.title + item.summary));
        }
    }

    res.json(news);
});

app.post('/api/summarize', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    // Mock Summarization Logic (German)
    const summary = `Zusammenfassung: ${text.substring(0, 150)}... (Dies ist eine automatische Zusammenfassung der Nachrichten.)`;

    setTimeout(() => {
        res.json({ summary });
    }, 1000);
});

app.get('/api/enrich', (req, res) => {
    const { title } = req.query;

    // Mock Enrichment Data
    const data = {
        keyPoints: [
            "This is a key point about the article.",
            "Here is another important fact extracted from the news.",
            "The third point highlights a crucial detail.",
            "Fourthly, we mention the impact of the event.",
            "Finally, a concluding point about the situation."
        ],
        detailedSummary: `This is a detailed summary of the article titled "${title}". It provides a comprehensive overview of the event, covering the who, what, where, when, and why. The summary is designed to give the reader a deep understanding of the topic without needing to read the full original text.\n\nIn the second paragraph, we delve deeper into the background and context. We explore the implications of the news and how it relates to broader trends. This section aims to provide analysis and perspective.\n\nFinally, the third paragraph concludes the summary with future outlooks and potential consequences. It wraps up the narrative and leaves the reader with a clear picture of the current state of affairs.`,
        sources: [
            {
                name: "Tagesschau",
                link: "https://www.tagesschau.de",
                pubDate: new Date().toISOString()
            },
            {
                name: "n-tv",
                link: "https://www.n-tv.de",
                pubDate: new Date().toISOString()
            },
            {
                name: "Spiegel",
                link: "https://www.spiegel.de",
                pubDate: new Date().toISOString()
            }
        ]
    };

    setTimeout(() => {
        res.json(data);
    }, 800);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
