import fs from 'fs';
import path from 'path';
import { Product } from './products';
import { simpleGit } from 'simple-git';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');

/**
 * Ensure data directory exists
 */
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
  }
};

/**
 * Fetch all products from JSON file
 */
export async function getProducts(): Promise<Product[]> {
  try {
    ensureDataDir();
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

/**
 * Save products and commit to Git (triggers Vercel redeploy)
 */
export async function setProducts(products: Product[]): Promise<void> {
  try {
    ensureDataDir();
    
    // Save to file
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    
    // Git commit and push (only in production)
    if (process.env.VERCEL_ENV === 'production') {
      const git = simpleGit();
      await git.add('data/products.json');
      await git.commit('chore: Update products from admin panel');
      await git.push();
      console.log('Products saved and pushed to Git');
    } else {
      console.log('Products saved locally (dev mode)');
    }
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
    const existing = await getProducts();
    if (!existing || existing.length === 0) {
      await setProducts(defaultProducts);
      console.log('Products initialized with defaults');
    }
  } catch (error) {
    console.error('initializeProducts error:', error);
  }
}
