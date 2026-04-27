"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CTA() {
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.studentCount === "number") setStudentCount(data.studentCount);
      })
      .catch(() => {});
  }, []);

  const studentText =
    studentCount !== null
      ? `Join ${studentCount.toLocaleString()}+ active students.`
      : "Join thousands of active students.";

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20 bg-white dark:bg-slate-950">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#1447E6] px-6 py-10 text-white shadow-2xl shadow-[rgba(20,71,230,0.22)] sm:px-10 sm:py-14 lg:px-14">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-12 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50 ring-1 ring-white/20">
              Start learning today
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Build practical skills for your next opportunity.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-50/90 sm:text-lg">
              {studentText} Choose a course, learn at your own pace, and move closer to your goals with guided lessons and certificates.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#1447E6] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Get Started
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-xl border border-white/35 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Browse Courses
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-extrabold">{studentCount !== null ? `${studentCount.toLocaleString()}+` : "1K+"}</p>
                <p className="mt-1 text-xs font-medium text-blue-50/80">Active students</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">24/7</p>
                <p className="mt-1 text-xs font-medium text-blue-50/80">Online access</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">100%</p>
                <p className="mt-1 text-xs font-medium text-blue-50/80">Self-paced</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">Cert.</p>
                <p className="mt-1 text-xs font-medium text-blue-50/80">On completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
