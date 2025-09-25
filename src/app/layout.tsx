import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Seva Sahayak - Punjab Government Services Assistant",
  description: "AI-powered assistant for Punjab Government services. Get instant, accurate answers about government procedures, documents, and services.",
  keywords: "Punjab, Government, Services, AI, Assistant, Certificates, Documents",
  authors: [{ name: "Punjab Government" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Seva Sahayak - Punjab Government Services Assistant",
    description: "AI-powered assistant for Punjab Government services",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={inter.className}>
        <main className="h-screen w-full">
          {children}
        </main>
      </body>
    </html>
  );
}