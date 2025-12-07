import { NextResponse } from 'next/server';
import { extractShortcode, fetchInstagramPost } from '@/utils/instagramParser';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const shortcode = extractShortcode(url);
    if (!shortcode) {
      console.log("Failed to extract shortcode from:", url); // Debug
      return NextResponse.json({ success: false, error: 'Invalid Instagram URL' }, { status: 400 });
    }

    const data = await fetchInstagramPost(shortcode, url);

    return NextResponse.json({
      success: true,
      shortcode: data.shortcode,
      medias: data.medias
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
