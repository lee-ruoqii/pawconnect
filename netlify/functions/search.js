exports.handler = async function(event) {
  const SERPER_KEY = 'd0ff15f06a2308c5e59722a0321f1ec284c41e49';
  const { q } = JSON.parse(event.body || '{}');

  if (!q) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No query provided' }) };
  }

  try {
    // Run text search and image search in parallel
    const [searchRes, imageRes] = await Promise.all([
      fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, gl: 'sg', hl: 'en', num: 8 })
      }),
      fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, gl: 'sg', hl: 'en', num: 8 })
      })
    ]);

    const searchData = await searchRes.json();
    const imageData = await imageRes.json();

    // Attach image URLs directly to each organic result
    const images = (imageData.images || []).map(img => img.imageUrl || img.thumbnailUrl || '');

    if (searchData.organic) {
      searchData.organic = searchData.organic.map((item, i) => {
        let domain = '';
        try { domain = new URL(item.link).hostname; } catch(e) {}
        item.imageUrl = images[i] || `https://logo.clearbit.com/${domain}` || '';
        return item;
      });
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Search failed', detail: err.message })
    };
  }
};
