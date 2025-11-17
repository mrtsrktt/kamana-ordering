import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get settings (create default if not exists)
      let settings = await prisma.settings.findFirst();
      
      if (!settings) {
        settings = await prisma.settings.create({
          data: {}
        });
      }
      
      return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
      const { businessName, phone, whatsapp, email, city, region, address } = req.body;
      
      // Get or create settings
      let settings = await prisma.settings.findFirst();
      
      if (!settings) {
        settings = await prisma.settings.create({
          data: { businessName, phone, whatsapp, email, city, region, address }
        });
      } else {
        settings = await prisma.settings.update({
          where: { id: settings.id },
          data: { businessName, phone, whatsapp, email, city, region, address }
        });
      }
      
      return res.status(200).json(settings);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ 
      message: 'Database operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
