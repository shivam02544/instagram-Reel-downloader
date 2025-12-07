import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import axios from 'axios';

export async function POST(request) {
  try {
    const { fileName, mimeType } = await request.json();

    if (!fileName || !mimeType) {
      return NextResponse.json({ error: 'Missing fileName or mimeType' }, { status: 400 });
    }

    const clientEmail = process.env.GDRIVE_CLIENT_EMAIL;
    const privateKey = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
       return NextResponse.json({ error: 'Google Drive credentials not configured' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const token = accessToken.token;

    const requestBody = {
      name: fileName,
      mimeType: mimeType,
    };

    if (process.env.GDRIVE_FOLDER_ID) {
      requestBody.parents = [process.env.GDRIVE_FOLDER_ID];
    }

    // Create Resumable Upload Session
    const response = await axios.post(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': mimeType,
        },
      }
    );

    const uploadUrl = response.headers.location;

    if (!uploadUrl) {
      throw new Error('Failed to retrieve upload URL from Google Drive');
    }

    return NextResponse.json({ uploadUrl });


  } catch (error) {
    console.error('Drive API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to create upload URL' }, { status: 500 });
  }
}
