import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

const STATIC_ROUTES = [
  "",
  "analytics",
  "dashboard",
  "events",
  "jobs",
  "roadmap",
  "universities",
  "terms",
  "refund",
  "privacy",
  "user_metric_db",
  "blog",
];

const BASE_URL = "https://careeroadmap.com"; // Change to your actual domain

export async function GET() {
  // Fetch all blog slugs from Supabase
  const { data: blogs, error } = await supabase.from("blogs").select("slug");

  let blogUrls = "";
  if (blogs && Array.isArray(blogs)) {
    blogUrls = blogs
      .filter((b) => b.slug)
      .map((b) => `  <url><loc>${BASE_URL}/blog/${b.slug}</loc></url>`)
      .join("\n");
  }

  const staticUrls = STATIC_ROUTES.map(
    (route) => `  <url><loc>${BASE_URL}/${route}</loc></url>`
  ).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls}\n${blogUrls}\n</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
