// // components/BlogCard.tsx

// import Link from "next/link";
// import { format } from "date-fns";
// import ReactMarkdown from "react-markdown";

// type Props = {
//   blog: {
//     id: string;
//     title: string;
//     slug: string;
//     content: string;
//     cover_image_url: string | null;
//     author: string | null;
//     created_at: string;
//   };
// };

// export default function BlogCard({ blog }: Props) {
//   // take first 150 chars (may cut markdown mid‑tag, but for a simple excerpt this usually works)
//   const excerpt = blog.content.slice(0, 100) + "...";

//   return (
//     <Link href={`/blog/${blog.slug}`} className="block group">
//       <div className="bg-[#ffdac7] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
//         {blog.cover_image_url && (
//           <img
//             src={blog.cover_image_url}
//             alt={blog.title}
//             className="w-full h-48 object-cover"
//           />
//         )}
//         <div className="p-6">
//           <h2 className="text-2xl font-semibold mb-2 text-zinc-800 group-hover:text-orange-600 transition-colors">
//             {blog.title}
//           </h2>
//           <p className="text-gray-500 text-xs mb-4">
//             {format(new Date(blog.created_at), "MMM dd, yyyy")}{" "}
//             {blog.author && `· ${blog.author}`}
//           </p>
//         </div>
//       </div>
//     </Link>
//   );
// }

// components/BlogCard.tsx

import Link from "next/link";
import { format } from "date-fns";
import React from "react";

type Props = {
  blog: {
    id: string;
    title: string;
    slug: string;
    content: string;
    cover_image_url: string | null;
    author: string | null;
    created_at: string;
  };
};

export default function BlogCard({ blog }: Props) {
  // Take the first 100 characters as an excerpt, strip line‑breaks
  const excerpt =
    blog.content.slice(0, 100).replace(/\n|\r/g, " ").trim() + "...";

  return (
    <Link href={`/blog/${blog.slug}`} className="block group" prefetch={false}>
      <div className="bg-[#ffdac7] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        {blog.cover_image_url && (
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2 text-zinc-800 group-hover:text-orange-600 transition-colors">
            {blog.title}
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            {format(new Date(blog.created_at), "MMM dd, yyyy")}
            {blog.author ? ` · ${blog.author}` : ""}
          </p>
          <p className="text-gray-700 text-sm">{excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
