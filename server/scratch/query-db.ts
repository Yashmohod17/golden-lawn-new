import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
      staffProfile: true,
    }
  });
  console.log("USERS IN DB:");
  users.forEach(u => {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role.name}, Name: ${u.name}, StaffProfileID: ${u.staffProfile?.id}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
