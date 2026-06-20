exports.handler = async function(event) {
  const SERPER_KEY = 'd0ff15f06a2308c5e59722a0321f1ec284c41e49';
  const { q } = JSON.parse(event.body || '{}');

  if (!q) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No query provided' }) };
  }

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q, gl: 'sg', hl: 'en', num: 8 })
    });

    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Search failed', detail: err.message })
    };
  }
};
