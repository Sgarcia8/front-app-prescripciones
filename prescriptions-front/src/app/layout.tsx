import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { AppFooter } from "@/components/app-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prescripciones",
  description: "Gestión de prescripciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={geistSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NuqsAdapter>
          <div className="app-root-wrap">
            <div className="app-main-grow">{children}</div>
            <AppFooter />
          </div>
        </NuqsAdapter>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
