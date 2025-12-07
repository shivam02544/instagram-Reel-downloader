
const url = "https://www.instagram.com/reels/DR89h0Qk-iz/";
const regex = /(?:instagram\.com\/(?:reels?|p|tv)\/)([a-zA-Z0-9_-]+)/;
const match = url.match(regex);
console.log("Match:", match);
if (match) console.log("Shortcode:", match[1]);
