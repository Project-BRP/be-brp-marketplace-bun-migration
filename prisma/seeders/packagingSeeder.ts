import '../../src/configs/env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const packagingSeeder = async () => {
  const packagings = [
    { id: 'Karung_50kg', name: 'Karung 50kg' },
    { id: 'Karung_25kg', name: 'Karung 25kg' },
    { id: 'Botol_1L', name: 'Botol 1 Liter' },
    { id: 'Sachet_1kg', name: 'Sachet 1kg' },
  ];

  for (const packaging of packagings) {
    try {
      await prisma.packaging.create({
        data: packaging,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        continue;
      }
      throw error;
    }
  }
  console.log('Packaging types seeded successfully!');
};
