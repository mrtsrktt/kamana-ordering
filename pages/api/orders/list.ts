import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      return res.status(200).json([]);
    }

    const ordersData = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const orders = JSON.parse(ordersData);

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error reading orders:', error);
    res.status(500).json({ message: 'Error reading orders' });
  }
}
