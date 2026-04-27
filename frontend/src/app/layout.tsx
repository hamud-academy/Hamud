import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSiteBranding } from "@/lib/site-branding";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const DEFAULT_TITLE = "BaroSmart - Quality learning, wherever you are";
const DEFAULT_DESCRIPTION =
  "Join thousands of students learning the latest skills. Learn quality knowledge wherever you are.";

function faviconPathFromUrl(faviconUrl: string): string | null {
  try {
    const p = new URL(faviconUrl).pathname;
    return p || null;
  } catch {
    return faviconUrl.startsWith("/") ? faviconUrl : null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { tabTitle, faviconUrl } = await getSiteBranding();
  const iconPath = faviconUrl ? faviconPathFromUrl(faviconUrl) : null;
  return {
    title: tabTitle || DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    ...(iconPath
      ? {
          icons: {
            icon: iconPath,
            shortcut: iconPath,
          },
        }
      : {}),
  };
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
