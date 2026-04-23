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
    <section className="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-indigo-950">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
          Are you ready to start?
        </h2>
        <p className="text-blue-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
          {studentText} Register today and start your learning.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-white/80 text-white font-semibold rounded-xl hover:bg-white/10 transition"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
