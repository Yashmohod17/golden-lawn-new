import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORDS_TO_CHECK = [
  'owner123',
  'manager123',
  'staff123',
  'newmanager123',
  'newstaff123'
];

async function main() {
  const users = await prisma.user.findMany({
    include: {
      role: true
    }
  });

  console.log("DB USER STATUS:");
  for (const user of users) {
    console.log(`Email: ${user.email} (Role: ${user.role?.name})`);
    for (const pw of PASSWORDS_TO_CHECK) {
      const isMatch = await bcrypt.compare(pw, user.password);
      if (isMatch) {
        console.log(`  -> Password matches: "${pw}"`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
