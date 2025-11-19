import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image data' });
    }

    // Base64'ten Buffer'a çevir
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Vercel Blob'a yükle (addRandomSuffix ile benzersiz dosya adı)
    const blob = await put(filename || `product-${Date.now()}.jpg`, buffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    res.status(200).json({ 
      success: true, 
      imageUrl: blob.url 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
}
