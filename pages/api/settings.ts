import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

const DEFAULT_SETTINGS = {
  businessName: 'Kamana Pastanesi',
  phone: '05302347912',
  whatsapp: '905302347912',
  email: 'info@kamana.com',
  city: 'Istanbul',
  region: 'Anadolu Yakası',
  address: 'Site, Atay Cad. No:42, 34760 Ümraniye/İstanbul'
};

async function getSettingsAsObject() {
  const settings = await prisma.settings.findMany();
  const settingsObj: Record<string, string> = { ...DEFAULT_SETTINGS };
  
  settings.forEach(s => {
    settingsObj[s.key] = s.value;
  });
  
  return settingsObj;
}

async function setSetting(key: string, value: string) {
  await prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const settings = await getSettingsAsObject();
      return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
      const { businessName, phone, whatsapp, email, city, region, address } = req.body;
      
      // Update each setting
      if (businessName !== undefined) await setSetting('businessName', businessName);
      if (phone !== undefined) await setSetting('phone', phone);
      if (whatsapp !== undefined) await setSetting('whatsapp', whatsapp);
      if (email !== undefined) await setSetting('email', email);
      if (city !== undefined) await setSetting('city', city);
      if (region !== undefined) await setSetting('region', region);
      if (address !== undefined) await setSetting('address', address);
      
      const settings = await getSettingsAsObject();
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
