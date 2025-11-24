import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

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
    },
    {
        source: 'Der Spiegel',
        url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss',
        category: 'General'
    }
];

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("Fetching news from feeds...");
    let allNews = [];
    let idCounter = 1;

    try {
        const feedPromises = FEEDS.map(async (feed) => {
            try {
                console.log(`Fetching ${feed.source}...`);
                const feedContent = await parser.parseURL(feed.url);
                console.log(`Fetched ${feed.source}: ${feedContent.items.length} items`);
                return feedContent.items.map(item => {
                    // Try to find an image
                    let imageUrl = null;
                    if (item.enclosure && item.enclosure.url) {
                        imageUrl = item.enclosure.url;
                    } else if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
                        imageUrl = item['media:content'].$.url;
                    } else if (item.content && item.content.match(/src="([^"]+)"/)) {
                        // Try to extract from content HTML
                        imageUrl = item.content.match(/src="([^"]+)"/)[1];
                    }

                    // If no image found, use contextual stock image
                    if (!imageUrl) {
                        // Map categories to picsum photo IDs for consistent themed images
                        const categoryImages = {
                            'politics': 1043,
                            'business': 1067,
                            'sports': 103,
                            'technology': 101,
                            'nature': 104,
                            'science': 102,
                            'health': 105,
                            'default': 106
                        };

                        // Extract keywords from title for contextual images
                        const title = item.title.toLowerCase();
                        let photoId = categoryImages.default;

                        if (title.includes('politik') || title.includes('regierung') || title.includes('bundestag')) {
                            photoId = categoryImages.politics;
                        } else if (title.includes('wirtschaft') || title.includes('börse') || title.includes('aktien')) {
                            photoId = categoryImages.business;
                        } else if (title.includes('sport') || title.includes('fußball') || title.includes('bundesliga')) {
                            photoId = categoryImages.sports;
                        } else if (title.includes('tech') || title.includes('digital') || title.includes('ki') || title.includes('computer')) {
                            photoId = categoryImages.technology;
                        } else if (title.includes('klima') || title.includes('umwelt') || title.includes('natur')) {
                            photoId = categoryImages.nature;
                        } else if (title.includes('wissenschaft') || title.includes('forschung')) {
                            photoId = categoryImages.science;
                        } else if (title.includes('gesundheit') || title.includes('medizin')) {
                            photoId = categoryImages.health;
                        }

                        // Use picsum.photos (reliable, free, no API key)
                        // Add random seed to get variety within same category
                        const randomSeed = Math.floor(Math.random() * 1000);
                        imageUrl = `https://picsum.photos/seed/${photoId}-${randomSeed}/600/400`;
                    }

                    return {
                        id: `${feed.source.replace(/\s+/g, '')}-${idCounter++}-${Date.now()}`,
                        title: item.title,
                        summary: item.contentSnippet || item.content || "Keine Zusammenfassung verfügbar.",
                        content: item.content || item.contentSnippet || "",
                        source: feed.source,
                        link: item.link,
                        pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                        imageUrl: imageUrl
                    };
                });
            } catch (error) {
                console.error(`Error fetching feed ${feed.source}:`, error);
                return [];
            }
        });

        const results = await Promise.all(feedPromises);
        allNews = results.flat();

        // Sort by date descending
        allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        return NextResponse.json(allNews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
