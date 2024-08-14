const { Storage } = require('@google-cloud/storage')

exports.generateSignedUrls = async (req, res) => {
  console.log('Starting getSignedUrl v.0.1')
  const allowedOrigins = ['http://localhost:5173', 'https://ditpi.mahadia.dev/', 'https://party-pics.pages.dev']
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin) || origin?.endsWith('.party-pics.pages.dev')) {
    res.set('Access-Control-Allow-Origin', origin)
  }

  try {
    const response = await helper();
    res.send(response);
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    res.status(500).send('Error generating signed URL');
  }
}

const helper = async () => {
  const storage = new Storage({
    projectId: 'mahadi-tabu-wedding-pic-app',
    keyFilename: '.sa-key.json'
  })
  const options = {
    version: 'v4',
    action: 'resumable',
    expires: Date.now() + 60 * 60 * 1000,
  }

  const [url] = await storage.bucket('party-pics-test-1').file('/test').getSignedUrl(options)
  console.log('Generated PUT signed URL:');
  console.log(url);
  return url
}
