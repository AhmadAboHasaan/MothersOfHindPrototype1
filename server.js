const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const cacheTtl = Number(process.env.IG_CACHE_TTL || 600000);
let cache = { at: 0, data: null };

const fallback = [
  { id: '1', permalink: 'https://instagram.com/mothersofhind', media_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80&auto=format&fit=crop', caption: 'Community classroom support in action.' },
  { id: '2', permalink: 'https://instagram.com/mothersofhind', media_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&q=80&auto=format&fit=crop', caption: 'Back-to-learning moments.' },
  { id: '3', permalink: 'https://instagram.com/mothersofhind', media_url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80&auto=format&fit=crop', caption: 'Care and education together.' }
];

app.use(express.static(path.join(__dirname)));

app.get('/api/instagram', async (_req, res) => {
  const now = Date.now();
  if (cache.data && now - cache.at < cacheTtl) return res.json({ source: 'cache', posts: cache.data });

  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!userId || !token) return res.json({ source: 'fallback', posts: fallback, note: 'Missing IG credentials' });

  try {
    const url = new URL(`https://graph.facebook.com/v19.0/${userId}/media`);
    url.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp');
    url.searchParams.set('access_token', token);
    url.searchParams.set('limit', '9');

    const response = await fetch(url);
    if (!response.ok) throw new Error('Instagram request failed');
    const json = await response.json();
    const posts = (json.data || []).map(p => ({
      id: p.id,
      caption: p.caption || '',
      permalink: p.permalink,
      media_url: p.media_type === 'VIDEO' ? (p.thumbnail_url || p.media_url) : p.media_url,
      timestamp: p.timestamp
    }));

    cache = { at: now, data: posts.length ? posts : fallback };
    res.json({ source: 'live', posts: cache.data });
  } catch (e) {
    res.json({ source: 'fallback', posts: fallback, note: 'IG API error' });
  }
});

app.listen(port, () => console.log(`Mothers of Hind site running on http://localhost:${port}`));
