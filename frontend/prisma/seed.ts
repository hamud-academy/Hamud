import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/barosmart";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data (optional - for clean seed)
  await prisma.order.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Programming", slug: "programming", description: "Barashada barnaamijyada" },
    }),
    prisma.category.create({
      data: { name: "Design", slug: "design", description: "Naqshadaynta UI/UX" },
    }),
    prisma.category.create({
      data: { name: "Business", slug: "business", description: "Ganacsiga iyo maamulka" },
    }),
    prisma.category.create({
      data: { name: "Data Science", slug: "data-science", description: "Sayniska xogta" },
    }),
  ]);

  // 2. Create Instructors
  const instructors = await Promise.all([
    prisma.user.create({
      data: {
        email: "ahmed@barosmart.com",
        name: "Ahmed Mohamed Ali",
        role: "INSTRUCTOR",
      },
    }),
    prisma.user.create({
      data: {
        email: "zahra@barosmart.com",
        name: "Zahra Ali",
        role: "INSTRUCTOR",
      },
    }),
    prisma.user.create({
      data: {
        email: "abdirahman@barosmart.com",
        name: "Abdirahman Keynan",
        role: "INSTRUCTOR",
      },
    }),
  ]);

  // 3. Create Courses with Modules and Lessons
  const course1 = await prisma.course.create({
    data: {
      title: "Web Development: From Zero to Pro",
      slug: "web-development-from-zero-to-pro",
      description: "Baro dhisida websites casri ah adoo adeegsanaya React iyo Next.js.",
      price: 49.99,
      originalPrice: 120,
      level: "BEGINNER",
      language: "so",
      durationHours: 84,
      published: true,
      instructorId: instructors[0].id,
      categoryId: categories[0].id,
      modules: {
        create: [
          {
            title: "Hordhaca & Deegaanka Shaqada",
            order: 1,
            lessons: {
              create: [
                { title: "Waa maxay Web Development?", duration: 10, order: 1 },
                { title: "Dejinta VS Code & Plugins", duration: 15, order: 2 },
              ],
            },
          },
          {
            title: "Aasaaska HTML & CSS",
            order: 2,
            lessons: {
              create: [
                { title: "HTML Basics", duration: 25, order: 1 },
                { title: "Tailwind CSS", duration: 30, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Data Analysis with Python & SQL",
      slug: "data-analysis-python-sql",
      description: "Baro analysis-ka xogta adoo adeegsanaya Python iyo SQL.",
      price: 59.99,
      originalPrice: 149,
      level: "INTERMEDIATE",
      language: "so",
      durationHours: 60,
      published: true,
      instructorId: instructors[1].id,
      categoryId: categories[3].id,
      modules: {
        create: [
          {
            title: "Hordhaca Python",
            order: 1,
            lessons: {
              create: [
                { title: "Python Setup", duration: 12, order: 1 },
                { title: "Pandas Library", duration: 35, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "UI/UX Design Essentials 2024",
      slug: "ui-ux-design-essentials-2024",
      description: "Baro naqshadaynta UI/UX ee casriga ah adoo adeegsanaya Figma.",
      price: 39.99,
      originalPrice: 89,
      level: "BEGINNER",
      language: "so",
      durationHours: 40,
      published: true,
      instructorId: instructors[2].id,
      categoryId: categories[1].id,
      modules: {
        create: [
          {
            title: "Design Principles",
            order: 1,
            lessons: {
              create: [
                { title: "Color Theory", duration: 20, order: 1 },
                { title: "Typography", duration: 25, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // 4. Create a demo student
  const student = await prisma.user.create({
    data: {
      email: "student@barosmart.com",
      name: "Demo Student",
      role: "STUDENT",
    },
  });

  // 5. Create enrollment
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      progress: 25,
    },
  });

  // 6. Create admin (login: admin@gmail.com / admin123) - only this admin can access admin pages
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    create: {
      email: "admin@gmail.com",
      name: "Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
    update: { passwordHash: adminHash, role: "ADMIN" },
  });

  console.log("Seed completed successfully!");
  console.log("- Categories:", categories.length);
  console.log("- Instructors:", instructors.length);
  console.log("- Courses: 3 (Web Dev, Data Analysis, UI/UX)");
  console.log("- Demo student:", student.email);
  console.log("- Admin: admin@gmail.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
