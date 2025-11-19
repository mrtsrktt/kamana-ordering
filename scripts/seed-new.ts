import { prisma } from '../lib/prisma';

// Kamana ürünleri
const products = [
  {
    name: 'Magnolia',
    description: '250 ml',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Ekler (Classic)',
    description: 'Klasik ekler',
    price: 30,
    imageUrl: 'https://i.imgur.com/euYycMj.jpg',
    category: 'tatli-pasta'
  },
  {
    name: 'Trileçe (Tepsi)',
    description: 'Tam tepsi',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Trileçe (Dilim)',
    description: 'Tek dilim',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Baklava',
    description: '1 kg',
    price: 380,
    imageUrl: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Sütlaç',
    description: '1 porsiyon',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Kazandibi',
    description: '1 porsiyon',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Profiterol',
    description: '10 adet',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Tiramisu',
    description: 'Tepsi',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    category: 'tatli-pasta'
  },
  {
    name: 'Cheesecake',
    description: 'Dilim',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400',
    category: 'tatli-pasta'
  }
];

async function main() {
  console.log('🌱 Seeding products...\n');
  
  // Get category
  const category = await prisma.category.findUnique({
    where: { slug: 'tatli-pasta' }
  });
  
  if (!category) {
    console.error('❌ Category "tatli-pasta" not found!');
    process.exit(1);
  }
  
  for (const product of products) {
    const slug = product.name
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        isActive: true,
        isFeatured: false,
        categoryId: category.id
      }
    });
    
    console.log(`✓ Added: ${product.name}`);
  }
  
  console.log(`\n✅ Seeded ${products.length} products!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
