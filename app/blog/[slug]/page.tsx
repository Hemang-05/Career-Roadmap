// app/blog/[slug]/page.tsx

import { supabase } from "@/utils/supabase/supabaseClient";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

// Updated props type to include searchParams
type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function BlogPost({ params, searchParams }: Props) {
  // Destructure the slug directly; no need to await params
  const { slug } = params;

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <article className="prose lg:prose-xl mx-auto py-12">
          <h1 className="text-orange-600 font-extrabold text-4xl">
            {blog.title}
          </h1>
          <p className="text-sm pt-4 text-gray-500">
            {format(new Date(blog.created_at), "MMMM dd, yyyy")}
            {blog.author && ` · ${blog.author}`}
          </p>
          {blog.cover_image_url && (
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full my-8 rounded-lg"
            />
          )}
          <div className="text-zinc-900 font-light">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const { data: blogs } = await supabase.from("blogs").select("slug");
  return blogs?.map((b: { slug: string }) => ({ slug: b.slug })) || [];
}
