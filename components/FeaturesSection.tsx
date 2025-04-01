// components/FeaturesSection.tsx
'use client'
import Image from 'next/image'

interface Feature {
  title: string;
  subtitle: string;
  color: string;
}

export default function FeaturesSection() {
  const features: Feature[] = [
    {
      title: "Comprehensive Roadmap",
      subtitle: "A full-blown roadmap from start to goal.",
      color: "#FF6500"
    },
    {
      title: "Real-Time Notifications",
      subtitle: "Timely alerts for events and scholarships.",
      color: "#FF6500"
    },
    {
      title: "Personalized AI Guidance",
      subtitle: "Customized career advice and roadmap adjustments.",
      color: "#FF6500"
    },
    {
      title: "Progress Monitoring",
      subtitle: "Tailored insights to track progress.",
      color: "#FF6500"
    },
    {
      title: "Curated Resources & Events",
      subtitle: "Access resources and upcoming events.",
      color: "#FF6500"
    },
    {
      title: "Expert Support & Community",
      subtitle: "A supportive network and expert guidance.",
      color: "#FF6500"
    }
  ];

  // Helper function to render a feature card (for full screens)
  const renderCard = (feature: Feature) => (
    <div className="animate-pop bg-white px-4 py-2 rounded-2xl shadow-all border border-[#FF6500]">
      <p className="text-base text-gray-800 text-center">
        <span className="font-bold">{feature.title.split(' ')[0]} </span>
        <span className="font-bold" style={{ color: feature.color }}>
          {feature.title.split(' ').slice(1).join(' ')}:
        </span>
        <br />
        {feature.subtitle}
      </p>
    </div>
  );

  return (
    <section id="features" className="container mx-auto px-8 py-16 relative">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
        Personalized Roadmaps for Every Career
      </h2>
      <p className="text-gray-600 text-lg max-w-3xl mx-auto text-center mb-12">
        Our platform delivers a comprehensive, AI-driven roadmap tailored to your goals.
        Get real-time event notifications and updates, ensuring you never miss an opportunity.
      </p>

      {/* Full Screen Layout: Globe with Cards Around */}
      <div className="hidden md:block relative w-full h-[36rem]">
        {/* Center Rotating Globe */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72">
          <Image
            src="/glb.png"
            alt="Rotating Globe"
            fill
            className="object-cover rounded-full animate-spin"
            style={{ animationDuration: '20s' }}
          />
        </div>
        {/* Cards around the globe */}
        <div className="absolute top-[10%] left-[15%] w-[25rem]">
          {renderCard(features[0])}
        </div>
        <div className="absolute top-[10%] right-[15%] w-[25rem]">
          {renderCard(features[1])}
        </div>
        <div className="absolute top-[40%] right-[5%] w-[25rem]">
          {renderCard(features[2])}
        </div>
        <div className="absolute bottom-[10%] right-[15%] w-[25rem]">
          {renderCard(features[3])}
        </div>
        <div className="absolute bottom-[10%] left-[15%] w-[25rem]">
          {renderCard(features[4])}
        </div>
        <div className="absolute top-[40%] left-[5%] w-[25rem]">
          {renderCard(features[5])}
        </div>
      </div>

      {/* Mobile Layout: Stacked Cards */}
      <div className="md:hidden space-y-6 w-full max-w-md mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="animate-pop bg-white px-6 py-5 rounded-2xl shadow-all">
            <p className="text-base text-gray-800 text-center">
              <span className="font-bold">{feature.title.split(' ')[0]} </span>
              <span className="font-bold" style={{ color: feature.color }}>
                {feature.title.split(' ').slice(1).join(' ')}:
              </span>
              <br />
              {feature.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Custom Keyframes for auto pop/zoom animation & custom shadow */}
      <style jsx>{`
        @keyframes pop {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pop {
          animation: pop 3s ease-in-out infinite;
        }
        .shadow-all {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </section>
  );
}
