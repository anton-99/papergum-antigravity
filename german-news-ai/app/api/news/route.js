import { NextResponse } from 'next/server';

// Force dynamic rendering for fresh data
export const dynamic = 'force-dynamic';

export async function GET() {
    // Use the provided API key or fallback to the hard‑coded key (for development)
    const apiKey = process.env.NEWS_API_KEY || 'e05d8cd474b1439a81ad49dd7cea857c';

    if (!apiKey) {
        return NextResponse.json({ error: 'NewsAPI key is missing' }, { status: 500 });
    }

    try {
        const res = await fetch(`https://newsapi.org/v2/top-headlines?country=de&apiKey=${apiKey}`, {
            next: { revalidate: 300 }, // cache for 5 minutes
        });

        if (!res.ok) {
            throw new Error(`NewsAPI error: ${res.statusText}`);
        }

        const data = await res.json();

        const articles = data.articles
            .map((item, index) => ({
                id: `newsapi-${index}-${Date.now()}`,
                title: item.title,
                summary: item.description || 'Keine Zusammenfassung verfügbar.',
                content: item.content || item.description || '',
                source: item.source.name,
                link: item.url,
                pubDate: item.publishedAt,
                imageUrl: item.urlToImage,
                // Keep the structure compatible with the frontend
                sources: [
                    {
                        name: item.source.name,
                        link: item.url,
                        pubDate: item.publishedAt,
                        content: item.content || item.description,
                        summary: item.description,
                    },
                ],
            }))
            .filter((article) => article.title !== '[Removed]'); // Filter removed articles

        return NextResponse.json(articles);
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
