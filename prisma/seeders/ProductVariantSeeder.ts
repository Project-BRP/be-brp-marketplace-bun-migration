import '../../src/configs/env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const productVariantSeeder = async () => {
  const variants = [
    // NPK Mutiara 15-15-15 (3 variants)
    {
      id: 'NPK_15_15_15_Premium_1kg',
      productId: 'NPK_15_15_15_Premium',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 15000,
      stock: 100,
    },
    {
      id: 'NPK_15_15_15_Premium_25kg',
      productId: 'NPK_15_15_15_Premium',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 350000,
      stock: 100,
    },
    {
      id: 'NPK_15_15_15_Premium_50kg',
      productId: 'NPK_15_15_15_Premium',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 680000,
      stock: 100,
    },
    // NPK Phonska Plus (2 variants)
    {
      id: 'NPK_Phonska_Plus_25kg',
      productId: 'NPK_Phonska_Plus',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 320000,
      stock: 100,
    },
    {
      id: 'NPK_Phonska_Plus_50kg',
      productId: 'NPK_Phonska_Plus',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 620000,
      stock: 100,
    },
    // NPK Grower Special (2 variants)
    {
      id: 'NPK_Grower_Special_25kg',
      productId: 'NPK_Grower_Special',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 380000,
      stock: 100,
    },
    {
      id: 'NPK_Grower_Special_50kg',
      productId: 'NPK_Grower_Special',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 750000,
      stock: 100,
    },
    // NPK Booster Buah (3 variants)
    {
      id: 'NPK_Booster_Buah_1kg',
      productId: 'NPK_Booster_Buah',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 25000,
      stock: 100,
    },
    {
      id: 'NPK_Booster_Buah_25kg',
      productId: 'NPK_Booster_Buah',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 450000,
      stock: 100,
    },
    {
      id: 'NPK_Booster_Buah_50kg',
      productId: 'NPK_Booster_Buah',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 880000,
      stock: 100,
    },
    // NPK Compact Slow Release (2 variants)
    {
      id: 'NPK_Compact_SlowRelease_1kg',
      productId: 'NPK_Compact_SlowRelease',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 45000,
      stock: 100,
    },
    {
      id: 'NPK_Compact_SlowRelease_25kg',
      productId: 'NPK_Compact_SlowRelease',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 950000,
      stock: 100,
    },
    // Organik Granul Super (2 variants)
    {
      id: 'Organik_Granul_Super_25kg',
      productId: 'Organik_Granul_Super',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 50000,
      stock: 100,
    },
    {
      id: 'Organik_Granul_Super_50kg',
      productId: 'Organik_Granul_Super',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 95000,
      stock: 100,
    },
    // Kompos Super Matang (2 variants)
    {
      id: 'Kompos_Super_Matang_25kg',
      productId: 'Kompos_Super_Matang',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 40000,
      stock: 100,
    },
    {
      id: 'Kompos_Super_Matang_50kg',
      productId: 'Kompos_Super_Matang',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 75000,
      stock: 100,
    },
    // Organik Cair Plus Giberelin (2 variants)
    {
      id: 'Organik_Cair_Plus_Giberelin_1L',
      productId: 'Organik_Cair_Plus_Giberelin',
      weight_in_kg: 1, // 1 Liter as 1 kg equivalent
      packagingId: 'Botol_1L',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 75000,
      stock: 100,
    },
    {
      id: 'Organik_Cair_Plus_Giberelin_500ml',
      productId: 'Organik_Cair_Plus_Giberelin',
      weight_in_kg: 0.5, // 500 ml as 0.5 kg equivalent
      packagingId: 'Botol_1L', // Assuming 500ml uses a 1L bottle type for simplicity
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 45000,
      stock: 100,
    },
    // Guano Fosfat Alami (3 variants)
    {
      id: 'Guano_Fosfat_Alami_1kg',
      productId: 'Guano_Fosfat_Alami',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 30000,
      stock: 100,
    },
    {
      id: 'Guano_Fosfat_Alami_25kg',
      productId: 'Guano_Fosfat_Alami',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 550000,
      stock: 100,
    },
    {
      id: 'Guano_Fosfat_Alami_50kg',
      productId: 'Guano_Fosfat_Alami',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 1050000,
      stock: 100,
    },
    // Bio Trichoderma Hayati (2 variants)
    {
      id: 'Bio_Trichoderma_Hayati_1kg',
      productId: 'Bio_Trichoderma_Hayati',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 60000,
      stock: 100,
    },
    {
      id: 'Bio_Trichoderma_Hayati_500g',
      productId: 'Bio_Trichoderma_Hayati',
      weight_in_kg: 0.5,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 35000,
      stock: 100,
    },
    // Mikroba Rhizobium Plus (2 variants)
    {
      id: 'Mikroba_Rhizobium_Plus_1kg',
      productId: 'Mikroba_Rhizobium_Plus',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 80000,
      stock: 100,
    },
    {
      id: 'Mikroba_Rhizobium_Plus_250g',
      productId: 'Mikroba_Rhizobium_Plus',
      weight_in_kg: 0.25,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 25000,
      stock: 100,
    },
    // Myco Plus Mikoriza (2 variants)
    {
      id: 'Myco_Plus_Mikoriza_1kg',
      productId: 'Myco_Plus_Mikoriza',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 120000,
      stock: 100,
    },
    {
      id: 'Myco_Plus_Mikoriza_5kg',
      productId: 'Myco_Plus_Mikoriza',
      weight_in_kg: 5,
      packagingId: 'Karung_25kg', // Using a generic bag type
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 550000,
      stock: 100,
    },
    // Urea Non-Subsidi (2 variants)
    {
      id: 'Urea_NonSubsidi_25kg',
      productId: 'Urea_NonSubsidi',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 280000,
      stock: 100,
    },
    {
      id: 'Urea_NonSubsidi_50kg',
      productId: 'Urea_NonSubsidi',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 550000,
      stock: 100,
    },
    // ZA Amonium Sulfat (2 variants)
    {
      id: 'ZA_Amonium_Sulfat_25kg',
      productId: 'ZA_Amonium_Sulfat',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 180000,
      stock: 100,
    },
    {
      id: 'ZA_Amonium_Sulfat_50kg',
      productId: 'ZA_Amonium_Sulfat',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 350000,
      stock: 100,
    },
    // KCL Kalium Klorida (3 variants)
    {
      id: 'KCL_Kalium_Klorida_1kg',
      productId: 'KCL_Kalium_Klorida',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 20000,
      stock: 100,
    },
    {
      id: 'KCL_Kalium_Klorida_25kg',
      productId: 'KCL_Kalium_Klorida',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 480000,
      stock: 100,
    },
    {
      id: 'KCL_Kalium_Klorida_50kg',
      productId: 'KCL_Kalium_Klorida',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 950000,
      stock: 100,
    },
    // SP-36 Super Fosfat (2 variants)
    {
      id: 'SP36_Super_Fosfat_25kg',
      productId: 'SP36_Super_Fosfat',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 220000,
      stock: 100,
    },
    {
      id: 'SP36_Super_Fosfat_50kg',
      productId: 'SP36_Super_Fosfat',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 430000,
      stock: 100,
    },
    // Mikro Boron Plus (2 variants)
    {
      id: 'Mikro_Boron_Plus_1kg',
      productId: 'Mikro_Boron_Plus',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 50000,
      stock: 100,
    },
    {
      id: 'Mikro_Boron_Plus_500g',
      productId: 'Mikro_Boron_Plus',
      weight_in_kg: 0.5,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 30000,
      stock: 100,
    },
    // Mikro Fe-Chelate (2 variants)
    {
      id: 'Mikro_Fe_Chelate_1kg',
      productId: 'Mikro_Fe_Chelate',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 150000,
      stock: 100,
    },
    {
      id: 'Mikro_Fe_Chelate_250g',
      productId: 'Mikro_Fe_Chelate',
      weight_in_kg: 0.25,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 45000,
      stock: 100,
    },
    // Kalsium Nitrat Super (3 variants)
    {
      id: 'Kalsium_Nitrat_Super_1kg',
      productId: 'Kalsium_Nitrat_Super',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 28000,
      stock: 100,
    },
    {
      id: 'Kalsium_Nitrat_Super_25kg',
      productId: 'Kalsium_Nitrat_Super',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 650000,
      stock: 100,
    },
    {
      id: 'Kalsium_Nitrat_Super_50kg',
      productId: 'Kalsium_Nitrat_Super',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 1250000,
      stock: 100,
    },
    // Magnesium Sulfat Epsom (3 variants)
    {
      id: 'Magnesium_Sulfat_Epsom_1kg',
      productId: 'Magnesium_Sulfat_Epsom',
      weight_in_kg: 1,
      packagingId: 'Sachet_1kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 18000,
      stock: 100,
    },
    {
      id: 'Magnesium_Sulfat_Epsom_25kg',
      productId: 'Magnesium_Sulfat_Epsom',
      weight_in_kg: 25,
      packagingId: 'Karung_25kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 400000,
      stock: 100,
    },
    {
      id: 'Magnesium_Sulfat_Epsom_50kg',
      productId: 'Magnesium_Sulfat_Epsom',
      weight_in_kg: 50,
      packagingId: 'Karung_50kg',
      imageUrl: '/dashboard/Hero.jpg',
      priceRupiah: 780000,
      stock: 100,
    },
  ];

  for (const variant of variants) {
    try {
      await prisma.productVariant.create({
        data: variant,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        continue;
      }
      throw error;
    }
  }
  console.log('Product variants seeded successfully!');
};
