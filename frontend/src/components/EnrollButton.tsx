"use client";

import { useRouter } from "next/navigation";

interface Props {
  courseId: string;
  slug: string;
  isLoggedIn: boolean;
  isEnrolled: boolean;
}

export default function EnrollButton({
  slug,
  isLoggedIn,
  isEnrolled,
}: Props) {
  const router = useRouter();

  const goToCheckout = () => {
    router.push(`/checkout/${slug}`);
  };

  const goToCourseInDashboard = () => {
    router.push(`/dashboard/courses/${slug}`);
  };
  const goToDashboard = goToCourseInDashboard;

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={goToCheckout}
        className="w-full px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition text-center text-sm sm:text-base shadow-sm cursor-pointer"
      >
        ENROLL NOW
      </button>
    );
  }

  if (isEnrolled) {
    return (
      <button
        type="button"
        onClick={goToCourseInDashboard}
        className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition text-center text-sm sm:text-base cursor-pointer"
      >
        Continue learning →
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={goToCheckout}
      className="w-full px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition text-center text-sm sm:text-base shadow-sm cursor-pointer"
    >
      ENROLL NOW
    </button>
  );
}

