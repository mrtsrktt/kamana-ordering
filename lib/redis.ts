import { sql } from '@vercel/postgres';
import { Product } from './products';

/**
 * Initialize products table
 */
async function initTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        is_active BOOLEAN DEFAULT true,
        min_order_text TEXT,
        suggestion_text TEXT,
        min_order_qty INTEGER DEFAULT 1,
        category TEXT,
        stock INTEGER
      )
    `;
  } catch (error) {
    console.error('Table init error:', error);
  }
}

/**
 * Fetch all products from Postgres
 */
export async function getProducts(): Promise<Product[]> {
  try {
    await initTable();
    const { rows } = await sql`SELECT * FROM products ORDER BY id`;
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: parseFloat(row.price),
      image: row.image || '',
      is_active: row.is_active,
      minOrderText: row.min_order_text,
      suggestionText: row.suggestion_text,
      minOrderQty: row.min_order_qty,
      category: row.category,
      stock: row.stock
    }));
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

/**
 * Save products to Postgres
 */
export async function setProducts(products: Product[]): Promise<void> {
  try {
    await initTable();
    
    // Clear existing products
    await sql`DELETE FROM products`;
    
    // Insert all products
    for (const p of products) {
      await sql`
        INSERT INTO products (id, name, description, price, image, is_active, min_order_text, suggestion_text, min_order_qty, category, stock)
        VALUES (${p.id}, ${p.name}, ${p.description}, ${p.price}, ${p.image}, ${p.is_active}, ${p.minOrderText || null}, ${p.suggestionText || null}, ${p.minOrderQty || 1}, ${p.category || null}, ${p.stock || null})
      `;
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
      console.log('Products initialized');
    }
  } catch (error) {
    console.error('initializeProducts error:', error);
  }
}
