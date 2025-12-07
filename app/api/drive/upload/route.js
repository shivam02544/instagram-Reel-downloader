import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const uploadUrl = formData.get('uploadUrl');
    const mimeType = formData.get('mimeType');

    if (!file || !uploadUrl || !mimeType) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive via the signed URL
    // Since we are server-side now, CORS is not an issue.
    // Note: This approach accepts the file into memory/server so it is subject to the Vercel body size limit (4.5MB).
    // For larger files on Vercel, client-side upload is better, but CORS blocks it.
    // A robust solution for Vercel + Large Files + CORS bypass requires a specialized architecture (e.g., signed URLs for S3, or a proxy that doesn't buffer).
    // Given the prompt constraints, we will buffer here. If the video is > 4.5MB, this will fail on Vercel Pro/Free.
    // For local dev, it works perfectly for any size.

    const googleResponse = await axios.put(uploadUrl, buffer, {
        headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length
        },
        maxBodyLength: Infinity, 
        maxContentLength: Infinity,
        validateStatus: (status) => status < 500 // Resolve even if 403 so we can read body
    });

    if (googleResponse.status >= 400) {
        console.error('Google Upload Failed:', googleResponse.status, googleResponse.data);
        return NextResponse.json({ success: false, error: `Google rejected upload: ${googleResponse.status}` }, { status: googleResponse.status });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Proxy Upload Error:', error.message);
    if (error.response) {
        console.error('Upstream Response:', error.response.data);
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
