import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dataghmart Data Bundles — Buy Affordable Data Bundles in Ghana",
  description: "Buy cheap data bundles online in Ghana. MTN, Telecel & AirtelTigo data bundles with instant delivery. Best prices, fast internet packages, 24/7 support.",
  keywords: ["Ghana data bundles", "cheap data bundles", "MTN data bundles", "Telecel data bundles", "AirtelTigo data bundles", "buy data online Ghana", "instant data delivery", "affordable internet bundles", "data bundle reseller Ghana"],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    title: "Dataghmart Data Bundles — Buy Affordable Data in Ghana",
    description: "Buy cheap data bundles online. MTN, Telecel & AirtelTigo with instant delivery.",
    url: "https://dataghmart.vercel.app",
    siteName: "Dataghmart Data Bundles",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
