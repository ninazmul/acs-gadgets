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

function stripHtml(html?: string) {
  return html?.replace(/<[^>]+>/g, "") || "";
}

export async function generateMetadata(): Promise<Metadata> {
  const settings: ISetting | null = await getSetting();

  return {
    title: settings
      ? `${settings.name} | ${settings.tagline || ""}`
      : "ACS Gadgets",
    description:
      stripHtml(settings?.description) ||
      "ACS Gadgets is your one-stop destination for the latest and most innovative tech products. From everyday essentials to cutting-edge devices, we provide high-quality gadgets designed to make life smarter, easier, and more enjoyable. Our collection features everything from smart electronics and accessories to lifestyle-enhancing tools—all carefully curated for reliability, performance, and style. At ACS Gadgets, we believe technology should empower you, whether it’s for work, play, or daily convenience.",
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
      "BD online Shop",
      "Order Fulfillment BD",
      "Small Business Bangladesh",
      "E-commerce Solutions Bangladesh",
      "Inventory-free Business BD",
      "Digital Commerce Bangladesh",
      "Startup Bangladesh",
      "Online Retail BD",
      "Sales Tracking Bangladesh",
      "Customer Management BD",
      "Business Analytics Bangladesh",
      "BD Online Business",
      "Bangladesh Marketplaces",
      "E-commerce Platform BD",
      "Business Growth Bangladesh",
      "Entrepreneurship BD",
      "Online Sales Bangladesh",
      "E-commerce Tools BD",
      "Drop Shipping Solutions Bangladesh",
      "BD Shop",
      "dropshop",
      "dropshipping",
      "dropshipping.com.bd",
      "dropshop.com.bd",
      "dropshippingbd",
      "dropshipping bangladesh",
      "drop and shipping",
      "drop & shipping",
      "drop and shipping bd",
      "drop & shipping bd",
      "drop and shipping bangladesh",
      "drop & shipping bangladesh",
      "drop and ship",
      "drop & ship",
      "drop and ship bd",
      "drop & ship bd",
      "drop and ship bangladesh",
      "drop & ship bangladesh",
      "dropship",
      "dropship bd",
      "dropship bangladesh",
      "dropshipping platform bd",
      "dropshipping platform bangladesh",
      "ecommerce platform bd",
    ],
    icons: {
      icon: settings?.favicon,
      shortcut: "/assets/images/logo.png",
      apple: "/assets/images/logo.png",
    },
    alternates: {
      canonical: "https://acsgadgets.com/",
    },
    openGraph: {
      title: settings
        ? `${settings.name} | Discover the Latest Gadgets Online`
        : "ACS Gadgets",
      description:
        settings?.description ||
        "Find and shop trending gadgets, smart devices, and accessories at ACS Gadgets — your go-to online gadgets store.",
      url: "https://acsgadgets.com/",
      siteName: settings?.name || "ACS Gadgets",
      images: [
        {
          url: "https://acsgadgets.com/assets/images/logo.png",
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
