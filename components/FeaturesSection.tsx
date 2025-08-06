// File: components/FeaturesSection.tsx
import Image from "next/image";

interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const features: Feature[] = [
  {
    id: "ai-roadmap",
    title: "That Overwhelming Fog of 'What if' Every Gen Z Feels",
    description:
      "You’re up late, heart racing as headlines warn of disappearing jobs and your stuck in a sea of paths that all seem wrong. You're not alone. This is the reality for younger generation, where the future feels like a maze with no map.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1754478320/Roadmap_ldim7v.png",
  },
  {
    id: "events-updates",
    title: "AI That Reads Your Ambitions and Evolves in Real Time",
    description:
      "Ditch the outdated advice, our AI dives deep into who you are and what you love, then spins up a dynamic step-by-step plan that updates with every industry shake-up, keeping you on track for maximum impact and earnings.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1754488141/AIM_i8as2k.png",
  },
  {
    id: "ai-roadmap",
    title: "Secret Opportunities Curated Just for Your Rise",
    description:
      "It's brutal: You pour hours into honing your talents, only to watch less-skilled peers snag spots because they knew about that one hackathon, competitions, certifications or scholarship you missed. We're closing that awareness gap for good.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1754494647/EVE_kqnzus.png",
  },
  {
    id: "events-updates",
    title: "Embrace Your Path with Confidence and Clarity",
    description:
      "You’ve got the vision; we supply the map. Our AI decodes your anxieties and ambitions, then builds a living path that adapts as you grow—making you the in-demand asset of tomorrow.",
    imageUrl:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1754502500/final_ujydun.png",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 pb-8 md:pb-16 mt-24"
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

      <h3 className=" sm:text-5xl md:text-5xl lg:text-6xl text-5xl font-semibold text-gray-900 max-w-6xl mx-auto px-4 sm:px-4 lg:px-4 mb-16">
        Navigating the{" "}
        <span className="bg-transparent sm:bg-yellow-300 px-1.5 rounded-[2rem] text-black font-semibold">
          Chaos
        </span>{" "}
        of Tomorrow
      </h3>

      <div className="space-y-8 md:space-y-12">
        {features.map((feature, index) => (
          <article
            key={feature.id}
            className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            }`}
          >
            {/* Text Content */}
            <div className="w-full lg:w-1/2 space-y-4">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-sm md:text-base text-black leading-relaxed font-light">
                {feature.description}
              </p>
            </div>

            {/* Image */}
            <div className="w-full lg:w-3/4">
              <div className="relative pt-[76.78%] overflow-hidden ">
                <Image
                  src={feature.imageUrl}
                  alt={`${feature.title} - AI career guidance feature`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className=""
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

export { features };
export type { Feature };
