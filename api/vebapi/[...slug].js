export default async function handler(req, res) {
    // Disable caching entirely
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    const { slug } = req.query;
    const endpoint = Array.isArray(slug) ? slug.join('/') : slug;
    const website = req.query.website;

    if (!website) {
        return res.status(400).json({ error: 'Missing website parameter' });
    }

    const apiKey = process.env.VEBAPI_KEY || process.env.VITE_VEBAPI_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const apiUrl = `https://vebapi.com/api/${endpoint}?website=${encodeURIComponent(website)}`;
        const response = await fetch(apiUrl, {
            headers: {
                'X-API-KEY': apiKey,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('VebAPI proxy error:', error);
        return res.status(500).json({ error: 'Failed to fetch from VebAPI' });
    }
}
