// File: components/FeaturesSection.tsx
import Image from "next/image";
import { RoadmapFlipWords } from "./ui/FlipWords";

interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const features: Feature[] = [
  {
    id: "ai-roadmap",
    title: "Your Ultimate AI Career Roadmap",
    description:
      "Experience a detailed, real-time career roadmap powered by AI. Choose your difficulty easy, medium, or hard to tailor your journey. Our universal insights surpass traditional counselors, ensuring you're never alone on your path to success.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/1_gfdydi.webp",
  },
  {
    id: "events-updates",
    title: "Real-Time Event Alerts",
    description:
      "Never miss an opportunity with our live notifications. From hackathons and competitions to cultural events, exam dates, and application deadlines, our platform ensures you're always informed. Stay ahead, upgrade your portfolio, and seize every moment with timely updates delivered straight to your email.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/2_i0s0kg.webp",
  },
  {
    id: "progress-analysis",
    title: "Your Progress Analyzer",
    description:
      "Stay in tune with your journey. Track your progress with our detailed analysis tool that monitors completed tasks, evaluates your learning pace, and shows whether you're ahead, on track, or need to catch up. Get real-time insights to boost your motivation and ensure you're always moving towards your career goals.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/3_ypnvue.webp",
  },
  // {
  //   id: "college-info",
  //   title: "College Insights",
  //   description:
  //     "Discover unbiased college information with no ads or endorsements. Our platform features a student-created rating system, allowing you to choose universities based on the metrics that matter most to you.",
  //   imageUrl:
  //     "https://res.cloudinary.com/ditn9req1/image/upload/v1743938066/4_sljgbg.webp",
  // },
  {
    id: "job-opportunities",
    title: "Boundless Job Opportunities",
    description:
      "Explore billions of job listings, including niche careers. Our platform ensures every dream has a chance to thrive, supporting you from your first step to your ultimate destination.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/5_udvvlr.webp",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-44 pb-8 md:pb-16 pt-0"
    >
      {/* SEO-friendly structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPageElement",
            name: "Features Section",
            description: "AI-powered career guidance platform features",
            mainEntity: features.map((feature) => ({
              "@type": "Service",
              name: feature.title,
              description: feature.description,
            })),
          }),
        }}
      />

      <header className="text-center mb-12 md:mb-28">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold">
          <RoadmapFlipWords />
        </h2>
      </header>

      <div className="space-y-16 md:space-y-24">
        {features.map((feature, index) => (
          <article
            key={feature.id}
            className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            }`}
          >
            {/* Text Content */}
            <div className="w-full lg:w-1/2 space-y-4">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative pt-[76.78%] overflow-hidden bg-white/20 ">
                <Image
                  src={feature.imageUrl}
                  alt={`${feature.title} - AI career guidance feature`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  priority={index < 2} // Prioritize first 2 images
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Cc5xgBcuuogN9XMgqKjmN6IpKDZ5SvV4eXo+pLiPZKGJSXPtBxhfJQU3YQxsxfH5PNJ5VPaJnHOTGfn3HcQQfvFN0kZmDe+qSaKbj0VRIsdJTnkEJU4hSyaXYrSJFpKivvNdIQgbW3TFN0HFjTfNLBqyMnUcjnJCPGvpFPsaV7bZGO5jqxzCaGbdnE0e9pnDRLJpqPLEiQEQpQhQI4rGF0qJXgJTqHvQTjQcL5iOQJd5V7bJGO5jqxzCaGbdnE0e9pnDR6JlkYdJJSbIJgAUYQglCCCEIJQggg"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// Export features data for potential reuse
export { features };
export type { Feature };
