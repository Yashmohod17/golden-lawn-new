import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('Bookings in Database:');
  console.log(JSON.stringify(bookings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
