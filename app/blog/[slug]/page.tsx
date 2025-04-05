// app/blog/[slug]/page.tsx

import { supabase } from "@/utils/supabase/supabaseClient"; // Ensure this path is correct
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

// Type the props directly in the function signature
export default async function BlogPost({
  params,
}: {
  params: { slug: string }; // Define the expected shape of params here
}) {
  // Destructure the slug directly
  const { slug } = params;

  // Fetch data using the slug
  const { data: blog, error } = await supabase
    .from("blogs") // Ensure 'blogs' is your correct table name
    .select("*") // Select all columns or specify needed ones like 'title, content, created_at, author, cover_image_url'
    .eq("slug", slug) // Filter by the slug column
    .single(); // Expect only one matching blog post

  // Handle errors or post not found
  if (error || !blog) {
    console.error(`Error fetching blog post for slug "${slug}":`, error); // Log the error for debugging
    notFound(); // Trigger a 404 page
  }

  // Render the blog post details
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Use prose for nice typography defaults, adjust classes as needed */}
        <article className="prose lg:prose-xl mx-auto py-12">
          {/* Check if blog title exists before rendering */}
          {blog.title && (
            <h1 className="text-orange-600 font-extrabold text-4xl mb-4">
              {blog.title}
            </h1>
          )}

          {/* Check if created_at exists and is valid before formatting */}
          {blog.created_at && (
            <p className="text-sm pt-0 text-gray-500 mt-0 mb-6"> {/* Adjusted margin/padding */}
              {format(new Date(blog.created_at), "MMMM dd, yyyy")} {/* Corrected format */}
              {blog.author && ` · By ${blog.author}`} {/* Added "By" for clarity */}
            </p>
          )}

          {/* Display cover image if available */}
          {blog.cover_image_url && (
            <img
              src={blog.cover_image_url}
              alt={blog.title || 'Blog cover image'} // Provide meaningful or fallback alt text
              className="w-full my-8 rounded-lg shadow-md" // Add styling
            />
          )}

          {/* Render blog content using ReactMarkdown, ensure content exists */}
          {blog.content && (
            // Apply styling to the markdown container if needed
            <div className="text-zinc-900 font-light leading-relaxed">
              {/* Ensure the input to ReactMarkdown is a string */}
              <ReactMarkdown>{String(blog.content)}</ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

// Generate static paths for blog posts during build time
export async function generateStaticParams() {
  // Fetch only the 'slug' column from the 'blogs' table
  const { data: blogs, error } = await supabase.from("blogs").select("slug");

  // Handle potential errors during slug fetching
  if (error || !blogs) {
    console.error("Error fetching slugs for generateStaticParams:", error);
    return []; // Return an empty array if fetching fails
  }

  // Map the fetched slugs into the format Next.js expects for params
  return blogs
    // Map each blog object to { slug: string }, providing fallback for null/undefined slugs
    .map((b: { slug: string | null | undefined }) => ({
      slug: b.slug || '',
    }))
    // Filter out any resulting objects where the slug is an empty string
    .filter((p: { slug: string }) => p.slug); // Explicitly type 'p' here
}

// Optional: Add revalidation if posts change often
// export const revalidate = 60; // Revalidate every 60 seconds