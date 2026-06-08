import Header from "@/components/Header";
import SignUpPageContent from "@/components/SignUpPageContent";
import { DEFAULT_SITE_NAME } from "@/lib/default-site";

export const metadata = {
  title: `Sign up - ${DEFAULT_SITE_NAME}`,
  description: "Your account is created by admin after payment",
};

export default function SignUpPage() {
  return (
    <>
      <Header />
      <SignUpPageContent />
    </>
  );
}
