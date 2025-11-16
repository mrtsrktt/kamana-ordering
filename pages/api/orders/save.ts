import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

// Data klasörünü oluştur
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    ensureDataDir();

    const orderData = req.body;
    
    // Mevcut siparişleri oku
    const ordersData = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const orders = JSON.parse(ordersData);

    // Yeni siparişi ekle
    orders.push({
      ...orderData,
      createdAt: new Date().toISOString()
    });

    // Dosyaya kaydet
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

    res.status(200).json({ success: true, message: 'Order saved' });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: 'Error saving order' });
  }
}
