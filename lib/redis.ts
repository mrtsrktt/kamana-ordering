import { kv } from '@vercel/kv';
import { Product } from './products';

const PRODUCTS_KEY = 'products';

/**
 * Fetch all products from Redis
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const products = await kv.get<Product[]>(PRODUCTS_KEY);
    return products || [];
  } catch (error) {
    console.error('Redis getProducts error:', error);
    throw new Error('Failed to fetch products from database');
  }
}

/**
 * Save products array to Redis
 */
export async function setProducts(products: Product[]): Promise<void> {
  try {
    await kv.set(PRODUCTS_KEY, products);
  } catch (error) {
    console.error('Redis setProducts error:', error);
    throw new Error('Failed to save products to database');
  }
}

/**
 * Initialize Redis with default products if empty
 */
export async function initializeProducts(defaultProducts: Product[]): Promise<void> {
  try {
    const existing = await kv.get<Product[]>(PRODUCTS_KEY);
    if (!existing || existing.length === 0) {
      await kv.set(PRODUCTS_KEY, defaultProducts);
      console.log('Redis initialized with default products');
    }
  } catch (error) {
    console.error('Redis initializeProducts error:', error);
    throw new Error('Failed to initialize products in database');
  }
}
