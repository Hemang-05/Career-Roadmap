// // components/TestimonialsSection.tsx
// 'use client'
// export default function TestimonialsSection() {
//   return (
//     <section id="testimonials" className="container mx-auto px-24 py-16">
//       <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-10">
//         What Our Users Say
//       </h2>
//       <div className="grid md:grid-cols-3 gap-8">
//         {/* Testimonial Card 1 */}
//         <div className="relative overflow-hidden rounded-3xl border border-[#FF6500]">
//           <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md">
//             <p className="text-gray-600 italic mb-4">
//               "CareerRoadmap helped me find the right path to become an Astronaut. The AI guidance was incredibly detailed!"
//             </p>
//             <h4 className="text-[#FF6500] font-semibold">– Student</h4>
//           </div>
//           <div className="shine pointer-events-none"></div>
//         </div>

//         {/* Testimonial Card 2 */}
//         <div className="relative overflow-hidden rounded-3xl border border-[#FF6500]">
//           <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md">
//             <p className="text-gray-600 italic mb-4">
//               "CareerRoadmap guides me find the right path to acheive my goal that is Scientist. The AI guidance was awsome!"
//             </p>
//             <h4 className="text-[#FF6500] font-semibold">– Student</h4>
//           </div>
//           <div className="shine pointer-events-none"></div>
//         </div>

//         {/* Testimonial Card 3 */}
//         <div className="relative overflow-hidden rounded-3xl border border-[#FF6500]">
//           <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md">
//             <p className="text-gray-600 italic mb-4">
//               "My child received timely alerts about scholarship deadlines. CareerRoadmap truly made a difference in their future."
//             </p>
//             <h4 className="text-[#FF6500] font-semibold">– Parent</h4>
//           </div>
//           <div className="shine pointer-events-none"></div>
//         </div>
//       </div>

//       <style jsx>{`
//         .shine {
//           position: absolute;
//           top: 0;
//           left: -150%;
//           width: 100%;
//           height: 100%;
//           background: linear-gradient(
//             120deg,
//             transparent,
//             rgba(255, 231, 216,0.1),
//             transparent
//           );
//           transform: skewX(-25deg);
//           animation: shine 2s linear infinite;
//         }
//         @keyframes shine {
//           0% {
//             left: -150%;
//           }
//           100% {
//             left: 150%;
//           }
//         }
//       `}</style>
//     </section>
//   );
// }




'use client';


import React from 'react';

