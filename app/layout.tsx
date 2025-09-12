export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { ISetting } from "@/lib/database/models/setting.model";
import { getSetting } from "@/lib/actions/setting.actions";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings: ISetting | null = await getSetting();

  return {
    title: settings
      ? `${settings.name} | ${settings.tagline || ""}`
      : "ACS Gadgets",
    description:
      settings?.description ||
      "Shop the latest gadgets and electronics online with ease",
    keywords: [
      "Online Gadgets Store",
      "Electronics",
      "Smart Devices",
      "Tech Products",
      "ACS Gadgets",
      "Shop Online",
      "Buy Gadgets",
      "Latest Technology",
      "Affordable Electronics",
      "Gadget Deals",
      "Smart Accessories",
    ],
    icons: {
      icon: settings?.favicon,
      shortcut: "/assets/images/favicon.ico",
      apple: "/assets/images/apple-touch-icon.png",
    },
    alternates: {
      canonical: "https://www.dropandshipping.com/",
    },
    openGraph: {
      title: settings
        ? `${settings.name} | Discover the Latest Gadgets Online`
        : "ACS Gadgets",
      description:
        settings?.description ||
        "Find and shop trending gadgets, smart devices, and accessories at ACS Gadgets — your go-to online gadgets store.",
      url: "https://www.dropandshipping.com/",
      siteName: settings?.name || "ACS Gadgets",
      images: [
        {
          url: "https://www.dropandshipping.com/assets/images/logo.png",
          width: 1200,
          height: 630,
          alt: settings?.name || "ACS Gadgets",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings
        ? `${settings.name} | Shop Gadgets Online`
        : "ACS Gadgets",
      description:
        settings?.description ||
        "ACS Gadgets is your trusted online store for the latest gadgets, electronics, and accessories — shop smarter today.",
      images: ["/assets/images/logo.png"],
    },
  };
}

export async function generateStaticParams() {
  // optional for i18n or static params, else omit if unused
  return [];
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
