const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  { productId: 'espresso', name: 'Espresso', quantity: 100, lowStockThreshold: 20, unit: 'ly' },
  { productId: 'cappuccino', name: 'Cappuccino', quantity: 80, lowStockThreshold: 20, unit: 'ly' },
  { productId: 'latte', name: 'Latte', quantity: 90, lowStockThreshold: 20, unit: 'ly' },
  { productId: 'americano', name: 'Americano', quantity: 120, lowStockThreshold: 20, unit: 'ly' },
  { productId: 'mocha', name: 'Mocha', quantity: 60, lowStockThreshold: 15, unit: 'ly' },
  { productId: 'cold-brew', name: 'Cold Brew', quantity: 12, lowStockThreshold: 15, unit: 'ly' },
  { productId: 'croissant', name: 'Croissant', quantity: 50, lowStockThreshold: 10, unit: 'cái' },
  { productId: 'muffin', name: 'Blueberry Muffin', quantity: 8, lowStockThreshold: 10, unit: 'cái' },
];

async function main() {
  for (const product of products) {
    await prisma.inventory.upsert({
      where: { productId: product.productId },
      update: {
        name: product.name,
        unit: product.unit,
        lowStockThreshold: product.lowStockThreshold,
      },
      create: product,
    });
  }

  console.log(`Đã seed tồn kho cho ${products.length} món`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
