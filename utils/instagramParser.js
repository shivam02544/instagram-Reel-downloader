import axios from 'axios';
import { instagramGetUrl } from 'instagram-url-direct';

export const extractShortcode = (url) => {
  const match = url.match(/(?:instagram\.com\/(?:reels?|p|tv)\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

export const fetchInstagramPost = async (shortcode, providedUrl) => {
  // Use provided URL, ensuring it is a string
  const url = providedUrl || `https://www.instagram.com/p/${shortcode}/`;

  try {
    // direct library call with original url
    const response = await instagramGetUrl(url);
    const urls = response.url_list || [];

    if (urls.length === 0) {
      throw new Error("Could not find any videos or the library failed to parse.");
    }

    const medias = urls.map((videoUrl, idx) => ({
      index: idx,
      type: 'video',
      previewImage: '', 
      qualities: [{
        label: "Best Quality",
        url: videoUrl
      }]
    }));

    return {
      shortcode,
      medias
    };

  } catch (error) {
    console.error("Instagram Fetch Error:", error.message);
    throw new Error(error.message || 'Failed to fetch Instagram Reel');
  }
};

const parseGraphqlMedia = (media, shortcode) => {
    const medias = [];

    const isVideo = media.is_video;
    const isCarousel = media.edge_sidecar_to_children ? true : false;
    
    if (isCarousel) {
        const edges = media.edge_sidecar_to_children.edges;
        edges.forEach((edge, index) => {
            const node = edge.node;
            if (node.is_video) {
                medias.push({
                    index: index,
                    type: 'video',
                    previewImage: node.display_url,
                    qualities: extractVideoQualities(node)
                });
            } else {
                 medias.push({
                    index: index,
                    type: 'image',
                    previewImage: node.display_url,
                    qualities: [{ label: 'High', url: node.display_url }]
                });
            }
        });
    } else if (isVideo) {
        medias.push({
            index: 0,
            type: 'video',
            previewImage: media.display_url,
            qualities: extractVideoQualities(media)
        });
    } else {
         // Single image
          medias.push({
            index: 0,
            type: 'image',
            previewImage: media.display_url,
            qualities: [{ label: 'High', url: media.display_url }]
        });
    }

    return {
        shortcode: shortcode,
        medias: medias
    };
}

const extractVideoQualities = (node) => {
    // Instagram usually provides 'video_url'. Sometimes 'video_resources' is available in other endpoints but standard web graphql gives one main video_url.
    // However, the prompt asks for SD, Medium, HD.
    // The standard __a=1 response typically contains 'video_url'. It might not expose multiple resolutions explicitly in this endpoint easily.
    // But we might check for different variants or just return what we have.
    // NOTE: The web version usually just gives one optimized file (often 720p or 1080p).
    // If specific qualities are not available, we will list the main one as 'Standard'.
    
    // We can simulate qualities if logical, but better to be honest.
    // Let's check if 'video_dash_manifest' exists (XML), but parsing that is complex.
    // We will just use the video_url provided.
    
    if (!node.video_url) return [];

    // Sometimes we can try to guess or just return one.
    // User requested: SD (480x854), Medium (720x1280), HD (1080x1920).
    // If we only get one URL, we return it as 'HD' or 'Original'.
    
    return [
       { label: "Date (Original)", url: node.video_url }
    ];
};

// Fallback for potentially different structure
const parseLegacyOrItems = (item, shortcode) => {
    // Similar parsing if needed
    const medias = [];
    if (item.carousel_media) {
          item.carousel_media.forEach((node, index) => {
             // ... structure similar to node
             if(node.video_versions) {
                 // Sort by resolution?
                 medias.push({
                    index: index,
                    type: 'video',
                    previewImage: node.image_versions2.candidates[0].url,
                    qualities: node.video_versions.map(v => ({
                        label: `${v.width}x${v.height}`,
                        url: v.url
                    }))
                 });
             }
          });
    } else if (item.video_versions) {
         medias.push({
            index: 0,
            type: 'video',
            previewImage: item.image_versions2.candidates[0].url,
            qualities: item.video_versions.map(v => ({
                label: `${v.width}x${v.height}`,
                url: v.url
            }))
         });
    }
    
    return { shortcode, medias };
};
