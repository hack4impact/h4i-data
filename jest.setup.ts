import dotenv from 'dotenv';

// Load the default .env file
dotenv.config();

afterAll(async () => {
  await prisma.member_project.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.$disconnect();
});
