// // app/blog/page.tsx

// export const dynamic = "force-static";
// export const revalidate = 60; // ISR: rebuild at most once per minute

// import { supabase } from "@/utils/supabase/supabaseClient";
// import BlogCard from "@/components/BlogCard";
// import FloatingNavbar from "@/components/Navbar";

// export const metadata = {
//   title: "Our Blog — Careeroadmap",
//   description:
//     "Latest articles, tips & insights to help you navigate your career journey.",
//   robots: {
//     index: true,
//     follow: true,
//   },
// };

// const dashboardLinks = [
//   { href: "/roadmap", label: "Roadmap" },
//   { href: "/events", label: "Events" },
//   { href: "/analytics", label: "User Analysis" },
// ];

// type Blog = {
//   id: string;
//   title: string;
//   slug: string;
//   content: string;
//   cover_image_url: string | null;
//   author: string | null;
//   created_at: string;
// };

// export default async function BlogPage() {
//   const { data: blogs, error } = (await supabase
//     .from("blogs")
//     .select("*")
//     .order("created_at", { ascending: false })) as {
//     data: Blog[] | null;
//     error: any;
//   };

//   if (error) {
//     return <p className="text-red-500">Error loading blogs: {error.message}</p>;
//   }

//   return (
//     <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
//       <FloatingNavbar navLinks={dashboardLinks} />
//       <div className="max-w-5xl mx-auto mt-20">
//         <h1 className="text-5xl font-extrabold text-center text-black mb-8">
//           Our Blog
//         </h1>
//         <div className="grid mt-16 gap-8 md:grid-cols-3">
//           {blogs?.map((blog) => (
//             <BlogCard key={blog.id} blog={blog} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// app/blog/page.tsx

export const dynamic = "force-static";
export const revalidate = 60; // ISR: rebuild at most once per minute

