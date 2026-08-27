import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.admin.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  console.log("All users and associated records deleted.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
