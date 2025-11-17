import { prisma } from '../lib/prisma';
import { products } from '../lib/products';

async function main() {
  console.log('🌱 Seeding database...');
  
  // Clear existing products
  await prisma.product.deleteMany();
  console.log('✓ Cleared existing products');
  
  // Insert default products
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description || null,
        price: product.price,
        image: product.image,
        is_active: product.is_active,
        minOrderText: product.minOrderText || null,
        suggestionText: product.suggestionText || null,
        minOrderQty: product.minOrderQty || null,
        category: product.category || null,
        stock: product.stock || null,
      },
    });
  }
  
  console.log(`✓ Seeded ${products.length} products`);
  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
