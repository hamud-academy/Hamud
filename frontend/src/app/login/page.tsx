import Header from "@/components/Header";
import LoginPageContent from "@/components/LoginPageContent";
import { DEFAULT_SITE_NAME } from "@/lib/default-site";

export const metadata = {
  title: `Login - ${DEFAULT_SITE_NAME}`,
  description: `Login to your ${DEFAULT_SITE_NAME} account`,
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <LoginPageContent />
    </>
  );
}
