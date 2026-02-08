const QRCode = require('qrcode');

module.exports = async (req, res) => {
  // السماح لجميع المصادر (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // التعامل مع طلبات OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { url, color = '000000', bgcolor = 'ffffff', size = '300' } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    // خيارات QR Code
    const options = {
      color: {
        dark: `#${color}`,
        light: `#${bgcolor}`
      },
      width: parseInt(size),
      margin: 1,
      errorCorrectionLevel: 'H'
    };
    
    // إنشاء QR Code كـ buffer
    const qrBuffer = await QRCode.toBuffer(url, options);
    
    // إرجاع الصورة
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qr-code.png"`);
    res.send(qrBuffer);
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      error: 'Failed to generate QR code',
      message: error.message
    });
  }
};