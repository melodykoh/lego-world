// Debug endpoint to check environment variables (remove after testing)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;
  const apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET;
  
  res.status(200).json({
    hasCloudName: !!cloudName,
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    cloudName: cloudName ? cloudName.substring(0, 3) + '***' : 'missing',
    apiKey: apiKey ? apiKey.substring(0, 3) + '***' : 'missing',
    apiSecret: apiSecret ? '***' : 'missing'
  });
}