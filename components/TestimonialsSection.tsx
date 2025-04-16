'use client';

import React from 'react';

interface TestimonialCardProps {
  testimonial: string;
  name: string;
  role: string;
  image: string;
  imagePosition: 'left' | 'right';
  showImage?: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  name,
  role,
  image,
  imagePosition,
  showImage = true,
}) => {
  const isLeft = imagePosition === 'left';

  return (
    <div className="relative">
      {/* Card */}
      <div className="relative bg-white rounded-3xl p-8 shadow-lg w-full max-w-120 mx-auto z-10">
        <div className={`flex flex-col ${showImage ? 'pr-16 sm:pr-20 md:pr-28' : 'pr-4'}`}>
          {/* Testimonial text */}
          <p className={`text-gray-700 ${showImage ? 'mr-20' : 'mr-2'} mb-2 leading-relaxed text-base md:text-normal`}>
            {`"${testimonial}"`}
          </p>

          {/* Name and role */}
          <div className="mt-auto">
            <h4 className="text-lg font-bold text-[#FF6500]">{name}</h4>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
      </div>

      {/* Person image - positioned to overlap the card */}
      {showImage && (
        <div className="absolute bottom-0 right-0 z-20 h-full max-h-100 w-auto flex items-end pointer-events-none">
          <img
            src={image}
            alt={name}
            className="object-contain object-bottom max-h-full scale-125 origin-bottom-right"
          />
        </div>
      )}
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  // Define testimonials data for reuse
  const testimonials = [
    {
      testimonial: "Career Roadmap has transformed my career planning. The personalized insights and real-time updates keep me ahead without the hefty price of traditional counseling.",
      name: "Harshit",
      role: "Student",
      image: "https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660742/test1-removebg-preview_vbteln.jpg?_s=public-apps",
      imagePosition: 'right' as const
    },
    {
      testimonial: "I used to rely on self-guidance, but switching to Career Roadmap was a game changer. The tailored alerts and comprehensive planning made all the difference!",
      name: "Abhimanyu",
      role: "Student",
      image: "https://res.cloudinary.com/ditn9req1/image/upload/v1743662080/a_3d_illustration_of_a_teenager_image__1_-removebg-preview_dpdbtu.png",
      imagePosition: 'right' as const
    },
    {
      testimonial: "After a few disappointing experiences with conventional career counselors, I found the AI-driven roadmap to be refreshingly innovative instant updates, proactive alerts, and truly personalized guidance",
      name: "Ananya",
      role: "Student",
      image: "https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660744/testi3_janwli.jpg?_s=public-apps",
      imagePosition: 'right' as const
    },
    {
      testimonial: "Affordable and in-depth, Career Roadmap redefined my career journey. The real-time updates and ultra tailored guidance mean I'm always on track for success!",
      name: "Viaan",
      role: "Student",
      image: "https://res.cloudinary.com/ditn9req1/image/upload/t_Temp/v1743666280/a_3d_illustration_of_a_teenager_image__2_-removebg-preview_zsyxp0.png",
      imagePosition: 'right' as const
    }
  ];

  return (
    <section id="testimonials" className="w-full bg-white py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-16 sm:mb-28">
          What Our <span className='text-[#FF6500]'>Users</span> Say
        </h2>

        {/* Mobile view - no images */}
        <div className="block sm:hidden">
          <div className="flex flex-col gap-4">
            {testimonials.map((item, index) => (
              <TestimonialCard 
                key={`mobile-${index}`} 
                {...item} 
                showImage={false} 
              />
            ))}
          </div>
        </div>

        {/* Desktop view - original carousel */}
        <div className="hidden sm:block relative">
          {/* First set of testimonials */}
          <div className="flex w-[200%] animate-slide-rtl">
            <div className="flex w-full justify-center gap-8">
              <TestimonialCard
                testimonial="Career Roadmap has transformed my career planning. The personalized insights and real-time updates keep me ahead without the hefty price of traditional counseling."
                name="Harshit"
                role="Student"
                image="https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660742/test1-removebg-preview_vbteln.jpg?_s=public-apps"
                imagePosition='right'
              />

              <TestimonialCard
                testimonial="I used to rely on self-guidance, but switching to Career Roadmap was a game-changer. The tailored alerts and comprehensive planning made all the difference!"
                name="Abhimanyu"
                role="Student"
                image="https://res.cloudinary.com/ditn9req1/image/upload/v1743662080/a_3d_illustration_of_a_teenager_image__1_-removebg-preview_dpdbtu.png"
                imagePosition='right'
              />

              <TestimonialCard
                testimonial="After a few disappointing experiences with conventional career counselors, I found the AI-driven roadmap to be refreshingly innovative instant updates, proactive alerts, and truly personalized guidance"
                name="Ananya"
                role="Student"
                image="https://res.cloudinary.com/ditn9req1/image/upload/fl_preserve_transparency/v1743660744/testi3_janwli.jpg?_s=public-apps"
                imagePosition='right'
              />

              <TestimonialCard
                testimonial="Affordable and in-depth, Career Roadmap redefined my career journey. The real-time updates and ultra-tailored guidance mean I'm always on track for success!"
                name="Viaan"
                role="Student"
                image="https://res.cloudinary.com/ditn9req1/image/upload/t_Temp/v1743666280/a_3d_illustration_of_a_teenager_image__2_-removebg-preview_zsyxp0.png"
                imagePosition='right'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-slide-rtl {
          animation: slide-rtl 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;