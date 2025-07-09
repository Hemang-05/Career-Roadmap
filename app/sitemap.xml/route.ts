// // app/sitemap.xml/route.ts

// import { NextResponse } from "next/server";
// import { supabase } from "@/utils/supabase/supabaseClient";

// // run on the Edge for speed
// export const runtime = "edge";

// type BlogSlug = {
//   slug: string;
//   created_at: string; // use created_at instead of updated_at
// };

// export async function GET() {
//   // 1. fetch all your blog slugs + created dates, with correct typing
//   const { data, error } = await supabase
//     .from("blogs")
//     .select("slug, created_at");

//   const posts = data as BlogSlug[] | null;

//   if (error) {
//     console.error("Error fetching slugs for sitemap:", error);
//   }

//   // 2. truly static pages
//   type SitemapUrl = {
//     loc: string;
//     lastmod?: string;
//     changefreq?: string;
//     priority?: number;
//   };

//   const staticUrls: SitemapUrl[] = [
//     { loc: "/", priority: 0.7 },
//     { loc: "/roadmap", priority: 0.7 },
//     { loc: "/events", priority: 0.7 },
//     { loc: "/analytics", priority: 0.7 },
//     { loc: "/terms", priority: 0.7 },
//     { loc: "/refund", priority: 0.7 },
//     { loc: "/privacy", priority: 0.7 },
//     { loc: "/jobs", priority: 0.7 },
//     // …add any others you like
//   ];

//   // 3. merge static + dynamic
//   const urls = [
//     ...staticUrls,
//     ...(posts ?? []).map(({ slug, created_at }) => ({
//       loc: `/blog/${slug}`,
//       lastmod: new Date(created_at).toISOString(),
//       changefreq: "daily",
//       priority: 0.6,
//     })),
//   ];

//   // 4. build the XML string
//   const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${urls
//   .map((u) => {
//     let block = `<loc>https://www.careeroadmap.com${u.loc}</loc>`;
//     if (u.lastmod) block += `<lastmod>${u.lastmod}</lastmod>`;
//     if (u.changefreq) block += `<changefreq>${u.changefreq}</changefreq>`;
//     if (u.priority != null) block += `<priority>${u.priority}</priority>`;
//     return `<url>${block}</url>`;
//   })
//   .join("\n")}
// </urlset>`;

//   return new NextResponse(xml, {
//     headers: { "Content-Type": "application/xml" },
//   });
// }

// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

// Run on the Edge for speed
export const runtime = "edge";

type BlogSlug = {
  slug: string;
  created_at: string;
  updated_at?: string; // Some blogs might have been updated
};

export async function GET() {
  try {
    // 1. Fetch all blog slugs with creation and modification dates
    const { data, error } = await supabase
      .from("blogs")
      .select("slug, created_at, updated_at")
      .order("created_at", { ascending: false }); // Most recent first

    if (error) {
      console.error("Error fetching blog slugs for sitemap:", error);
      // Continue with empty array if database fails
    }

    const posts = (data as BlogSlug[]) || [];

    // 2. Static pages with proper priorities and change frequencies
    const staticUrls = [
      {
        loc: "/",
        priority: 1.0,
        changefreq: "weekly",
        lastmod: new Date().toISOString(), // Homepage changes frequently
      },
      {
        loc: "/roadmap",
        priority: 0.9,
        changefreq: "weekly",
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/events",
        priority: 0.8,
        changefreq: "weekly",
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/analytics",
        priority: 0.7,
        changefreq: "weekly",
      },
      {
        loc: "/jobs",
        priority: 0.5,
        changefreq: "daily", // Jobs might change frequently
      },
      // Legal pages - lower priority, rarely change
      {
        loc: "/terms",
        priority: 0.3,
        changefreq: "yearly",
      },
      {
        loc: "/privacy",
        priority: 0.3,
        changefreq: "yearly",
      },
      {
        loc: "/refund",
        priority: 0.3,
        changefreq: "yearly",
      },
      // Add blog index page
      {
        loc: "/blog",
        priority: 0.8,
        changefreq: "daily",
        lastmod:
          posts.length > 0
            ? new Date(posts[0].created_at).toISOString()
            : new Date().toISOString(),
      },
    ];

    // 3. Blog posts with dynamic priorities based on recency
    const now = new Date();
    const blogUrls = posts.map(({ slug, created_at, updated_at }) => {
      const createdDate = new Date(created_at);
      const lastModified = updated_at ? new Date(updated_at) : createdDate;

      // Calculate priority based on recency (more recent = higher priority)
      const daysSinceCreated =
        (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      let priority = 0.8; // Base priority for blog posts

      if (daysSinceCreated < 7) {
        priority = 0.9; // Very recent posts
      } else if (daysSinceCreated < 30) {
        priority = 0.8; // Recent posts
      } else if (daysSinceCreated < 90) {
        priority = 0.7; // Somewhat recent
      } else {
        priority = 0.6; // Older posts
      }

      return {
        loc: `/blog/${slug}`,
        lastmod: lastModified.toISOString(),
        changefreq: "weekly" as const,
        priority: Math.round(priority * 10) / 10, // Round to 1 decimal place
      };
    });

    // 4. Combine all URLs
    const allUrls = [...staticUrls, ...blogUrls];

    // 5. Build the XML with proper escaping
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map((url) => {
    let urlBlock = `  <url>
    <loc>https://www.careeroadmap.com${url.loc}</loc>`;

    if (url.lastmod) {
      urlBlock += `
    <lastmod>${url.lastmod}</lastmod>`;
    }

    if (url.changefreq) {
      urlBlock += `
    <changefreq>${url.changefreq}</changefreq>`;
    }

    if (url.priority != null) {
      urlBlock += `
    <priority>${url.priority}</priority>`;
    }

    urlBlock += `
  </url>`;

    return urlBlock;
  })
  .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400", // Cache for 1 hour, stale-while-revalidate for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return minimal sitemap if there's an error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.careeroadmap.com/</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
</urlset>`;

    return new NextResponse(fallbackXml, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
