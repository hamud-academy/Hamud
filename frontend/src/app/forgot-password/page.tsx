import Header from "@/components/Header";
import ForgotPasswordPageContent from "@/components/ForgotPasswordPageContent";
import { DEFAULT_SITE_NAME } from "@/lib/default-site";

export const metadata = {
  title: `Forgot password - ${DEFAULT_SITE_NAME}`,
  description: `Reset your ${DEFAULT_SITE_NAME} account password`,
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <ForgotPasswordPageContent />
    </>
  );
}
