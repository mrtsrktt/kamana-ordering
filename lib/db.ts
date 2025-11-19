import { prisma } from './prisma';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_active: boolean;
  category?: string;
  slug?: string;
}

/**
 * Fetch all products from Postgres using Prisma
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      include: {
        Category: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    return products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.imageUrl,
      is_active: p.isActive,
      category: p.Category.name,
      slug: p.slug
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
    // This function is deprecated - use admin API to manage products
    console.warn('setProducts is deprecated');
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
    // This function is deprecated - products should be seeded via seed script
    console.log('initializeProducts is deprecated - use seed script');
  } catch (error) {
    console.error('initializeProducts error:', error);
  }
}
