// // prisma/seed.ts
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   const jobs = await prisma.job.createMany({
//     data: [
//       {
//         title: 'استخدام Node.js',
//         description: 'تجربه کار با NestJS و Prisma الزامی است',
//         salary: 35000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام DevOps',
//         description: 'مسلط به Docker و Kubernetes',
//         salary: 45000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام گرافیست',
//         description: 'مسلط به Photoshop و Illustrator',
//         salary: null,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام دیجیتال مارکتر',
//         description: 'آشنا به Google Ads و آنالیز کمپین‌ها',
//         salary: 30000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام پشتیبان سایت',
//         description: 'پاسخ‌گویی به تیکت‌ها و رفع مشکلات فنی ساده',
//         salary: 18000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام بک‌اند Java',
//         description: 'مسلط به Spring Boot و RESTful API',
//         salary: 42000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام تحلیلگر داده',
//         description: 'تسلط بر SQL و ابزارهای BI مانند Power BI',
//         salary: 39000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام حسابدار',
//         description: 'تسلط بر نرم‌افزار هلو یا سپیدار',
//         salary: 25000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام مدیر منابع انسانی',
//         description: 'تجربه در جذب نیرو، ارزیابی عملکرد و آموزش',
//         salary: 47000000,
//         status: 'PENDING',
//       },
//       {
//         title: 'استخدام مدیر پروژه',
//         description: 'آشنایی با متدولوژی‌های Agile و ابزارهای مدیریت پروژه',
//         salary: 50000000,
//         status: 'PENDING',
//       },
//     ],
//   });

//   const allJobs = await prisma.job.findMany();

//   // Add locations to a few jobs
//   await prisma.jobLocation.createMany({
//     data: [
//       {
//         jobId: allJobs.find(j => j.title.includes('Node.js'))!.id,
//         city: 'تهران',
//         street: 'بلوار کشاورز',
//         alley: 'کوچه اول',
//       },
//       {
//         jobId: allJobs.find(j => j.title.includes('گرافیست'))!.id,
//         city: 'اصفهان',
//         street: 'خیابان نظر شرقی',
//       },
//       {
//         jobId: allJobs.find(j => j.title.includes('Java'))!.id,
//         city: 'تبریز',
//         alley: 'کوچه گلزار',
//       },
//       {
//         jobId: allJobs.find(j => j.title.includes('مدیر پروژه'))!.id,
//         city: 'مشهد',
//         street: 'خیابان احمدآباد',
//       },
//     ],
//   });

//   console.log('🌱 Seeding completed successfully');
// }

// main()
//   .catch(e => {
//     console.error('❌ Seeding error:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
