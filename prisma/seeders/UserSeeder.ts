import '../../src/configs/env';
import { PrismaClient, Role } from '@prisma/client';
import { PasswordUtils } from '../../src/utils/password-utils';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export const userSeeder = async () => {
  const users = [
    {
      id: `USR-${uuid()}`,
      name: 'Test User',
      email: 'testuser@example.com',
      password: await PasswordUtils.hashPassword('Test1234'),
      role: Role.USER,
      phoneNumber: '+6281111111111',
    },
    {
      id: `USR-${uuid()}`,
      name: 'Test User Admin 2',
      email: 'adyuta123@gmail.com',
      password: await PasswordUtils.hashPassword('Yuta32154'),
      role: Role.ADMIN,
      phoneNumber: '+6281111111111',
    },
    {
      id: `USR-${uuid()}`,
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: await PasswordUtils.hashPassword('Admin1234'),
      role: Role.ADMIN,
      phoneNumber: '+6281222222222',
    },
    {
      id: `USR-${uuid()}`,
      name: 'Qiqi Oberon',
      email: 'aquq1q1.farrukh@gmail.com',
      password: await PasswordUtils.hashPassword('Q1q10beron'),
      role: Role.ADMIN,
      phoneNumber: '+6281333333333',
    },
    {
      id: `USR-${uuid()}`,
      name: 'Aqil Dominic',
      email: 'aquaq1l.farrukh@gmail.com',
      password: await PasswordUtils.hashPassword('Q1q10beron'),
      role: Role.USER,
      phoneNumber: '+6281444444444',
    },
  ];

  // Generate many additional regular users
  const extraUsersCount = 150;
  for (let i = 1; i <= extraUsersCount; i++) {
    const idx = i.toString().padStart(3, '0');
    users.push({
      id: `USR-${uuid()}`,
      name: `User ${idx}`,
      email: `user${idx}@example.com`,
      // Must be >=8 chars, include uppercase and number
      password: await PasswordUtils.hashPassword('User1234'),
      role: Role.USER,
      phoneNumber: `+62812${(10000000 + i).toString()}`,
    });
  }

  for (const user of users) {
    try {
      // Cek apakah user sudah ada berdasarkan email
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      let userId = user.id;

      if (!existingUser) {
        // Buat user jika belum ada
        const createdUser = await prisma.user.create({ data: user });
        userId = createdUser.id;
      } else {
        userId = existingUser.id;
      }

      // Cek apakah user sudah memiliki cart
      const existingCart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!existingCart) {
        await prisma.cart.create({
          data: {
            id: `CRT-${uuid()}`,
            userId,
          },
        });
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        continue;
      }
      throw error;
    }
  }

  console.log('Users seeded successfully!');
};
