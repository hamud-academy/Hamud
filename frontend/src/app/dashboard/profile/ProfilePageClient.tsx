"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";
import ProfileForm from "./ProfileForm";

type Props = {
  userId: string;
  currentName: string;
  currentEmail: string;
  currentImage: string | null;
};

export default function ProfilePageClient(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-slate-600 hover:text-violet-600">
          {t("student.backToDashboard")}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("student.profileTitle")}</h1>
      <p className="text-slate-600 mb-6">{t("student.profileSubtitle")}</p>
      <ProfileForm {...props} />
    </div>
  );
}
