import type { NextApiRequest, NextApiResponse } from 'next';
import { getProducts, initializeProducts } from '../../lib/redis';
import { products as defaultProducts } from '../../lib/products';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Initialize Redis with default products if empty
    await initializeProducts(defaultProducts);
    
    // Fetch all products from Redis
    const allProducts = await getProducts();
    
    // Filter only active products for public endpoint
    const activeProducts = allProducts.filter(p => p.is_active);
    
    return res.status(200).json(activeProducts);
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
