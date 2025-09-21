import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NDC - Nagpur Developer Club | Connect Local Developers",
  description: "Join Nagpur's premier developer community. Connect with local software developers, find jobs & internships, get help through Q&A, and build your developer profile in Nagpur.",
  keywords: "Nagpur developers, software developers Nagpur, developer jobs Nagpur, programming community, tech jobs Maharashtra, developer network India",
  authors: [{ name: "NDC Team" }],
  creator: "Nagpur Developer Club",
  publisher: "NDC",
  openGraph: {
    title: "NDC - Nagpur Developer Club",
    description: "Connect with Nagpur's software developer community. Find jobs, get help, and grow your career.",
    url: "https://ndc-nagpur.com",
    siteName: "Nagpur Developer Club",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NDC - Nagpur Developer Club",
    description: "Connect with Nagpur's software developer community",
    creator: "@NDCNagpur",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nagpur Developer Club",
    "alternateName": "NDC",
    "url": "https://ndc-nagpur.com",
    "logo": "https://ndc-nagpur.com/logo.png",
    "description": "Nagpur's premier developer community connecting local software developers through profiles, job board, and Q&A platform.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nagpur",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://twitter.com/NDCNagpur",
      "https://linkedin.com/company/ndc-nagpur"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
