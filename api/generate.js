export default async function handler(req, res) {
  const { prompt } = req.body || { prompt: "GABBOSS in G-Wagon" };
  
  // MOCK REAL API CALL - replace with your Runway key later
  return res.status(200).json({
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    status: "ready",
    prompt: prompt
  });
}
