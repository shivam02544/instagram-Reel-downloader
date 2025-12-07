import express from "express";
import cors from "cors";
import { instagramGetUrl } from "instagram-url-direct";
import axios from "axios";
import FormData from "form-data";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.json({ success: false, message: "No URL provided." });
    }

    // Extract shortcode for filename purposes
    const match = url.match(/\/(reel|p|tv)\/([^\/\?\#]+)/);
    const shortcode = match ? match[2] : "video";

    console.log(`Fetching URL: ${url}`);

    // Use instagram-url-direct to fetch links without session
    const response = await instagramGetUrl(url);

    // The library typically returns { results_number: number, url_list: string[] }
    // Sometimes it might return just `url_list` directly depending on version, checking structure.
    const urls = response.url_list || [];

    if (urls.length === 0) {
      return res.json({
        success: false,
        message: "Could not find any videos. The reel might be private or deleted."
      });
    }

    // Map to the format the frontend expects
    // Map to the format the frontend expects, and fetch sizes in parallel
    const start = Date.now();
    const medias = await Promise.all(urls.map(async (videoUrl, idx) => {
      let sizeLabel = "Unknown Size";
      
      try {
        const headRes = await axios.head(videoUrl);
        const contentLength = headRes.headers["content-length"];
        if (contentLength) {
          const bytes = parseInt(contentLength, 10);
          if (bytes > 1024 * 1024) {
            sizeLabel = (bytes / (1024 * 1024)).toFixed(2) + " MB";
          } else {
            sizeLabel = (bytes / 1024).toFixed(2) + " KB";
          }
        }
      } catch (err) {
        console.error("Failed to get size for video:", err.message);
      }

      return {
        index: idx,
        type: "video",
        previewImage: null, 
        qualities: [
          {
            label: "Best Quality", 
            url: videoUrl,
            width: 0, 
            height: 0,
            size: sizeLabel
          }
        ]
      };
    }));
    console.log(`Processed ${urls.length} video(s) in ${Date.now() - start}ms`);

    return res.json({
      success: true,
      shortcode,
      medias,
      meta: response.post_info || {}
    });

  } catch (error) {
    console.error("Error fetching reel:", error);
    return res.json({

      success: false,
      message: "Failed to fetch reel. Server encountered an error."
    });
  }
});

app.post("/api/upload", async (req, res) => {
  try {
    const { videoUrl, token, fileName } = req.body;

    if (!videoUrl || !token) {
      return res.json({ success: false, message: "Missing video URL or token." });
    }

    console.log("Downloading video for upload...");
    
    // 1. Fetch the video stream
    const videoStream = await axios.get(videoUrl, { responseType: "stream" });

    // 2. Prepare FormData
    const form = new FormData();
    // Generate or santize filename
    const safeName = (fileName || "video.mp4").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    
    // Use safeName as the filename in form-data
    form.append("file", videoStream.data, safeName); 

    console.log("Uploading to DriveWise...");

    // 3. POST to external API
    // URL format: https://drive-wise-nu.vercel.app/api/v1/files
    const driveWiseUrl = `https://drive-wise-nu.vercel.app/api/v1/files`;
    
    console.log(`Posting to: ${driveWiseUrl}`);

    const response = await axios.post(driveWiseUrl, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    console.log("Upload success:", response.data);

    return res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error("Upload error:", error.message);
    // Be careful not to leak sensitive token info in logs, but here we just log message
    return res.json({
      success: false,
      message: error.response?.data?.message || error.message || "Upload failed."
    });
  }
});

app.get("/", (req, res) => {
  res.send("Instagram Reel Downloader API is running (No Session Mode).");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
