// app/blog/[slug]/page.tsx

import React from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import FloatingNavbar from "@/components/Navbar";

const dashboardLinks = [
  { href: "/roadmap", label: "Roadmap" },
  { href: "/events", label: "Events" },
  { href: "/analytics", label: "User Analysis" },
];

// Define the expected type for params - This remains the same
type BlogPostPageProps = {
  params: {
    slug: string;
  };
  // Note: params itself might eventually be typed as Promise<{ slug: string }>,
  // but for destructuring in the signature, this type works.
  // The key change is how you *use* params inside the function.
};

// Function signature remains the same, but how params is used changes
export default async function BlogPost({
  params,
}: BlogPostPageProps): Promise<React.ReactNode> {
  // *** THE KEY CHANGE IS HERE ***
  // Await params before accessing its properties, as per the documentation
  const { slug } = await params;

  // Fetch blog data using the slug
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
            <h1 className="text-orange-600 font-extrabold text-4xl mb-4">
              {blog.title}
            </h1>
          )}
          {blog.created_at && (
            <p className="text-sm pt-0 text-gray-500 mt-0 mb-6">
              {(() => {
                try {
                  // Ensure the format string is exactly this:
                  return format(new Date(blog.created_at), "MMMM dd, yyyy");
                } catch (e) {
                  console.error("Error formatting date:", blog.created_at, e);
                  // Optionally return the original string or a placeholder
                  return String(blog.created_at);
                }
              })()}
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
          {blog.content && (
            <div className="text-zinc-900 font-light leading-relaxed">
              <ReactMarkdown>{String(blog.content)}</ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

// generateStaticParams remains unchanged - it runs at build time and provides
// the params object synchronously in that context. The async change applies
// to how params is accessed during request time within the page component.
// export async function generateStaticParams() {
//   const { data: blogs, error } = await supabase.from("blogs").select("slug");

//   if (error || !blogs) {
//     console.error("Error fetching slugs for generateStaticParams:", error);
//     return [];
//   }

//   return blogs
//     .filter(
//       (b): b is { slug: string } =>
//         typeof b.slug === "string" && b.slug.length > 0
//     )
//     .map((b) => ({ slug: b.slug }));
// }

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
