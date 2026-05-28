const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = ['Cà phê', 'Đồ ăn'];

const products = [
  { productId: 'espresso', name: 'Espresso', price: 3.5, category: 'Cà phê', emoji: '☕' },
  { productId: 'cappuccino', name: 'Cappuccino', price: 4.5, category: 'Cà phê', emoji: '☕' },
  { productId: 'latte', name: 'Latte', price: 4.0, category: 'Cà phê', emoji: '🥛' },
  { productId: 'americano', name: 'Americano', price: 3.0, category: 'Cà phê', emoji: '☕' },
  { productId: 'mocha', name: 'Mocha', price: 5.0, category: 'Cà phê', emoji: '🍫' },
  { productId: 'cold-brew', name: 'Cold Brew', price: 5.5, category: 'Cà phê', emoji: '🧊' },
  { productId: 'croissant', name: 'Croissant', price: 3.0, category: 'Đồ ăn', emoji: '🥐' },
  { productId: 'muffin', name: 'Blueberry Muffin', price: 2.5, category: 'Đồ ăn', emoji: '🧁' },
];

async function main() {
  const categoryRows = {};

  for (const name of categories) {
    categoryRows[name] = await prisma.category.upsert({
      where: { name },
      update: { active: true },
      create: { name, active: true },
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { productId: product.productId },
      update: {
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        active: true,
        categoryId: categoryRows[product.category].id,
      },
      create: {
        productId: product.productId,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        active: true,
        categoryId: categoryRows[product.category].id,
      },
    });
  }

  console.log(`Đã seed ${products.length} món trong menu`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
