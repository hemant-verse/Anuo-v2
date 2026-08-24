import crypto from 'crypto';

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

function getImagekitConfig() {
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error('ImageKit environment variables are not configured.');
  }

  return {
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  };
}

export async function uploadToImageKit(fileBuffer, fileName, folder = 'campusmarket/products') {
  const config = getImagekitConfig();

  // Convert Buffer to Blob for standard FormData compatibility
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('fileName', fileName);
  formData.append('useUniqueFileName', 'true');
  formData.append('folder', folder);

  // Note: Do NOT append signature, token, expire, or publicKey when using HTTP Basic Auth
  const authHeader = `Basic ${Buffer.from(`${config.privateKey}:`).toString('base64')}`;

  const response = await fetch('https://upload.imagekit.io/v1/files/upload', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ImageKit upload failed (${response.status}): ${errorText || 'unknown error'}`);
  }

  const result = await response.json();
  return {
    url: result.url,
    fileId: result.fileId,
  };
}

export async function deleteFromImageKit(fileId) {
  if (!fileId) return false;

  const config = getImagekitConfig();

  const authHeader = `Basic ${Buffer.from(`${config.privateKey}:`).toString('base64')}`;

  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ImageKit delete failed:', errorText);
  }

  return response.ok;
}