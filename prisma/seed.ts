import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash("123456", 12);

    await prisma.user.create({
      data: {
        email: "rhrakib044@gmail.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
        needPasswordChange: false,
        admin: {
          create: {
            name: "Super Admin",
            contactNumber: "01700000000",
          },
        },
      },
    });

    console.log("Seeding completed: Admin created (rhrakib044@gmail.com).");
  } else {
    console.log("Database already contains users. Skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