interface TestimonialCardProps {
  testimonial: string;
  name: string;
  role: string;
  image: string;
  imagePosition: 'left' | 'right';
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  name,
  role,
  image,
  imagePosition,
}) => {
  const isLeft = imagePosition === 'left';

  return (
    <div className="relative">
      {/* Card */}
      <div className="relative bg-white rounded-3xl p-8 shadow-lg w-full max-w-120 mx-auto z-10">
        <div className="flex flex-col pr-16 sm:pr-20 md:pr-28">
          {/* Testimonial text */}
          <p className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
            {`"${testimonial}"`}
          </p>

          {/* Name and role */}
          <div className="mt-auto">
            <h4 className="text-lg font-bold text-gray-800">{name}</h4>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
      </div>

      {/* Person image - positioned to overlap the card */}
      <div className="absolute bottom-0 right-0 z-20 h-full max-h-100 w-auto flex items-end pointer-events-none">
        <img
          src={image}
          alt={name}
          className="object-contain object-bottom max-h-full scale-125 origin-bottom-right"
        />
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="w-full bg-white py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
          What Our Users Say
        </h2>

        {/* Testimonials carousel */}
        <div className="relative">
          {/* First set of testimonials */}
          <div className="flex w-[200%] animate-slide-rtl">
            <div className="flex w-full justify-center gap-8">
            <TestimonialCard
              testimonial="Lars Took Our Vision And Turned It Into A Stunning User-Friendly Digital Product. His Attention To Detail In Both UI/UX Design And The Framer Platform Is Truly Impressive. I'm Thrilled With The Results!"
              name="Oliver S"
              role="Photographer & Blogger"
              image="/1.png"
              imagePosition='right'
            />

            <TestimonialCard
              testimonial="Lars Took Our Vision And Turned It Into A Stunning User-Friendly Digital Product. His Attention To Detail In Both UI/UX Design And The Framer Platform Is Truly Impressive. I'm Thrilled With The Results!"
              name="Oliver S"
              role="Photographer & Blogger"
              image="/1.png"
              imagePosition='right'
            />


            <TestimonialCard
              testimonial="Lars Took Our Vision And Turned It Into A Stunning User-Friendly Digital Product. His Attention To Detail In Both UI/UX Design And The Framer Platform Is Truly Impressive. I'm Thrilled With The Results!"
              name="Oliver S"
              role="Photographer & Blogger"
              image="/1.png"
              imagePosition='right'
            />

            <TestimonialCard
              testimonial="Lars Took Our Vision And Turned It Into A Stunning User-Friendly Digital Product. His Attention To Detail In Both UI/UX Design And The Framer Platform Is Truly Impressive. I'm Thrilled With The Results!"
              name="Oliver S"
              role="Photographer & Blogger"
              image="/1.png"
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















// 'use client';

// import React from 'react';

// interface TestimonialCardProps {
//   testimonial: string;
//   name: string;
//   role: string;
//   image: string;
// }

// const TestimonialCard: React.FC<TestimonialCardProps> = ({
//   testimonial,
//   name,
//   role,
//   image,
// }) => {
  // return (
  //   <div className="relative">
  //     {/* Card */}
  //     <div className="relative bg-white rounded-3xl p-8 shadow-lg w-full max-w-120 mx-auto z-10">
  //       <div className="flex flex-col pr-16 sm:pr-20 md:pr-28">
  //         {/* Testimonial text */}
  //         <p className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
  //           {`"${testimonial}"`}
  //         </p>

  //         {/* Name and role */}
  //         <div className="mt-auto">
  //           <h4 className="text-lg font-bold text-gray-800">{name}</h4>
  //           <p className="text-sm text-gray-500">{role}</p>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Person image - positioned to overlap the card */}
  //     <div className="absolute bottom-0 right-0 z-20 h-full max-h-100 w-auto flex items-end pointer-events-none">
  //       <img
  //         src={image}
  //         alt={name}
  //         className="object-contain object-bottom max-h-full scale-1 origin-bottom-right"
  //       />
  //     </div>
  //   </div>
  // );
// };

// const TestimonialsSection: React.FC = () => {
  // return (
  //   <section id="testimonials" className="w-full bg-gray-50 py-16 overflow-hidden">
  //     <div className="container mx-auto px-4 sm:px-6 lg:px-8">
  //       <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
  //         What Our Users Say
  //       </h2>

  //       {/* Testimonial carousel */}
  //       <div className="max-w-3xl mx-auto">
  //         <div className="relative">
  //           <TestimonialCard
  //             testimonial="Lars Took Our Vision And Turned It Into A Stunning User-Friendly Digital Product. His Attention To Detail In Both UI/UX Design And The Framer Platform Is Truly Impressive. I'm Thrilled With The Results!"
  //             name="Oliver S"
  //             role="Photographer & Blogger"
  //             image="/1.png"
  //           />
  //         </div>
  //       </div>
        
  //       {/* Navigation controls */}
  //       <div className="flex justify-center mt-8 space-x-4">
  //         <button aria-label="Previous testimonial" className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shadow-md hover:bg-gray-400 transition">
  //           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  //           </svg>
  //         </button>
  //         <button aria-label="Next testimonial" className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shadow-md hover:bg-gray-400 transition">
  //           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  //           </svg>
  //         </button>
  //       </div>
  //     </div>
  //   </section>
  // );
// };

// export default TestimonialsSection;



