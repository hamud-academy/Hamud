import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { DEFAULT_SITE_TITLE } from "@/lib/default-site";
import { getSiteBranding } from "@/lib/site-branding";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

const DEFAULT_DESCRIPTION =
  "Join thousands of students learning the latest skills. Learn quality knowledge wherever you are.";

function faviconHrefFromUrl(faviconUrl: string): string | null {
  try {
    return new URL(faviconUrl).toString();
  } catch {
    return faviconUrl.startsWith("/") ? faviconUrl : null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { tabTitle, faviconUrl } = await getSiteBranding();
  const iconHref = faviconUrl ? faviconHrefFromUrl(faviconUrl) : null;
  return {
    title: tabTitle || DEFAULT_SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    ...(iconHref
      ? {
          icons: {
            icon: iconHref,
            shortcut: iconHref,
          },
        }
      : {}),
  };
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-200`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
