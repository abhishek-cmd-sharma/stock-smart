const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('./smart-stock-dabf5-firebase-adminsdk-fbsvc-54defc9a1b.json');

initializeApp({
  credential: cert(serviceAccount)
});

async function fixCors() {
  const bucketsToTry = ['smart-stock-dabf5.firebasestorage.app', 'smart-stock-dabf5.appspot.com'];
  
  for (const name of bucketsToTry) {
    console.log("Trying bucket:", name);
    try {
      const bucket = getStorage().bucket(name);
      const [exists] = await bucket.exists();
      if (exists) {
        console.log(`Bucket ${name} exists! Setting CORS...`);
        await bucket.setCorsConfiguration([
          {
            origin: ['*'],
            method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            maxAgeSeconds: 3600,
            responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable']
          }
        ]);
        console.log("CORS configured successfully on", name);
        return name;
      }
    } catch (e) {
      console.log(`Error checking bucket ${name}:`, e.message);
    }
  }
  console.log("None of the standard buckets exist or could be accessed.");
}

fixCors();
