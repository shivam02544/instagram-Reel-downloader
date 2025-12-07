
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function diagnose() {
  console.log("=== STARTING DIAGNOSTIC ===");
  console.log("1. Checking Credentials...");
  const clientEmail = process.env.GDRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const folderId = process.env.GDRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey) {
    console.error("❌ Credentials Missing!");
    return;
  }
  console.log("   ✅ Email:", clientEmail);
  console.log("   ✅ Key Length:", privateKey.length);
  console.log("   ✅ Folder ID:", folderId);

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  console.log("\n2. Checking Permission on Folder...");
  try {
    const folder = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, capabilities, owners'
    });
    console.log("   ✅ Folder Found:", folder.data.name);
    console.log("   ℹ️  Owners:", folder.data.owners.map(o => o.emailAddress).join(', '));
    console.log("   ℹ️  Can Add Children?", folder.data.capabilities.canAddChildren);
    
    if (!folder.data.capabilities.canAddChildren) {
      console.error("❌ CRITICAL: Service Account CANNOT write to this folder!");
      console.error("   FIX: Share folder '" + folder.data.name + "' with " + clientEmail + " as EDITOR.");
      return;
    } else {
        console.log("   ✅ Service Account HAS write permission.");
    }

  } catch (error) {
    console.error("❌ Failed to get folder:", error.message);
    if (error.code === 404) console.error("   Reason: Folder ID not found or not shared with Service Account.");
    return;
  }

  console.log("\n3. Attempting Small Test Upload...");
  try {
    const res = await drive.files.create({
      requestBody: {
        name: 'test_upload_diagnostic.txt',
        parents: [folderId]
      },
      media: {
        mimeType: 'text/plain',
        body: 'Hello World - Diagnostic Test'
      }
    });
    console.log("   ✅ Upload Success! File ID:", res.data.id);
  } catch (error) {
    console.error("❌ Upload Failed:", error.message);
    console.error("   DETAILS:", JSON.stringify(error.response?.data?.error, null, 2));
  }
}

diagnose();
