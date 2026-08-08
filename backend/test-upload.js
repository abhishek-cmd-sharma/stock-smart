const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require("./smart-stock-dabf5-firebase-adminsdk-fbsvc-54defc9a1b.json");

initializeApp({
  credential: cert(serviceAccount)
});

async function upload() {
  try {
    const bucket = getStorage().bucket("smart-stock-dabf5.firebasestorage.app");
    await bucket.file("test.txt").save("Hello world");
    console.log("Successfully uploaded to smart-stock-dabf5.firebasestorage.app");
  } catch(e) {
    console.error("Error uploading to firebasestorage.app:", e.message);
    try {
      const bucket2 = getStorage().bucket("smart-stock-dabf5.appspot.com");
      await bucket2.file("test.txt").save("Hello world");
      console.log("Successfully uploaded to smart-stock-dabf5.appspot.com");
    } catch(e2) {
      console.error("Error uploading to appspot.com:", e2.message);
    }
  }
}
upload();
