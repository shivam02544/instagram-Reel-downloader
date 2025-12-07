import axios from 'axios';

async function probe() {
  const url = "https://drive-wise-nu.vercel.app/api/v1";
  console.log("Probing:", url);

  try {
    console.log("Attempting GET...");
    const res = await axios.get(url);
    console.log("GET Request successful!");
    console.log("Status:", res.status);
    console.log("Response Data:", res.data); // Might list routes
  } catch (err) {
    console.log("GET Failed:", err.message);
    if (err.response) {
       console.log("Status:", err.response.status);
       console.log("Headers:", err.response.headers); // Check 'allowed' header
       console.log("Data:", err.response.data);
    }
  }
}

probe();
