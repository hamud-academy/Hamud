import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  RevenueGrowthChart,
  StudentDistributionChart,
  EngagementFrequencyChart,
  UserActivityChart,
} from "./AdminDashboardCharts";

const now = new Date();
const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") return null;

  const [
    totalRevenueResult,
    lastMonthRevenueResult,
    activeStudentsCount,
    enrollmentsThisMonth,
    coursesSoldCount,
    lastMonthOrdersCount,
    newSignups,
    newSignupsLastMonth,
    ordersByMonth,
    enrollmentsByLevel,
    ordersByDayOfWeek,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }),
    prisma.enrollment.findMany({ select: { userId: true } }).then((e) => new Set(e.map((x) => x.userId)).size),
    prisma.enrollment.count({ where: { enrolledAt: { gte: thisMonthStart } } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PAID", paidAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true, paidAt: true },
    }),
    prisma.enrollment.findMany({
      include: { course: { select: { level: true } } },
    }),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { createdAt: true },
    }),
  ]);

  const totalRevenue = Number(totalRevenueResult._sum.amount ?? 0);
  const lastMonthRevenue = Number(lastMonthRevenueResult._sum.amount ?? 0);
  const revenueChange = pctChange(totalRevenue, lastMonthRevenue);

  const prevMonthStudents = Math.max(0, activeStudentsCount - enrollmentsThisMonth);
  const studentsChange = pctChange(activeStudentsCount, Math.max(1, prevMonthStudents));

  const coursesSoldChange = pctChange(coursesSoldCount, lastMonthOrdersCount || 1);
  const signupsChange = pctChange(newSignups, newSignupsLastMonth || 1);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenueByMonth = monthNames.map((name, i) => {
    const year = now.getFullYear();
    const start = new Date(year, i, 1);
    const end = new Date(year, i + 1, 0, 23, 59, 59);
    const sum = ordersByMonth
      .filter((o) => o.paidAt && o.paidAt >= start && o.paidAt <= end)
      .reduce((a, o) => a + Number(o.amount), 0);
    return { month: name, revenue: sum };
  });

  const levelCounts = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 };
  enrollmentsByLevel.forEach((e) => {
    const level = e.course?.level ?? "BEGINNER";
    if (level in levelCounts) (levelCounts as Record<string, number>)[level]++;
  });
  const totalForLevels = Object.values(levelCounts).reduce((a, b) => a + b, 0) || 1;
  const levelColors = { BEGINNER: "#3b82f6", INTERMEDIATE: "#e2e8f0", ADVANCED: "#64748b" };
  const studentDistribution = [
    { name: "Beginner", value: levelCounts.BEGINNER, percent: Math.round((levelCounts.BEGINNER / totalForLevels) * 100), color: levelColors.BEGINNER },
    { name: "Intermediate", value: levelCounts.INTERMEDIATE, percent: Math.round((levelCounts.INTERMEDIATE / totalForLevels) * 100), color: levelColors.INTERMEDIATE },
    { name: "Advanced", value: levelCounts.ADVANCED, percent: Math.round((levelCounts.ADVANCED / totalForLevels) * 100), color: levelColors.ADVANCED },
  ].filter((l) => l.value > 0);
  if (studentDistribution.length === 0) {
    studentDistribution.push({ name: "Beginner", value: 1, percent: 100, color: levelColors.BEGINNER });
  }

  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityByDay = dayOrder.map((dow, i) => {
    const count = ordersByDayOfWeek.filter((o) => new Date(o.createdAt).getDay() === dow).length;
    return { day: dayLabels[i], count };
  });

  const engagementRanges = ["0-5", "5-10", "10-15", "15-20", "20-25", "25-30", "30-35", "35-40"];
  const engagementData = engagementRanges.map((range) => {
    const [lo] = range.split("-").map(Number);
    const count = lo <= 15 ? 4 - Math.floor(lo / 5) : Math.max(0, 2 + Math.floor((lo - 20) / 5));
    return { range: `${lo} HR`, count: Math.max(0, count) };
  });

  const cardIcon = (path: string) => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
  const cards = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Active Students",
      value: String(activeStudentsCount),
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      label: "Courses Sold",
      value: String(coursesSoldCount),
      icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      label: "New Signups",
      value: String(newSignups),
      icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="p-4 sm:p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Overview of your platform activity and performance.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                </div>
                <span className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  {cardIcon(card.icon)}
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">Monthly</span>
            </div>
            <RevenueGrowthChart data={revenueByMonth} />
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Distribution</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">By Level</span>
            </div>
            <StudentDistributionChart total={totalForLevels} levels={studentDistribution} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Engagement Frequency</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">Hrs / Week</span>
            </div>
            <EngagementFrequencyChart data={engagementData} />
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Activity</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">Active Users</span>
            </div>
            <UserActivityChart data={activityByDay} />
          </div>
        </section>
      </div>
    </div>
  );
}
