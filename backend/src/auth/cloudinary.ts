import { v2 as cloudinary } from 'cloudinary';

// Lazy configuration - will be called when needed
let configured = false;

function ensureConfigured() {
  if (!configured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        `Cloudinary configuration missing. Found: cloud_name=${cloudName ? 'yes' : 'no'}, api_key=${apiKey ? 'yes' : 'no'}, api_secret=${apiSecret ? 'yes' : 'no'}`
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    configured = true;
    console.log('✅ Cloudinary configured successfully');
  }
}

// Export a proxy that ensures configuration before use
export default new Proxy(cloudinary, {
  get(target, prop) {
    ensureConfigured();
    return target[prop as keyof typeof cloudinary];
  },
});
