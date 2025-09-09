import '../../src/configs/env';
import { productTypeSeeder } from './ProductTypeSeeder';
import { userSeeder } from './UserSeeder';
import { productSeeder } from './ProductSeeder';
import { packagingSeeder } from './packagingSeeder';
import { productVariantSeeder } from './ProductVariantSeeder';
import { transactionSeeder } from './TransactionSeeder';
import { ppnSeeder } from './PPNSeeder';
import { chatSeeder } from './ChatSeeder';

const seeders: { [key: string]: () => Promise<void> } = {
  users: userSeeder,
  productTypes: productTypeSeeder,
  packagings: packagingSeeder,
  products: productSeeder,
  productVariants: productVariantSeeder,
  ppn: ppnSeeder,
  transactions: transactionSeeder,
  chats: chatSeeder,
};

async function main() {
  const args = process.argv.slice(2);
  const seederName = args[0];

  if (!seederName) {
    console.error(
      'Please provide a seeder name to run, or "all" to run all seeders.',
    );
    process.exit(1);
  }

  if (seederName === 'all') {
    console.log('Running all seeders in order...');
    // Jalankan sesuai urutan dependensi:
    // User & Tipe Produk & Kemasan -> Produk -> Varian Produk
    const orderedSeeders = [
      'users',
      'productTypes',
      'packagings',
      'products',
      'productVariants',
      'ppn',
      'chats',
      'transactions',
    ];
    for (const name of orderedSeeders) {
      console.log(`Running ${name} seeder...`);
      await seeders[name]();
    }
    console.log('All seeders executed successfully in order!');
  } else if (seeders[seederName]) {
    console.log(`Running ${seederName} seeder...`);
    await seeders[seederName]();
    console.log(`${seederName} seeder executed successfully!`);
  } else {
    console.error(`Seeder "${seederName}" not found.`);
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });
