// pages/api/video-proxy.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Check if the request method is GET
    // if (req.method !== 'GET') {
    //     return res.status(405).json({ error: 'Method Not Allowed' });
    // }

    const { url } = req.query; // Get the video URL from the query parameters

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await fetch(url);

        // Check if the response is OK
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch video' });
        }

        // Set the appropriate headers
        res.setHeader('Content-Type', response.headers.get('Content-Type'));
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS

        // Pipe the response from the external server to the client
        response.body.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
