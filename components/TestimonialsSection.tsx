// components/TestimonialsSection.tsx
'use client'
export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-10">
        What Our Users Say
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Testimonial Card 1 */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FF6500]">
          <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md">
            <p className="text-gray-600 italic mb-4">
              "CareerRoadmap helped me find the right path to become an Astronaut. The AI guidance was incredibly detailed!"
            </p>
            <h4 className="text-[#FF6500] font-semibold">– Student</h4>
          </div>
          <div className="shine pointer-events-none"></div>
        </div>

        {/* Testimonial Card 2 */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FF6500]">
          <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md">
            <p className="text-gray-600 italic mb-4">
              "CareerRoadmap guides me find the right path to acheive my goal that is Scientist. The AI guidance was awsome!"
            </p>
            <h4 className="text-[#FF6500] font-semibold">– Student</h4>
          </div>
          <div className="shine pointer-events-none"></div>
        </div>

        {/* Testimonial Card 3 */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FF6500]">
          <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md">
            <p className="text-gray-600 italic mb-4">
              "My child received timely alerts about scholarship deadlines. CareerRoadmap truly made a difference in their future."
            </p>
            <h4 className="text-[#FF6500] font-semibold">– Parent</h4>
          </div>
          <div className="shine pointer-events-none"></div>
        </div>
      </div>

      <style jsx>{`
        .shine {
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 231, 216,0.1),
            transparent
          );
          transform: skewX(-25deg);
          animation: shine 2s linear infinite;
        }
        @keyframes shine {
          0% {
            left: -150%;
          }
          100% {
            left: 150%;
          }
        }
      `}</style>
    </section>
  );
}