import { supabase } from "@/utils/supabase/supabaseClient";
import BlogCard from "@/components/BlogCard";
import FloatingNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title:
    "Career Development Blog | Expert Tips for Career Roadmaps & Professional Growth",
  description:
    "Discover expert career advice, roadmap strategies, portfolio tips, resume building guides, and opportunity-finding techniques. Stay ahead in your professional journey with our comprehensive career development blog.",
  keywords: [
    "career blog",
    "career development",
    "career roadmap",
    "professional growth",
    "career tips",
    "resume building",
    "portfolio improvement",
    "career opportunities",
    "job search strategies",
    "career advice",
    "professional development",
    "career planning",
    "skill development",
    "career advancement",
    "job market insights",
    "networking tips",
    "interview preparation",
    "career transition",
    "industry insights",
    "career success",
  ].join(", "),
  authors: [{ name: "Careeroadmap Team" }],
  category: "Career Development",
  openGraph: {
    title: "Career Development Blog | Expert Tips for Professional Growth",
    description:
      "Discover expert career advice, roadmap strategies, and professional development tips to accelerate your career journey.",
    url: "https://yourwebsite.com/blog",
    siteName: "Careeroadmap",
    images: [
      {
        url: "https://yourwebsite.com/og-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Career Development Blog - Professional Growth Tips",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Development Blog | Expert Tips for Professional Growth",
    description:
      "Discover expert career advice, roadmap strategies, and professional development tips.",
    images: ["https://yourwebsite.com/og-blog.jpg"],
    creator: "@yourhandle",
  },
  alternates: {
    canonical: "https://yourwebsite.com/blog",
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

const dashboardLinks = [
  { href: "/roadmap", label: "Roadmap" },
  { href: "/events", label: "Events" },
  { href: "/analytics", label: "User Analysis" },
];

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  author: string | null;
  created_at: string;
};

export default async function BlogPage() {
  const { data: blogs, error } = (await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })) as {
    data: Blog[] | null;
    error: any;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <FloatingNavbar navLinks={dashboardLinks} />
        <div className="max-w-5xl mx-auto mt-20">
          <div className="text-center" role="alert">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Blog Loading Error
            </h1>
            <p className="text-red-500">Error loading blogs: {error.message}</p>
            <p className="text-gray-600 mt-2">
              Please try refreshing the page or contact support if the issue
              persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Careeroadmap Career Development Blog",
    description:
      "Expert career advice, roadmap strategies, portfolio tips, resume building guides, and professional development insights.",
    url: "https://yourwebsite.com/blog",
    mainEntityOfPage: "https://yourwebsite.com/blog",
    publisher: {
      "@type": "Organization",
      name: "Careeroadmap",
      logo: {
        "@type": "ImageObject",
        url: "https://yourwebsite.com/logo.png",
      },
    },
    blogPost:
      blogs?.map((blog) => ({
        "@type": "BlogPosting",
        headline: blog.title,
        url: `https://yourwebsite.com/blog/${blog.slug}`,
        datePublished: blog.created_at,
        dateModified: blog.created_at,
        author: {
          "@type": "Person",
          name: blog.author || "Careeroadmap Team",
        },
        publisher: {
          "@type": "Organization",
          name: "Careeroadmap",
          logo: {
            "@type": "ImageObject",
            url: "https://yourwebsite.com/logo.png",
          },
        },
        image:
          blog.cover_image_url ||
          "https://yourwebsite.com/default-blog-image.jpg",
        description: blog.content.substring(0, 155) + "...",
        mainEntityOfPage: `https://yourwebsite.com/blog/${blog.slug}`,
      })) || [],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://yourwebsite.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://yourwebsite.com/blog",
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded"
        >
          Skip to main content
        </a>

        <FloatingNavbar navLinks={dashboardLinks} />

        <main id="main-content" className="max-w-5xl mx-auto mt-20">
          {/* SEO-optimized header section */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-black mb-6">
              Career Development Blog
            </h1>
            <p className="text-sm text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover expert insights on career roadmaps, professional growth
              strategies, portfolio enhancement tips, resume building guides,
              and opportunity-finding techniques. Accelerate your career journey
              with actionable advice from industry professionals.
            </p>
            {/* <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                #CareerRoadmap
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                #ProfessionalGrowth
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                #ResumeBuilding
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                #PortfolioTips
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                #CareerOpportunities
              </span>
            </div> */}
          </header>

          {/* Blog articles section */}
          <section aria-labelledby="blog-articles-title">
            <h2 id="blog-articles-title" className="sr-only">
              Latest Career Development Articles
            </h2>

            {blogs && blogs.length > 0 ? (
              <>
                <div className="mb-8 text-sm text-center">
                  <p className="text-gray-600">
                    Showing {blogs.length} article
                    {blogs.length !== 1 ? "s" : ""} • Updated regularly with
                    fresh career insights
                  </p>
                </div>

                <div
                  className="grid mt-16 gap-8 md:grid-cols-3"
                  role="list"
                  aria-label="Career development blog articles"
                >
                  {blogs.map((blog, index) => (
                    <article
                      key={blog.id}
                      role="listitem"
                      itemScope
                      itemType="https://schema.org/BlogPosting"
                      className="group"
                    >
                      {/* Hidden structured data for individual blog posts */}
                      <meta itemProp="headline" content={blog.title} />
                      <meta
                        itemProp="datePublished"
                        content={blog.created_at}
                      />
                      <meta
                        itemProp="author"
                        content={blog.author || "Careeroadmap Team"}
                      />
                      <meta
                        itemProp="url"
                        content={`https://yourwebsite.com/blog/${blog.slug}`}
                      />

                      <BlogCard
                        blog={blog}
                        // Load first 3 images with priority
                      />
                    </article>
                  ))}
                </div>

                {/* Additional SEO content */}
                <aside className="mt-16  p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Stay Updated with Career Insights
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our blog covers everything from traditional career paths to
                    emerging opportunities, helping students at every stage of
                    their journey. Whether you're starting out, changing
                    careers, or advancing in your field, find actionable advice
                    tailored to your goals.
                  </p>
                </aside>
              </>
            ) : (
              <div className="text-center py-16" role="status">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  New Articles Coming Soon
                </h2>
                <p className="text-gray-600">
                  We're working on fresh career development content. Check back
                  soon for the latest insights and tips!
                </p>
              </div>
            )}
          </section>

          {/* FAQ section for additional SEO value */}
          <section className="mt-20" aria-labelledby="faq-title">
            <h2
              id="faq-title"
              className="text-3xl font-bold text-center text-gray-800 mb-8"
            >
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white border rounded-3xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  How often do you publish new career articles?
                </h3>
                <p className="text-gray-600 text-sm">
                  We publish new career development articles regularly, covering
                  topics from career roadmaps to portfolio building and resume
                  optimization.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  What topics do you cover in your blog?
                </h3>
                <p className="text-gray-600 text-sm">
                  Our blog covers career roadmaps, professional development,
                  resume building, portfolio enhancement, interview tips, and
                  finding career opportunities across various industries.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Are the career tips suitable for all experience levels?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes! We create content for professionals at every stage - from
                  students to experienced professionals looking to advance or
                  change careers.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Can I suggest topics for future articles?
                </h3>
                <p className="text-gray-600 text-sm">
                  Absolutely! We welcome suggestions for career development
                  topics that would benefit our community of professionals.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
