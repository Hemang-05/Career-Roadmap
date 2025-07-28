import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "./globals.css";
import Script from "next/script";
import Analysis from "@/utils/analytics";
import { Analytics } from "@vercel/analytics/next";
import FeedbackWidget from "@/components/FeedbackWidget";

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
    url: "www.careeroadmap.com",
    siteName: "Career Roadmap",
    images: [
      {
        url: "www.careeroadmap.com/og-image.png",
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
    canonical: "www.careeroadmap.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: "#000000", // blue
          colorBackground: "#ffffff",
          colorShimmer: "#f8f8f8", // black
        },
        elements: {
          // Targets the little “Sign in” or “Create account” link at the bottom
          pageLink: {
            display: "inline-block",
            margin: "1rem auto 0",
            padding: "0.5rem 1rem",
            backgroundColor: "#f8f8f8",
            color: "#000000",
            border: "12px solid",
            borderRadius: "9999px", // pill shape
            textDecoration: "none",
            fontWeight: "800",
            cursor: "pointer",
          },
          // Hide the default link label so we can inject our own text if needed
          pageLink__label: {
            display: "none",
          },
        },
      }}
    >
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
              url: "https://careeroadmap.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://www.careeroadmap.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            })}
          </Script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Analysis />
          {children}
          <FeedbackWidget />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
