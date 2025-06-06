// app/api/video-batch-search/route.ts
import yts from 'yt-search';

export const runtime = 'nodejs';


const cache: Record<string, { url: string; title: string; thumbnail: string }> = {};

export async function POST(request: Request) {
  try {
    const { queries } = await request.json() as { queries: string[] };
    if (!Array.isArray(queries)) {
      console.log('[video-batch-search] Bad payload:', await request.text());
      return new Response(JSON.stringify({ error: 'queries must be an array of strings' }), { status: 400 });
    }

    // console.log('[video-batch-search] Received queries:', queries);

    const videos = await Promise.all(
      queries.map(async (q) => {
        // console.log(`[video-batch-search] Searching for query: "${q}"`);
        if (cache[q]) {
        //   console.log(`[video-batch-search] Cache hit for "${q}":`, cache[q]);
          return cache[q];
        }
        const r = await yts(q + ' tutorial');
        // console.log(`[video-batch-search] Raw search result for "${q}":`, r.videos?.slice(0, 3)); 
        const first = r.videos?.[0] || null;
        if (!first) {
        //   console.log(`[video-batch-search] No videos found for "${q}"`);
          return null;
        }
        const out = { url: first.url, title: first.title, thumbnail: first.thumbnail };
        // console.log(`[video-batch-search] Selected video for "${q}":`, out);
        cache[q] = out;
        return out;
      })
    );

    // console.log('[video-batch-search] Final videos array:', videos);

    return new Response(JSON.stringify({ videos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[video-batch-search] Error:', err);
    return new Response(JSON.stringify({ error: 'search failed' }), { status: 500 });
  }
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
export async function PUT() {
  return new Response('Method Not Allowed', { status: 405 });
}
export async function DELETE() {
  return new Response('Method Not Allowed', { status: 405 });
}
