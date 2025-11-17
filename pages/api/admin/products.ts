import type { NextApiRequest, NextApiResponse } from 'next';
import { products as defaultProducts } from '../../../lib/products';
import { getProducts, setProducts, initializeProducts } from '../../../lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Initialize Redis with default products if empty
    await initializeProducts(defaultProducts);

    if (req.method === 'GET') {
      const products = await getProducts();
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const products = await getProducts();
      const newProduct = {
        id: Date.now().toString(),
        ...req.body
      };
      products.push(newProduct);
      await setProducts(products);
      return res.status(201).json(newProduct);
    }

    if (req.method === 'PUT') {
      const { id, action, ...updateData } = req.body;
      const products = await getProducts();
      
      if (action === 'toggle') {
        const updatedProducts = products.map(p => 
          p.id === id ? { ...p, is_active: !p.is_active } : p
        );
        await setProducts(updatedProducts);
        return res.status(200).json({ success: true });
      } else {
        // Handle product edit
        const updatedProducts = products.map(p => 
          p.id === id ? { ...p, ...updateData } : p
        );
        await setProducts(updatedProducts);
        return res.status(200).json({ success: true });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const products = await getProducts();
      const filteredProducts = products.filter(p => p.id !== id);
      await setProducts(filteredProducts);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin Products API error:', error);
    return res.status(500).json({ 
      message: 'Database operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
