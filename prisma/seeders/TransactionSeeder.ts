// prisma/seeders/TransactionSeeder.ts

import {
  Prisma,
  PrismaClient,
  TxDeliveryStatus,
  TxManualStatus,
  TxMethod,
} from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

// Helper functions
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDateInMonth = (year: number, month: number): Date => {
  const day = getRandomNumber(1, 28);
  const hour = getRandomNumber(0, 23);
  const minute = getRandomNumber(0, 59);
  return new Date(Date.UTC(year, month, day, hour - 7, minute));
};

interface ICreatedTransactionSeed {
  transactionData: Prisma.TransactionCreateInput;
  items: Prisma.TransactionItemCreateManyInput[];
}

export const transactionSeeder = async () => {
  console.log('🚀 Starting advanced, purposeful transaction seeder...');

  // 1. Ambil data master
  const users = await prisma.user.findMany();
  const productVariants = await prisma.productVariant.findMany();
  const ppn = await prisma.currentPPN.findFirst();

  if (users.length < 5) {
    console.error('❌ Need at least 5 users for this seeder. Please seed users first.');
    return;
  }
  if (productVariants.length < 10) {
    console.error('❌ Need at least 10 product variants. Please seed them first.');
    return;
  }
  if (!ppn) {
    console.error('❌ PPN setting not found. Please set a PPN value.');
    return;
  }

  // 2. Tentukan Persona & Kategori Produk
  const frequentBuyer = users[0];
  const seasonalBuyer = users[1];
  const newUser = users[2];
  const nicheProductBuyer = users[3];
  
  const popularProducts = productVariants.slice(0, 4);
  const nicheProduct = productVariants[4];
  const regularProducts = productVariants.slice(5);

  const numberOfTransactions = 300; // ✅ Ditingkatkan menjadi 300
  const createdTransactions: ICreatedTransactionSeed[] = [];
  const now = new Date();

  // 3. Loop untuk membuat 300 transaksi
  for (let i = 0; i < numberOfTransactions; i++) {
    // ✅ BARU: Tentukan tanggal transaksi: sebar acak dalam 12 bulan terakhir
    const monthOffset = getRandomNumber(0, 11);
    const transactionDate = new Date(now);
    transactionDate.setMonth(now.getMonth() - monthOffset);
    // Pastikan tanggal tidak melebihi 'now' jika offsetnya 0
    if (monthOffset === 0) {
        transactionDate.setDate(getRandomNumber(1, now.getDate()));
    }
    const randomDateInThatMonth = getRandomDateInMonth(transactionDate.getFullYear(), transactionDate.getMonth());


    // Tentukan pengguna berdasarkan persona
    let currentUser = getRandomElement(users);
    const userRoll = Math.random();
    if (userRoll < 0.35) currentUser = frequentBuyer;
    else if (userRoll < 0.55 && monthOffset < 3) currentUser = seasonalBuyer;
    else if (userRoll < 0.60 && monthOffset === 0) currentUser = newUser;
    else if (userRoll < 0.65) currentUser = nicheProductBuyer;

    // Tentukan produk yang akan dibeli
    const cartItemsCount = getRandomNumber(1, 4);
    const selectedVariants: { variantId: string; quantity: number }[] = [];
    
    if (currentUser.id === nicheProductBuyer.id && Math.random() < 0.8) {
        if(nicheProduct.stock > 0) selectedVariants.push({ variantId: nicheProduct.id, quantity: 1 });
    }

    while (selectedVariants.length < cartItemsCount) {
        const productPool = Math.random() < 0.6 ? popularProducts : regularProducts;
        const variant = getRandomElement(productPool);
        if (variant.stock > 0 && !selectedVariants.some(v => v.variantId === variant.id)) {
            selectedVariants.push({
                variantId: variant.id,
                quantity: getRandomNumber(1, 2),
            });
        }
    }
    
    if (selectedVariants.length === 0) continue;

    // 4. Hitung total
    let cleanPrice = 0;
    let totalWeightInKg = 0;
    const transactionItemsData: any[] = [];

    for (const item of selectedVariants) {
      const variantDetails = productVariants.find(v => v.id === item.variantId)!;
      const itemPrice = variantDetails.priceRupiah * item.quantity;
      cleanPrice += itemPrice;
      totalWeightInKg += variantDetails.weight_in_kg * item.quantity;
      transactionItemsData.push({
        id: `TI-${uuid()}`,
        variantId: item.variantId,
        quantity: item.quantity,
        priceRupiah: itemPrice,
      });
    }

    // 5. Tentukan status dengan variasi
    const method = getRandomElement([TxMethod.DELIVERY, TxMethod.MANUAL]);
    let deliveryStatus: TxDeliveryStatus | null = null;
    let manualStatus: TxManualStatus | null = null;
    let shippingCost = 0;
    const statusRoll = Math.random();

    if (method === TxMethod.DELIVERY) {
      shippingCost = getRandomNumber(10000, 50000);
      if (statusRoll < 0.9) deliveryStatus = TxDeliveryStatus.DELIVERED;
      else if (statusRoll < 0.95) deliveryStatus = TxDeliveryStatus.SHIPPED;
      else if (statusRoll < 0.98) deliveryStatus = TxDeliveryStatus.PAID;
      else deliveryStatus = TxDeliveryStatus.CANCELLED;
    } else {
      if (statusRoll < 0.9) manualStatus = TxManualStatus.COMPLETE;
      else if (statusRoll < 0.95) manualStatus = TxManualStatus.PROCESSING;
      else if (statusRoll < 0.98) manualStatus = TxManualStatus.PAID;
      else manualStatus = TxManualStatus.CANCELLED;
    }

    const priceWithPPN = cleanPrice * (1 + ppn.percentage / 100);
    const totalPrice = priceWithPPN + shippingCost;
    
    const transactionData: Prisma.TransactionCreateInput = {
      id: `TX-${uuid()}`,
      user: { connect: { id: currentUser.id } },
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhoneNumber: currentUser.phoneNumber,
      method,
      deliveryStatus,
      manualStatus,
      cleanPrice,
      priceWithPPN: Math.round(priceWithPPN),
      totalPrice: Math.round(totalPrice),
      totalWeightInKg,
      PPNPercentage: ppn.percentage,
      city: 'Surabaya',
      province: 'Jawa Timur',
      district: 'Gubeng',
      subDistrict: 'Kertajaya',
      postalCode: '60282',
      shippingAddress: `Jl. Uji Coba Seeder No. ${i + 1}`,
      shippingCost,
      paymentMethod: 'bank_transfer',
      createdAt: randomDateInThatMonth,
    };
    
    createdTransactions.push({ transactionData, items: transactionItemsData });
  }

  // 6. Masukkan data ke database
  // Pastikan 5 transaksi terakhir memiliki item stock issue dan status PAID
  createdTransactions.sort((a, b) => {
    const aDate = a.transactionData.createdAt as Date;
    const bDate = b.transactionData.createdAt as Date;
    return aDate.getTime() - bDate.getTime();
  });

  const lastFive = createdTransactions.slice(-5);
  for (const tx of lastFive) {
    // Set status ke PAID sesuai method
    if (tx.transactionData.method === TxMethod.DELIVERY) {
      tx.transactionData.deliveryStatus = TxDeliveryStatus.PAID;
    } else if (tx.transactionData.method === TxMethod.MANUAL) {
      tx.transactionData.manualStatus = TxManualStatus.PAID;
    }

    // Tandai minimal satu item sebagai stock issue
    if (tx.items && tx.items.length > 0) {
      tx.items[0] = { ...tx.items[0], isStockIssue: true } as any;
    }
  }

  for (const tx of createdTransactions) {
    try {
      await prisma.transaction.create({
        data: { ...tx.transactionData, transactionItems: { createMany: { data: tx.items } } },
      });
    } catch (error) {
      console.error(`❌ Failed to create transaction ${tx.transactionData.id}:`, error);
    }
  }

  console.log(`✅ Advanced transactions seeded successfully! (${createdTransactions.length} created)`);
};
