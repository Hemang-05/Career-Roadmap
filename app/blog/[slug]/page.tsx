// app/blog/[slug]/page.tsx

export const dynamic = "force-dynamic";

import React from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import FloatingNavbar from "@/components/Navbar";
import type { Metadata } from "next";

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

// --- Fixed generateMetadata function with awaited params ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await params before destructuring
  const { slug } = await params;

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("title, content, cover_image_url")
    .eq("slug", slug)
    .single();

  if (error || !blog) {
    return {
      title: "Blog Post Not Found - Career Roadmap",
      description:
        "The requested blog post could not be found on Career Roadmap.",
    };
  }

  const description = blog.content
    ? blog.content.substring(0, 150) + "..."
    : blog.title || "Learn more on Career Roadmap's blog.";

  return {
    title: blog.title
      ? `${blog.title} - Career Roadmap Blog`
      : "Career Roadmap Blog",
    description: description,
    openGraph: {
      title: blog.title || "Career Roadmap Blog",
      description: description,
      url: `https://www.careeroadmap.com/blog/${slug}`,
      type: "article",
      images: blog.cover_image_url
        ? [blog.cover_image_url]
        : ["https://www.careeroadmap.com/images/default-blog-cover.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title || "Career Roadmap Blog",
      description: description,
      images: blog.cover_image_url
        ? [blog.cover_image_url]
        : ["https://www.careeroadmap.com/images/default-blog-cover.jpg"],
    },
    alternates: {
      canonical: `https://www.careeroadmap.com/blog/${slug}`,
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
}
// --- End fixed generateMetadata function ---

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactNode> {
  // Await params before destructuring
  const { slug } = await params;

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !blog) {
    console.error(`Error fetching blog post for slug "${slug}":`, error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <FloatingNavbar navLinks={dashboardLinks} />
      <div className="max-w-5xl mx-auto mt-20">
        <article className="prose lg:prose-xl mx-auto py-12">
          {blog.title && (
            <h2 className="text-black font-extrabold text-xl mb-4">
              {blog.title}
            </h2>
          )}
          {blog.created_at && (
            <p className="text-sm text-gray-500 mt-0 mb-6">
              {format(new Date(blog.created_at), "MMMM dd,yyyy")}
              {blog.author && ` · By ${blog.author}`}
            </p>
          )}
          {blog.cover_image_url && (
            <img
              src={blog.cover_image_url}
              alt={blog.title || "Blog cover image"}
              className="w-full my-8 rounded-lg shadow-md"
            />
          )}

          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold my-6" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-semibold my-4" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 space-y-2" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 pl-4 italic text-gray-600 my-6"
                  {...props}
                />
              ),
              code: ({
                inline,
                className,
                children,
              }: {
                inline?: boolean;
                className?: string;
                children?: React.ReactNode;
              }) => {
                if (inline) {
                  return (
                    <code
                      className="bg-gray-100 px-1 rounded"
                      key={Math.random()}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    <code>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const { data: blogs, error } = await supabase.from("blogs").select("slug");

  if (error || !blogs) {
    console.error("Error fetching slugs for generateStaticParams:", error);
    return [];
  }

  return blogs
    .map((b: { slug: string | null | undefined }) => ({ slug: b.slug || "" }))
    .filter((p: { slug: string }) => p.slug);
}
