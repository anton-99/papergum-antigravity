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
                    // PRIORITY: Extract image from original RSS feed
                    let imageUrl = null;

                    // Method 1: RSS enclosure
                    if (item.enclosure && item.enclosure.url) {
                        imageUrl = item.enclosure.url;
                    }
                    // Method 2: media:content
                    else if (item['media:content']) {
                        if (Array.isArray(item['media:content'])) {
                            const media = item['media:content'].find(m => m.$ && m.$.url);
                            if (media) imageUrl = media.$.url;
                        } else if (item['media:content'].$ && item['media:content'].$.url) {
                            imageUrl = item['media:content'].$.url;
                        }
                    }
                    // Method 3: media:thumbnail
                    else if (item['media:thumbnail']) {
                        if (Array.isArray(item['media:thumbnail'])) {
                            const thumb = item['media:thumbnail'].find(t => t.$ && t.$.url);
                            if (thumb) imageUrl = thumb.$.url;
                        } else if (item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
                            imageUrl = item['media:thumbnail'].$.url;
                        }
                    }
                    //Method 4: Parse HTML for Open Graph or img tags
                    else if (item.content || item.description) {
                        const html = item.content || item.description;
                        // Try OG image
                        let match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                        if (match && match[1]) {
                            imageUrl = match[1];
                        } else {
                            // Fallback to first img tag
                            match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
                            if (match && match[1]) imageUrl = match[1];
                        }
                    }

                    // Validate URL
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        try {
                            const feedUrl = new URL(feed.url);
                            imageUrl = new URL(imageUrl, feedUrl.origin).href;
                        } catch (e) {
                            imageUrl = null;
                        }
                    }
                    // Filter tracking pixels
                    if (imageUrl && (imageUrl.includes('1x1') || imageUrl.includes('pixel.') || imageUrl.includes('tracker'))) {
                        imageUrl = null;
                    }

                    // FALLBACK: Use contextual stock images
                    if (!imageUrl) {
                        const createHash = (str) => {
                            let hash = 0;
                            for (let i = 0; i < str.length; i++) {
                                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                                hash = hash & hash;
                            }
                            return Math.abs(hash);
                        };

                        const categoryImages = {
                            politics: [8828552, 18422094, 6077326, 8349188, 8923962, 9159010, 6077447, 8182678],
                            business: [3182834, 7681671, 6801648, 3184436, 3184460, 3184418, 6863332, 7661589],
                            sports: [274506, 3621104, 3621200, 3621186, 46798, 3621193, 1171084, 8224913],
                            technology: [546819, 3861969, 2582937, 325229, 5474028, 1181675, 373543, 3888151],
                            nature: [1761279, 1179229, 417074, 531756, 572897, 1640777, 1179225, 3408744],
                            science: [3912979, 2280571, 256262, 4033148, 8326708, 4031867, 3849167, 3735747],
                            health: [4386466, 4225880, 4173251, 3938023, 4173239, 3825529, 7089020, 4475523],
                            conflict: [8294608, 7869267, 6077326, 9159010, 8923962, 8349188, 7661589, 6863451],
                            crime: [5668838, 8369875, 6077326, 8923962, 5669619, 8294608, 6077447, 7661589],
                            education: [5212345, 159844, 1152500, 267586, 5676744, 1370296, 289740, 3184612],
                            disaster: [1446076, 2929245, 125510, 1906658, 2933243, 2166711, 1906661, 2157886],
                            culture: [1024960, 167699, 1438081, 1181292, 4629632, 1181243, 707676, 1179225],
                            default: [1591056, 1591061, 1591062, 1591055, 1591447, 1591060, 2004161, 518543]
                        };

                        const title = item.title.toLowerCase();
                        let category = 'default';

                        if (title.match(/entführung|kidnap|verbrechen|mord|raub|kriminal|polizei|verhaft|gefängnis|gewalt(?!.*krieg)/)) category = 'crime';
                        else if (title.match(/schule|schüler|universität|schulen|student|bildung|unterricht|prüfung|abitur|studium/)) category = 'education';
                        else if (title.match(/vulkan|erdbeben|tsunami|hochwasser|überschwemmung|feuer|brand|katastrophe|unwetter|sturm/)) category = 'disaster';
                        else if (title.match(/politik|regierung|bundestag|minister|kanzler|parlament|wahl|partei|diplomatie/)) category = 'politics';
                        else if (title.match(/wirtschaft|börse|aktien|unternehmen|markt|finanz|handel|euro|inflation|dax/)) category = 'business';
                        else if (title.match(/sport|fußball|bundesliga|olympia|sieg|niederlage|trainer|spiel|meister/)) category = 'sports';
                        else if (title.match(/tech|digital|ki|künstliche intelligenz|computer|internet|software|app|cyber/)) category = 'technology';
                        else if (title.match(/klima|umwelt|natur|energie|nachhaltig|erwärmung|emission|grün|öko/)) category = 'nature';
                        else if (title.match(/wissenschaft|forschung|studie|entdeckung|labor|forscher|experiment/)) category = 'science';
                        else if (title.match(/gesundheit|kranken|arzt|patient|therapie|virus|impf|medizin(?!.*wissenschaft)/)) category = 'health';
                        else if (title.match(/krieg|konflikt|ukraine|russland|angriff|militär|waffen|soldat|kämpf/)) category = 'conflict';
                        else if (title.match(/kultur|kunst|musik|film|theater|literatur|buch|festival|kino/)) category = 'culture';

                        const pool = categoryImages[category];
                        const hash = createHash(item.title);
                        const photoId = pool[hash % pool.length];

                        imageUrl = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`;
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

        // Group similar articles from different sources
        const groupedNews = [];
        const used = new Set();

        // Helper: Calculate similarity between two titles
        const calculateSimilarity = (title1, title2) => {
            const words1 = title1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const words2 = title2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const common = words1.filter(w => words2.includes(w)).length;
            const union = new Set([...words1, ...words2]).size;
            return union > 0 ? common / union : 0;
        };

        // Group articles
        allNews.forEach((article, index) => {
            if (used.has(index)) return;

            const group = {
                id: article.id,
                title: article.title,
                summary: article.summary,
                content: article.content,
                sources: [{
                    name: article.source,
                    link: article.link,
                    pubDate: article.pubDate,
                    content: article.content,
                    summary: article.summary
                }],
                imageUrl: article.imageUrl,
                pubDate: article.pubDate,
                link: article.link
            };

            used.add(index);

            // Find similar articles
            allNews.forEach((other, otherIndex) => {
                if (used.has(otherIndex)) return;
                if (index === otherIndex) return;

                // Check similarity
                const similarity = calculateSimilarity(article.title, other.title);
                const timeDiff = Math.abs(new Date(article.pubDate) - new Date(other.pubDate));
                const sameDay = timeDiff < 24 * 60 * 60 * 1000; // Within 24 hours

                // Group if similar enough
                if (similarity > 0.4 && sameDay) {
                    group.sources.push({
                        name: other.source,
                        link: other.link,
                        pubDate: other.pubDate,
                        content: other.content,
                        summary: other.summary
                    });
                    used.add(otherIndex);

                    // Use image from first source with an image
                    if (!group.imageUrl && other.imageUrl) {
                        group.imageUrl = other.imageUrl;
                    }
                }
            });

            groupedNews.push(group);
        });

        // Sort by date descending
        groupedNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        return NextResponse.json(groupedNews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
