# InstaReel Downloader & Drive Uploader

A premium Next.js 14 application to download Instagram Reels (HD/SD) and save them directly to Google Drive, bypassing server limits.

## Features

- 📸 **Download Instagram Reels/Videos** in HD/SD qualities.
- 🎞️ **Carousel Support**: Handle multi-video posts.
- ☁️ **Direct to Drive**: Save large files directly from your browser to Google Drive (bypassing Vercel limits).
- 🚀 **Next.js 14 App Router** + **Tailwind CSS**.
- 💎 **Premium UI**: Glassmorphism, animations, and clean aesthetics.

## Setup Instructions

### 1. Installation

```bash
npm install
npm run dev
```

### 2. Environment Configuration

Create a `.env.local` file (copy from `.env.example`) and fill in the required values.

#### A. Instagram Session Cookie (Required)

To fetch Reels, especially from private accounts or to avoid limits, you need a valid session ID.

1. Log in to Instagram.com on your browser.
2. Open Developer Tools (F12) > Application Tab > Cookies.
3. Find cookie named `sessionid`.
4. Copy its value.
5. Set `IG_SESSIONID` in `.env.local`:
   ```env
   IG_SESSIONID="sessionid=your_cookie_value_here;"
   ```

#### B. Google Drive Service Account (For Drive Uploads)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project.
3. Enable **Google Drive API**.
4. Go to **Credentials** > **Create Credentials** > **Service Account**.
5. Give it a name and "Editor" role (or specific Drive permissions).
6. Create Key -> **JSON**. Download the file.
7. Open the JSON file.
   - Copy `client_email` to `GDRIVE_CLIENT_EMAIL`.
   - Copy `private_key` to `GDRIVE_PRIVATE_KEY` (Copy the whole string including `-----BEGIN...`).
8. **Create the Destination Folder**:

   - Go to your personal [Google Drive](https://drive.google.com).
   - Create a new folder (e.g., "InstaDownloads").
   - Open that folder.
   - Look at the URL bar. It will look like: `drive.google.com/drive/folders/12345abcde...`
   - Copy the last part (the ID `12345abcde...`).
   - Paste it into `.env.local` as `GDRIVE_FOLDER_ID`.

9. **Share with the Service Account**:
   - In Google Drive, right-click your "InstaDownloads" folder -> **Share**.
   - Paste the `client_email` you got from the JSON file (Step 7).
   - Set the permission to **Editor**.
   - Click **Send**.
     _(Uncheck "Notify people" if you want, since it's a robot)._

### 3. Running

Start the server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Technical Note on Large Files

This app uses a smart architecture to bypass Vercel's 4.5MB Body Size limit:

1. **Download:** Uses a Streaming Proxy to stream video from Instagram to your Browser (bypassing CORS and saving bandwidth).
2. **Upload:** Generates a Resumable Upload URL from the backend. The Browser then uploads the file chunks **directly** to Google Drive, bypassing the backend completely.

## Technologies

- Next.js 14
- Tailwind CSS (extended config)
- Framer Motion
- Axios
- Googleapis
