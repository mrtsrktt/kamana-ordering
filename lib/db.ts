import { prisma } from './prisma';
import { Product } from './products';

/**
 * Fetch all products from Postgres using Prisma
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    return products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      image: p.image,
      is_active: p.is_active,
      minOrderText: p.minOrderText,
      suggestionText: p.suggestionText,
      minOrderQty: p.minOrderQty,
      category: p.category,
      stock: p.stock
    }));
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

/**
 * Save products to Postgres using Prisma
 */
export async function setProducts(products: Product[]): Promise<void> {
  try {
    // Clear existing products
    await prisma.product.deleteMany();
    
    // Insert all products
    await prisma.product.createMany({
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || null,
        price: p.price,
        image: p.image,
        is_active: p.is_active,
        minOrderText: p.minOrderText || null,
        suggestionText: p.suggestionText || null,
        minOrderQty: p.minOrderQty || null,
        category: p.category || null,
        stock: p.stock || null
      }))
    });
  } catch (error) {
    console.error('setProducts error:', error);
    throw new Error('Failed to save products');
  }
}

/**
 * Initialize with default products if empty
 */
export async function initializeProducts(defaultProducts: Product[]): Promise<void> {
  try {
    const count = await prisma.product.count();
    if (count === 0) {
      await setProducts(defaultProducts);
      console.log('Products initialized with default data');
    }
  } catch (error) {
    console.error('initializeProducts error:', error);
  }
}
