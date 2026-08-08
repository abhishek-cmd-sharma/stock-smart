const { Storage } = require('@google-cloud/storage');

async function list() {
  const storage = new Storage({
    projectId: 'smart-stock-dabf5',
    keyFilename: './smart-stock-dabf5-firebase-adminsdk-fbsvc-54defc9a1b.json'
  });
  try {
    const [buckets] = await storage.getBuckets();
    console.log("Buckets found:");
    buckets.forEach(b => console.log(b.name));
    
    // Set CORS for each bucket found
    for (const bucket of buckets) {
      await bucket.setCorsConfiguration([
        {
          origin: ["*"],
          method: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
          maxAgeSeconds: 3600,
          responseHeader: ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
        }
      ]);
      console.log(`CORS set on ${bucket.name}`);
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
list();
