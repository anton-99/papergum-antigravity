import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { message, articleContext } = await request.json();

        if (!message && !articleContext) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let responseText = "";

        if (message) {
            // Q&A Mode
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('wer') || lowerMsg.includes('who')) {
                responseText = "Die Hauptakteure in diesem Artikel sind die genannten Politiker und Wirtschaftsführer. (Dies ist eine simulierte Antwort).";
            } else if (lowerMsg.includes('wann') || lowerMsg.includes('when')) {
                responseText = "Die Ereignisse fanden vor kurzem statt, wie im Artikel berichtet. (Dies ist eine simulierte Antwort).";
            } else if (lowerMsg.includes('warum') || lowerMsg.includes('why')) {
                responseText = "Die Hintergründe sind komplex, aber der Artikel deutet auf wirtschaftliche und politische Faktoren hin. (Dies ist eine simulierte Antwort).";
            } else {
                responseText = `Das ist eine interessante Frage zu "${articleContext?.title || 'dem Artikel'}". Basierend auf dem Inhalt scheint es, dass dies weitreichende Folgen haben könnte. (Simulierte KI-Antwort).`;
            }
        } else {
            // Summarize Mode (Key Points)
            responseText = JSON.stringify([
                "Dies ist der erste wichtige Punkt aus dem Artikel.",
                "Ein weiterer entscheidender Aspekt wird hier hervorgehoben.",
                "Schließlich erwähnt der Bericht die möglichen Konsequenzen für die Zukunft.",
                "Experten sind sich uneinig über die genauen Auswirkungen."
            ]);
        }

        return NextResponse.json({ response: responseText });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
