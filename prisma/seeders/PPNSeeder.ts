import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ppnSeeder = async () => {
  // Set default PPN if not exists; otherwise update percentage if provided via env
  const defaultPercentage = Number(process.env.SEED_PPN_PERCENTAGE || 11);

  await prisma.currentPPN.upsert({
    where: { name: 'PPN Saat Ini' },
    update: { percentage: defaultPercentage },
    create: {
      id: 'PPN-CURRENT',
      name: 'PPN Saat Ini',
      percentage: defaultPercentage,
    },
  });

  console.log(`PPN seeded/updated successfully! (percentage=${defaultPercentage}%)`);
};

