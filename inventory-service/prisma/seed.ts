import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { productId: 'espresso',    name: 'Espresso',         quantity: 100, unit: 'cups'  },
  { productId: 'cappuccino',  name: 'Cappuccino',        quantity: 80,  unit: 'cups'  },
  { productId: 'latte',       name: 'Latte',             quantity: 90,  unit: 'cups'  },
  { productId: 'americano',   name: 'Americano',         quantity: 120, unit: 'cups'  },
  { productId: 'mocha',       name: 'Mocha',             quantity: 60,  unit: 'cups'  },
  { productId: 'cold-brew',   name: 'Cold Brew',         quantity: 40,  unit: 'cups'  },
  { productId: 'croissant',   name: 'Croissant',         quantity: 50,  unit: 'pieces'},
  { productId: 'muffin',      name: 'Blueberry Muffin',  quantity: 30,  unit: 'pieces'},
];

async function main() {
  for (const product of products) {
    await prisma.inventory.upsert({
      where: { productId: product.productId },
      update: {},
      create: product,
    });
  }
  console.log('✅ Inventory seeded with', products.length, 'products');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
