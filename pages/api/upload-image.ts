import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
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
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ message: 'Upload failed', error: err.message });
      }

      const file = files.image;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Dosya yolunu al (array veya tek dosya olabilir)
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      
      try {
        // Cloudinary'ye yükle
        const result = await cloudinary.uploader.upload(uploadedFile.filepath, {
          folder: 'kamana-products',
          resource_type: 'image',
        });

        // Geçici dosyayı sil
        fs.unlinkSync(uploadedFile.filepath);

        res.status(200).json({ 
          success: true, 
          imageUrl: result.secure_url 
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Cloudinary upload failed' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
