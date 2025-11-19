import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔍 Checking products in database...\n');
  
  const products = await prisma.product.findMany({
    include: {
      Category: true
    }
  });
  
  console.log(`Found ${products.length} products:\n`);
  
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   - Price: ${p.price} TL`);
    console.log(`   - Category: ${p.Category.name}`);
    console.log(`   - Active: ${p.isActive}`);
    console.log(`   - Image: ${p.imageUrl.substring(0, 50)}...`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
