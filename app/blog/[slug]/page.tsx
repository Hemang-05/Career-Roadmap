// app/blog/[slug]/page.tsx

import React from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default async function BlogPost(props: any): Promise<React.ReactNode> {
  const { slug } = props.params;

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
      <div className="max-w-5xl mx-auto">
        <article className="prose lg:prose-xl mx-auto py-12">
          {blog.title && (
            <h1 className="text-orange-600 font-extrabold text-4xl mb-4">
              {blog.title}
            </h1>
          )}
          {blog.created_at && (
            <p className="text-sm pt-0 text-gray-500 mt-0 mb-6">
              {format(new Date(blog.created_at), "MMMM dd, yyyy")}
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
