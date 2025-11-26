import { NextResponse } from 'next/server';

/**
 * Enrichment endpoint used by PerplexityModal.
 * Accepts a `title` query parameter and searches NewsAPI for related articles.
 * Returns { sources: [...] } where each source matches the article format used in the app.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const apiKey = process.env.NEWS_API_KEY || 'e05d8cd474b1439a81ad49dd7cea857c';

    // Validate parameters
    if (!title) {
        return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }
    if (!apiKey) {
        return NextResponse.json({ error: 'NewsAPI key is missing' }, { status: 500 });
    }

    try {
        // Search for related articles (German language, relevance sorted, limited to 5)
        const res = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(
                title
            )}&language=de&sortBy=relevancy&pageSize=5&apiKey=${apiKey}`
        );
        if (!res.ok) {
            throw new Error(`NewsAPI error: ${res.statusText}`);
        }
        const data = await res.json();

        const sources = data.articles
            .map((item) => ({
                name: item.source.name,
                title: item.title,
                description: item.description,
                content: item.content,
                url: item.url,
                publishedAt: item.publishedAt,
            }))
            .filter((item) => item.title !== '[Removed]');

        return NextResponse.json({ sources });
    } catch (error) {
        console.error('Failed to enrich news:', error);
        return NextResponse.json({ error: 'Failed to enrich news' }, { status: 500 });
    }
}
