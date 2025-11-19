import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔍 Checking database...\n');
  
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany();
  const orders = await prisma.order.findMany();
  
  console.log(`Categories: ${categories.length}`);
  categories.forEach(c => console.log(`  - ${c.name} (${c.slug})`));
  
  console.log(`\nProducts: ${products.length}`);
  console.log(`\nOrders: ${orders.length}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
