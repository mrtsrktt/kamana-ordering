import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch active products from database
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        Category: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Transform to match frontend expectations
    const transformedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.imageUrl,
      is_active: p.isActive,
      category: p.Category.name,
      slug: p.slug
    }));
    
    return res.status(200).json(transformedProducts);
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
