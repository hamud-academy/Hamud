"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BAR_BLUE = "#3b82f6";

type Props = {
  totalRevenue: number;
  totalStudents: number;
  coursesCount: number;
  avgProgress: number;
  revenueByMonth: { month: string; revenue: number }[];
  studentsPerCourse: { courseId: string; title: string; students: number }[];
  progressByCourse: { courseId: string; title: string; avgProgress: number; enrollments: number }[];
};

export default function TeacherDashboardClient({
  totalRevenue,
  totalStudents,
  coursesCount,
  avgProgress,
  revenueByMonth,
  studentsPerCourse,
  progressByCourse,
}: Props) {
  const monthLabels = revenueByMonth.map(({ month }) => {
    const [y, m] = month.split("-");
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  });
  const revenueChartData = revenueByMonth.map((r, i) => ({
    name: monthLabels[i] ?? r.month,
    revenue: r.revenue,
  }));

  const studentsChartData = studentsPerCourse.map((s) => ({
    name: s.title.length > 20 ? s.title.slice(0, 20) + "…" : s.title,
    students: s.students,
  }));

  const cards = [
    {
      label: "COURSE REVENUE",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "STUDENTS ENROLLED",
      value: String(totalStudents),
      icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "MY COURSES",
      value: String(coursesCount),
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "AVG. STUDENT PROGRESS",
      value: `${avgProgress}%`,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your courses and student progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-4`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Revenue by month</h2>
          {revenueChartData.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No paid orders yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number | undefined) => [`$${value != null ? value.toFixed(2) : "0"}`, "Revenue"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="revenue" fill={BAR_BLUE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Students per course</h2>
          {studentsChartData.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No enrollments yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number | undefined) => [value ?? 0, "Students"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="students" fill={BAR_BLUE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Student progress by course</h2>
          <p className="text-sm text-slate-500 mt-0.5">Average completion % per course</p>
        </div>
        <div className="overflow-x-auto">
          {progressByCourse.length === 0 ? (
            <p className="px-6 py-12 text-center text-slate-500">No enrollments yet</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollments</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progressByCourse.map((row) => (
                  <tr key={row.courseId} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.title}</td>
                    <td className="px-6 py-4 text-slate-600">{row.enrollments}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[140px] h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${row.avgProgress}%` }}
                          />
                        </div>
                        <span className="text-slate-700 font-medium w-10">{row.avgProgress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
