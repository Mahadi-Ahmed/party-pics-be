const { Storage } = require('@google-cloud/storage')

exports.generateSignedUrls = async (req, res) => {
  console.log('Starting getSignedUrl v.0.2.5')

  const allowedOrigins = ['http://localhost:5173', 'https://dipti.mahadia.dev', 'https://party-pics.pages.dev']
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin) || origin?.endsWith('.party-pics.pages.dev')) {
    res.set('Access-Control-Allow-Origin', origin)
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).send('')
  }

  if (req.method === 'POST') {
    const body = req?.body

    // Check if body is missing or empty
    if (!body || Object.keys(body).length === 0) {
      console.log('Request body is missing or empty')
      return res.status(400).json({ error: 'Request body is required' })
    }

    try {
      const response = await helper(body);
      res.send(response);
    } catch (error) {
      console.error('Error in getSignedUrl:', error);
      res.status(500).json({ error: 'Error generating signed URL', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' })
  }
}

const helper = async (files) => {
  const folder = generateRandomString()
  const storage = new Storage()

  if (files[0].name === undefined) {
    console.log('undefined file name')
    throw new Error('undefined file name')
  }

  const signedUrls = {}
  for (const file of files) {
    console.log('Generated PUT signed URL:', file.name);
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000,
      contentType: file.type
    }
    const [url] = await storage.bucket('party-pics-test-1').file(`${folder}/${file.name}`).getSignedUrl(options)
    signedUrls[file.name] = url
    // signedUrls.push(url)
  }

  // console.log(JSON.parse(JSON.stringify(signedUrls)))
  return signedUrls
}

const generateRandomString = (length = 5) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
