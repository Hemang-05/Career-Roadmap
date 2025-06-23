import React from "react";

interface TestimonialCardProps {
  testimonial: string;
  name: string;
  role: string;
  image: string;
  showImage?: boolean;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  name,
  role,
  image,
  showImage = true,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Card */}
      <div className="relative bg-white rounded-3xl p-6 shadow-lg w-full h-full border border-gray-100">
        <div className="flex flex-col h-full">
          {/* Testimonial text */}
          <p className="text-gray-700 mb-4 leading-relaxed text-sm md:text-base flex-1">
            {`"${testimonial}"`}
          </p>

          {/* Bottom section with name/role and image */}
          <div className="flex items-end justify-between mt-auto">
            <div className="flex-1">
              <h4 className="text-base font-bold text-[#FF6500]">{name}</h4>
              <p className="text-sm text-gray-500">{role}</p>
            </div>

            {/* Person image */}
            {showImage && (
              <div className="w-16 h-16 ml-4 flex-shrink-0">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      testimonial:
        "Career Roadmap has transformed my career planning. The personalized insights and real-time updates keep me ahead without the hefty price of traditional counseling.",
      name: "Harshit",
      role: "IIT-D Sophomore",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660742/test1-removebg-preview_vbteln.jpg?_s=public-apps",
    },
    {
      testimonial:
        "I used to rely on self-guidance, but switching to Career Roadmap was a game changer. The tailored alerts and comprehensive planning made all the difference!",
      name: "Abhimanyu",
      role: "NIT-W Senior",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1743662080/a_3d_illustration_of_a_teenager_image__1_-removebg-preview_dpdbtu.png",
    },
    {
      testimonial:
        "After a few disappointing experiences with conventional career counselors, I found the AI-driven roadmap to be refreshingly innovative instant updates, proactive alerts, and truly personalized guidance.",
      name: "Ananya",
      role: "IIT-B Graduate",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660744/testi3_janwli.jpg?_s=public-apps",
    },
    {
      testimonial:
        "Affordable and in-depth, Career Roadmap redefined my career journey. The real-time updates and ultra tailored guidance mean I'm always on track for success!",
      name: "Viaan",
      role: "IIT-K Junior",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660742/test1-removebg-preview_vbteln.jpg?_s=public-apps",
    },
    {
      testimonial:
        "The AI-powered insights are incredible. I never thought career planning could be this personalized and effective.",
      name: "Priya",
      role: "BITS-Pilani Graduate",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660742/test1-removebg-preview_vbteln.jpg?_s=public-apps",
    },
    {
      testimonial:
        "Best investment I've made for my future. The roadmap is clear, actionable, and constantly evolving.",
      name: "Rohit",
      role: "Professional",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1743662080/a_3d_illustration_of_a_teenager_image__1_-removebg-preview_dpdbtu.png",
    },
  ];

  return (
    <section id="testimonials" className="w-full  py-16 ">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-16">
          What Our <span className="text-[#FF6500]">Users</span> Say
        </h2>

        {/* Mobile - Single Column */}
        <div className="block md:hidden">
          <div className="space-y-6">
            {testimonials.slice(0, 4).map((item, index) => (
              <TestimonialCard
                key={`mobile-${index}`}
                {...item}
                showImage={true}
              />
            ))}
          </div>
        </div>

        {/* Tablet - Two Columns */}
        <div className="hidden md:block lg:hidden">
          <div className="grid grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
              <TestimonialCard {...testimonials[0]} className="h-64" />
              <TestimonialCard {...testimonials[2]} className="h-72" />
              <TestimonialCard {...testimonials[4]} className="h-56" />
            </div>

            {/* Column 2 - Offset */}
            <div className="space-y-6 mt-12">
              <TestimonialCard {...testimonials[1]} className="h-68" />
              <TestimonialCard {...testimonials[3]} className="h-60" />
              <TestimonialCard {...testimonials[5]} className="h-64" />
            </div>
          </div>
        </div>

        {/* Desktop - Three Columns Staggered */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="space-y-8">
              <TestimonialCard {...testimonials[0]} className="h-64" />
              <TestimonialCard {...testimonials[3]} className="h-60" />
            </div>

            {/* Column 2 - Offset */}
            <div className="space-y-8 mt-16">
              <TestimonialCard {...testimonials[1]} className="h-72" />
              <TestimonialCard {...testimonials[4]} className="h-52" />
            </div>

            {/* Column 3 - Different offset */}
            <div className="space-y-8 mt-8">
              <TestimonialCard {...testimonials[2]} className="h-68" />
              <TestimonialCard {...testimonials[5]} className="h-64" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
