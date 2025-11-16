import type { NextApiRequest, NextApiResponse } from 'next';
import { products } from '../../../lib/products';

// In-memory storage (in production, use a database)
let productList = [...products];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return res.status(200).json(productList);
  }

  if (req.method === 'POST') {
    const newProduct = {
      id: Date.now().toString(),
      ...req.body
    };
    productList.push(newProduct);
    return res.status(201).json(newProduct);
  }

  if (req.method === 'PUT') {
    const { id, action } = req.body;
    
    if (action === 'toggle') {
      productList = productList.map(p => 
        p.id === id ? { ...p, is_active: !p.is_active } : p
      );
      return res.status(200).json({ success: true });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
