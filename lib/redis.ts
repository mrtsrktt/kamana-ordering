import { put, list } from '@vercel/blob';
import { Product } from './products';

const BLOB_NAME = 'products.json';

/**
 * Fetch all products from Vercel Blob
 */
export async function getProducts(): Promise<Product[]> {
  try {
    // List blobs to find our products file
    const { blobs } = await list({ prefix: BLOB_NAME });
    
    if (blobs.length === 0) {
      return [];
    }
    
    // Fetch the blob content
    const response = await fetch(blobs[0].url);
    const products = await response.json();
    return products || [];
  } catch (error) {
    console.error('Blob getProducts error:', error);
    return [];
  }
}

/**
 * Save products array to Vercel Blob
 */
export async function setProducts(products: Product[]): Promise<void> {
  try {
    const blob = await put(BLOB_NAME, JSON.stringify(products), {
      access: 'public',
      addRandomSuffix: false,
    });
    console.log('Products saved to blob:', blob.url);
  } catch (error) {
    console.error('Blob setProducts error:', error);
    throw new Error('Failed to save products to storage');
  }
}

/**
 * Initialize Blob with default products if empty
 */
export async function initializeProducts(defaultProducts: Product[]): Promise<void> {
  try {
    const existing = await getProducts();
    if (!existing || existing.length === 0) {
      await setProducts(defaultProducts);
      console.log('Blob initialized with default products');
    }
  } catch (error) {
    console.error('Blob initializeProducts error:', error);
  }
}
