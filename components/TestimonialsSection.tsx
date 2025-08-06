import React from "react";

interface TestimonialCardProps {
  testimonial: string;
  name: string;
  role: string;
  image: string;
  showImage?: boolean;
  className?: string;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  name,
  role,
  image,
  showImage = true,
  className = "",
  index,
}) => {
  // Generate structured data for each testimonial
  const structuredData = {
    "@type": "Review",
    reviewBody: testimonial,
    author: {
      "@type": "Person",
      name: name,
      jobTitle: role,
    },
    itemReviewed: {
      "@type": "Product",
      name: "Career Roadmap",
    },
  };

  return (
    <article
      className={`relative ${className}`}
      itemScope
      itemType="https://schema.org/Review"
    >
      {/* Structured data for this testimonial */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl p-4   w-full h-full border ">
        <div className="flex flex-col h-full">
          {/* Testimonial text */}
          <blockquote
            className="text-gray-700 mb-3 leading-relaxed text-xs md:text-sm flex-1"
            itemProp="reviewBody"
          >
            {testimonial}
          </blockquote>

          {/* Bottom section with name/role and image */}
          <footer className="flex items-end justify-between mt-auto">
            <div
              className="flex-1"
              itemScope
              itemType="https://schema.org/Person"
            >
              <cite
                className="text-sm font-bold text-black not-italic"
                itemProp="name"
              >
                {name}
              </cite>
              <p className="text-xs text-gray-500" itemProp="jobTitle">
                {role}
              </p>
            </div>

            {/* Person image */}
            {showImage && (
              <div className="w-12 h-12 ml-3 flex-shrink-0">
                <img
                  src={image}
                  alt={`${name}, ${role} - Career Roadmap testimonial`}
                  className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                  loading="lazy"
                  width="48"
                  height="48"
                  itemProp="image"
                />
              </div>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      testimonial:
        "Career Roadmap has transformed my career planning. I've pivoted so many times, but now I don't have to worry about changes in the job market.",
      name: "Harshit",
      role: "IIT-D Sophomore",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625006/111_kpugzs.jpg", // Replace with your image
    },
    {
      testimonial:
        "I used to rely on self-guidance, but switching to Career Roadmap was very time saving. Wish I had found about it in freshmen year!",
      name: "Joshua",
      role: "Columbia University Senior",
      image:
        "https://i.pinimg.com/1200x/fd/25/2a/fd252ae1d82d63da9de8ec6ba9b591ed.jpg",
    },
    {
      testimonial:
        "Everyone's talking about AI, but Career Roadmap is the only one that actually helps you build a career. Grateful this exists.",
      name: "Abhimanyu",
      role: "NIT-W Senior",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753626601/21b10596de6c65534d8ff22ae4b1ac98_vuy1p3.jpg",
    },
    {
      testimonial:
        "After a few disappointing experiences with conventional career counselors, I found the AI-driven roadmap to be refreshingly innovative.",
      name: "Masahiko",
      role: "Waseda University Junior",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625005/lp_htyyni.jpg",
    },
    {
      testimonial:
        "Nah man, when I first heard about Career Roadmap, I thought it was just another AI gimmick. But after using it, I realized it's a must for anyone serious about their career.",
      name: "Peter",
      role: "Cornell University Graduate",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1743660639/samples/smile.jpg",
    },
    {
      testimonial:
        "The AI-powered insights are incredible. I never thought career planning could be this personal",
      name: "Jurgen",
      role: "Heidelberg University Sophomore",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625797/7e3f86531a6200b13b577128aa74bed7_am7a3x.jpg",
    },
  ];

  // Main structured data for the testimonials section
  const mainStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Career Roadmap",
    description: "AI-powered career planning and guidance platform",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: testimonials.length.toString(),
    },
    review: testimonials.map((testimonial) => ({
      "@type": "Review",
      reviewBody: testimonial.testimonial,
      author: {
        "@type": "Person",
        name: testimonial.name,
        jobTitle: testimonial.role,
      },
    })),
  };

  return (
    <section
      id="testimonials"
      className="w-full py-12"
      itemScope
      itemType="https://schema.org/Product"
      aria-labelledby="testimonials-heading"
    >
      {/* Main structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mainStructuredData),
        }}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        <header className="text-center mb-12">
          <h2
            id="testimonials-heading"
            className="text-2xl md:text-4xl font-bold text-gray-800"
            itemProp="name"
          >
            What Our Users Say
          </h2>
          <p className="sr-only">
            Real testimonials from Career Roadmap users including students from
            IIT, NIT, and BITS
          </p>
        </header>

        {/* Mobile - Single Column */}
        <div
          className="block md:hidden"
          role="region"
          aria-label="Mobile testimonials layout"
        >
          <div className="space-y-4">
            {testimonials.slice(0, 4).map((item, index) => (
              <TestimonialCard
                key={`mobile-${index}`}
                {...item}
                showImage={true}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Tablet - Two Columns */}
        <div
          className="hidden md:block lg:hidden"
          role="region"
          aria-label="Tablet testimonials layout"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <TestimonialCard
                {...testimonials[0]}
                className="h-48"
                index={0}
              />
              <TestimonialCard
                {...testimonials[2]}
                className="h-52"
                index={2}
              />
              <TestimonialCard
                {...testimonials[4]}
                className="h-44"
                index={4}
              />
            </div>

            {/* Column 2 - Offset */}
            <div className="space-y-4 mt-8">
              <TestimonialCard
                {...testimonials[1]}
                className="h-50"
                index={1}
              />
              <TestimonialCard
                {...testimonials[3]}
                className="h-46"
                index={3}
              />
              <TestimonialCard
                {...testimonials[5]}
                className="h-48"
                index={5}
              />
            </div>
          </div>
        </div>

        {/* Desktop - Three Columns Staggered */}
        <div
          className="hidden lg:block"
          role="region"
          aria-label="Desktop testimonials layout"
        >
          <div className="grid grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
              <TestimonialCard
                {...testimonials[0]}
                className="h-48"
                index={0}
              />
              <TestimonialCard
                {...testimonials[3]}
                className="h-48"
                index={3}
              />
            </div>

            {/* Column 2 - Offset */}
            <div className="space-y-6 mt-12">
              <TestimonialCard
                {...testimonials[1]}
                className="h-52"
                index={1}
              />
              <TestimonialCard
                {...testimonials[4]}
                className="h-44"
                index={4}
              />
            </div>

            {/* Column 3 - Different offset */}
            <div className="space-y-6 mt-6">
              <TestimonialCard
                {...testimonials[2]}
                className="h-50"
                index={2}
              />
              <TestimonialCard
                {...testimonials[5]}
                className="h-48"
                index={5}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
