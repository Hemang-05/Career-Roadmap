import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "./globals.css";
import Footer from "@/components/Footer";
import Script from "next/script";
import Analysis from "@/utils/analytics";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Roadmap",
  description:
    "A personalized career roadmap ai platform for students—get step-by-step guidance, study resources, and event updates to reach your dream profession with ease.",
  openGraph: {
    title: "Career Roadmap",
    description:
      "A personalized career roadmap ai platform for students—get step-by-step guidance, study resources, and event updates to reach your dream profession with ease.",
    url: "https://www.careeroadmap.com",
    siteName: "Career Roadmap",
    images: [
      {
        url: "https://www.careeroadmap.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Career Roadmap Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Roadmap",
    description:
      "A personalized career roadmap ai platform for students—get step-by-step guidance, study resources, and event updates to reach your dream profession with ease.",
    images: [
      {
        url: "/og-image.png",
        alt: "Career Roadmap Preview",
      },
    ],
  },
  alternates: {
    canonical: "https://www.careeroadmap.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Google Analytics Script */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-V4YBRRQJFN`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-V4YBRRQJFN', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
          {/* Structured Data for SEO */}
          <Script id="structured-data" type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Career Roadmap",
              url: "https://https://www.careeroadmap.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://https://www.careeroadmap.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            })}
          </Script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning={true}
        >
          <Analysis />
          {children}
          <Analytics />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
