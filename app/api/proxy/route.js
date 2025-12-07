import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // Stream the response from the external URL
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) width/100', // Basic UA
      }
    });

    const headers = new Headers();
    headers.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="video.mp4"`);
    
    // Check if we need to forward specific headers like Content-Length for progress
    if (response.headers['content-length']) {
        headers.set('Content-Length', response.headers['content-length']);
    }

    // Return a streaming response
    return new NextResponse(response.data, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Proxy Error:', error.message);
    return NextResponse.json({ error: 'Failed to proxy content' }, { status: 500 });
  }
}
