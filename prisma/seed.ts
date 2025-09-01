// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database ...');

  const ali = await prisma.user.create({
    data: {
      firstName: 'علی',
      lastName: 'رضایی',
      email: 'ali.rezaei@example.com',
      password: 'hashed_password_ali',
      isEmailVerified: true,
      status: 'ACTIVE',
      role: 'EMPLOYER',
    },
  });

  const sara = await prisma.user.create({
    data: {
      firstName: 'سارا',
      lastName: 'احمدی',
      email: 'sara.ahmadi@example.com',
      password: 'hashed_password_sara',
      isEmailVerified: true,
      status: 'ACTIVE',
      role: 'SEEKER',
    },
  });

  const reza = await prisma.user.create({
    data: {
      firstName: 'رضا',
      lastName: 'محمدی',
      email: 'reza.mohammadi@example.com',
      password: 'hashed_password_reza',
      isEmailVerified: true,
      status: 'ACTIVE',
      role: 'EMPLOYER',
    },
  });

  const fatemeh = await prisma.user.create({
    data: {
      firstName: 'فاطمه',
      lastName: 'کاظمی',
      email: 'fatemeh.kazemi@example.com',
      password: 'hashed_password_fatemeh',
      isEmailVerified: false,
      status: 'ACTIVE',
      role: 'SEEKER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: 'مدیر',
      lastName: 'کل',
      email: 'admin@example.com',
      password: 'hashed_password_admin',
      isEmailVerified: true,
      status: 'ACTIVE',
      role: 'ADMIN',
    },
  });

  // ==== Jobs for Ali ====
  await prisma.job.createMany({
    data: [
      {
        title: 'برنامه‌نویس بک‌اند',
        description: 'مسلط به Node.js و Express',
        salary: 30000000,
        status: 'ACTIVE',
        userId: ali.id,
        createdAt: new Date(),
      },
      {
        title: 'توسعه‌دهنده فرانت‌اند',
        description: 'React و Next.js',
        salary: 28000000,
        status: 'PENDING',
        userId: ali.id,
      },
      {
        title: 'کارشناس دیتابیس',
        description: 'آشنایی با PostgreSQL و MongoDB',
        salary: 32000000,
        status: 'ACTIVE',
        userId: ali.id,
      },
    ],
  });

  await prisma.job.createMany({
    data: [
      {
        title: 'طراح رابط کاربری',
        description: 'مسلط به Figma و UX',
        salary: 25000000,
        status: 'ACTIVE',
        userId: reza.id,
      },
      {
        title: 'کارشناس دیجیتال مارکتینگ',
        description: 'SEO و شبکه‌های اجتماعی',
        salary: 20000000,
        status: 'INACTIVE',
        userId: reza.id,
      },
      {
        title: 'توسعه‌دهنده موبایل',
        description: 'Flutter و React Native',
        salary: 27000000,
        status: 'ACTIVE',
        userId: reza.id,
      },
      {
        title: 'مدیر پروژه IT',
        description: 'آشنایی با Agile و Scrum',
        salary: 35000000,
        status: 'PENDING',
        userId: reza.id,
      },
    ],
  });

  console.log('✅ Seeding completed .');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
