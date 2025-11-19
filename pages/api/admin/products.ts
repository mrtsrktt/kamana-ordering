import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const products = await prisma.product.findMany({
        include: {
          Category: true
        },
        orderBy: { createdAt: 'asc' }
      });
      
      const transformedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.imageUrl,
        is_active: p.isActive,
        category: p.Category.name,
        slug: p.slug,
        minOrderQty: p.minOrderQty,
        minOrderText: p.minOrderText,
        suggestionText: p.suggestionText,
        stock: p.stock
      }));
      
      return res.status(200).json(transformedProducts);
    }

    if (req.method === 'POST') {
      // Get default category
      const category = await prisma.category.findFirst();
      if (!category) {
        console.error('No category found in database');
        return res.status(400).json({ message: 'No category found' });
      }
      
      const slug = req.body.name
        .toLowerCase()
        .replace(/[()]/g, '')
        .replace(/\s+/g, '-')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
      
      console.log('Creating product:', { name: req.body.name, slug, categoryId: category.id });
      
      const newProduct = await prisma.product.create({
        data: {
          name: req.body.name,
          slug,
          description: req.body.description || '',
          price: parseFloat(req.body.price) || 0,
          imageUrl: req.body.image || '',
          isActive: req.body.is_active ?? true,
          categoryId: category.id,
          minOrderQty: req.body.minOrderQty ? parseInt(req.body.minOrderQty) : null,
          minOrderText: req.body.minOrderText || null,
          suggestionText: req.body.suggestionText || null,
          stock: req.body.stock ? parseInt(req.body.stock) : null
        },
        include: {
          Category: true
        }
      });
      
      return res.status(201).json({
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image: newProduct.imageUrl,
        is_active: newProduct.isActive,
        category: newProduct.Category.name,
        slug: newProduct.slug
      });
    }

    if (req.method === 'PUT') {
      const { id, action, ...updateData } = req.body;
      
      if (action === 'toggle') {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        
        await prisma.product.update({
          where: { id },
          data: { isActive: !product.isActive }
        });
        
        return res.status(200).json({ success: true });
      } else {
        // Handle product edit
        await prisma.product.update({
          where: { id },
          data: {
            name: updateData.name,
            description: updateData.description,
            price: updateData.price,
            imageUrl: updateData.image,
            isActive: updateData.is_active,
            minOrderQty: updateData.minOrderQty,
            minOrderText: updateData.minOrderText,
            suggestionText: updateData.suggestionText,
            stock: updateData.stock
          }
        });
        
        return res.status(200).json({ success: true });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      await prisma.product.delete({ where: { id } });
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
