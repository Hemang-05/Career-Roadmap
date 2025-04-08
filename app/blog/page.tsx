//app/blog/page.tsx

import { supabase } from "@/utils/supabase/supabaseClient";
import BlogCard from "@/components/BlogCard";
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

export default async function BlogPage() {
  const { data: blogs, error } = (await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })) as {
    data: Blog[] | null;
    error: any;
  };

  if (error) {
    return <p className="text-red-500">Error loading blogs: {error.message}</p>;
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <FloatingNavbar navLinks={dashboardLinks} />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-amber-600 mb-8">
          Our Blog
        </h1>
        <div className="grid mt-16 gap-8 md:grid-cols-3">
          {blogs?.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
}
