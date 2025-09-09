import '../../src/configs/env';
import { PrismaClient, ChatSenderType, Role } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PasswordUtils } from '../../src/utils/password-utils';

const prisma = new PrismaClient();

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sampleMessages = [
  'Halo kak, saya mau tanya soal produk ini.',
  'Apakah stok masih ada untuk ukuran ini?',
  'Kira-kira pengiriman ke Bandung berapa lama ya?',
  'Baik kak, akan saya proses ya.',
  'Boleh dikirimkan estimasi ongkirnya?',
  'Sudah saya lakukan pembayaran.',
  'Terima kasih kak!',
  'Siap, kami bantu segera.',
  'Apakah bisa COD?',
  'Ada varian lain tidak?',
  'Kemasannya seperti apa ya?',
  'Siap, akan kami konfirmasi kembali.',
  'Apakah ada garansi?',
  'Stock tinggal sedikit, mohon segera checkout ya kak.',
];

export const chatSeeder = async () => {
  // Ensure one admin exists for sending admin messages
  let admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        id: `USR-${uuid()}`,
        name: 'Seed Admin',
        email: 'seed.admin@example.com',
        password: await PasswordUtils.hashPassword('Admin123'),
        role: Role.ADMIN,
        phoneNumber: '+6281100000000',
      },
    });
  }

  const users = await prisma.user.findMany({ where: { role: Role.USER } });
  if (users.length === 0) {
    console.warn('No users found to seed chats for.');
    return;
  }

  // Create chats for many users
  let totalMessages = 0;

  for (const user of users) {
    // 75% of users get chat rooms
    if (Math.random() < 0.25) continue;

    // Ensure only one room per user; skip if exists
    const existingRoom = await prisma.chatRoom.findFirst({ where: { userId: user.id } });
    if (existingRoom) continue;

    // Create a chat room per user
    const room = await prisma.chatRoom.create({
      data: {
        id: `CHR-${uuid()}`,
        userId: user.id,
        lastMessageAt: null,
      },
    });

    // Create 40-200 messages per room, mixed senders and read statuses
    const messagesCount = randomInt(40, 200);
    const now = new Date();
    const startDaysAgo = randomInt(5, 180);
    const startDate = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);

    const messageData: any[] = [];
    let cursorDate = startDate;

    for (let i = 0; i < messagesCount; i++) {
      // Randomly pick sender, but bias toward user initiating conversation
      const senderType: ChatSenderType = i === 0 || Math.random() < 0.55
        ? ChatSenderType.USER
        : ChatSenderType.ADMIN;
      const senderId = senderType === ChatSenderType.USER ? user.id : admin.id;

      // Advance time by 5–240 minutes between messages
      const minutesStep = randomInt(5, 240);
      cursorDate = new Date(cursorDate.getTime() + minutesStep * 60 * 1000);

      // Read status logic: a portion remain unread for the opposing side
      let isReadByUser = true;
      let isReadByAdmin = true;

      if (senderType === ChatSenderType.USER) {
        // 20-35% of user messages remain unread by admin
        isReadByAdmin = Math.random() < 0.7;
      } else {
        // 15-30% of admin messages remain unread by user
        isReadByUser = Math.random() < 0.75;
      }

      messageData.push({
        id: `CHM-${uuid()}`,
        roomId: room.id,
        senderId,
        senderType,
        content: randomChoice(sampleMessages),
        hasAttachments: false,
        isReadByUser,
        isReadByAdmin,
        createdAt: cursorDate,
        updatedAt: cursorDate,
      });
    }

    // Bulk insert messages in chunks to avoid payload limits
    const chunkSize = 100;
    for (let start = 0; start < messageData.length; start += chunkSize) {
      const chunk = messageData.slice(start, start + chunkSize);
      await prisma.chatMessage.createMany({ data: chunk });
    }

    // Update lastMessageAt to the last message timestamp
    const lastAt = messageData[messageData.length - 1].createdAt as Date;
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: { lastMessageAt: lastAt },
    });

    totalMessages += messageData.length;
  }

  console.log(`Chats seeded successfully! Total messages: ${totalMessages}`);
};
