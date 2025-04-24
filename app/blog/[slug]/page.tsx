// // app/blog/[slug]/page.tsx

// export const dynamic = "force-dynamic";

// import React from "react";
// import { supabase } from "@/utils/supabase/supabaseClient";
// import { notFound } from "next/navigation";
// import { format } from "date-fns";
// import ReactMarkdown from "react-markdown";
// import FloatingNavbar from "@/components/Navbar";

// const dashboardLinks = [
//   { href: "/roadmap", label: "Roadmap" },
//   { href: "/events", label: "Events" },
//   { href: "/analytics", label: "User Analysis" },
// ];

// export default async function BlogPost(props: any): Promise<React.ReactNode> {
//   const { slug } = props.params;

//   // Fetch blog data using the slug
//   const { data: blog, error } = await supabase
//     .from("blogs")
//     .select("*")
//     .eq("slug", slug)
//     .single();

//   if (error || !blog) {
//     console.error(`Error fetching blog post for slug "${slug}":`, error);
//     notFound();
//   }

//   return (
//     <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
//       <FloatingNavbar navLinks={dashboardLinks} />
//       <div className="max-w-5xl mx-auto mt-20">
//         <article className="prose lg:prose-xl mx-auto py-12">
//           {blog.title && (
//             <h1 className="text-orange-600 font-extrabold text-4xl mb-4">
//               {blog.title}
//             </h1>
//           )}
//           {blog.created_at && (
//             <p className="text-sm pt-0 text-gray-500 mt-0 mb-6">
//               {format(new Date(blog.created_at), "MMMM dd, yyyy")}
//               {blog.author && ` · By ${blog.author}`}
//             </p>
//           )}
//           {blog.cover_image_url && (
//             <img
//               src={blog.cover_image_url}
//               alt={blog.title || "Blog cover image"}
//               className="w-full my-8 rounded-lg shadow-md"
//             />
//           )}
//           {blog.content && (
//             <div className="text-zinc-900 font-light leading-relaxed">
//               <ReactMarkdown>{String(blog.content)}</ReactMarkdown>
//             </div>
//           )}
//         </article>
//       </div>
//     </div>
//   );
// }

// export async function generateStaticParams() {
//   const { data: blogs, error } = await supabase.from("blogs").select("slug");

//   if (error || !blogs) {
//     console.error("Error fetching slugs for generateStaticParams:", error);
//     return [];
//   }

//   return blogs
//     .map((b: { slug: string | null | undefined }) => ({ slug: b.slug || "" }))
//     .filter((p: { slug: string }) => p.slug);
// }

// app/blog/[slug]/page.tsx

// app/blog/[slug]/page.tsx

// app/blog/[slug]/page.tsx

export const dynamic = "force-dynamic";

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

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  author: string | null;
  created_at: string;
};

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
      <FloatingNavbar navLinks={dashboardLinks} />
      <div className="max-w-5xl mx-auto mt-20">
        <article className="prose lg:prose-xl mx-auto py-12">
          {blog.title && (
            <h1 className="text-orange-600 font-extrabold text-4xl mb-4">
              {blog.title}
            </h1>
          )}
          {blog.created_at && (
            <p className="text-sm text-gray-500 mt-0 mb-6">
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

          <ReactMarkdown
            components={{
              // Destructure out props we don't want on the HTML elements
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold my-6" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-semibold my-4" {...props} />
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
