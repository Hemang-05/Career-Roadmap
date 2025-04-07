'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { RoadmapFlipWords } from './ui/FlipWords';

interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function FeaturesSection() {
  const features: Feature[] = [
    {
      id: 'ai-roadmap',
      title: "Your Ultimate AI Career Roadmap",
      description: "Experience a detailed, real-time career roadmap powered by AI. Choose your difficulty easy, medium, or hard to tailor your journey. Our universal insights surpass traditional counselors, ensuring you're never alone on your path to success.",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/1_gfdydi.webp" // Replace with your actual image URLs
    },
    {
      id: 'events-updates',
      title: "Real-Time Event Alerts",
      description: "Never miss an opportunity with our live notifications. From hackathons and competitions to cultural events, exam dates, and application deadlines, our platform ensures you're always informed. Stay ahead, upgrade your portfolio, and seize every moment with timely updates delivered straight to your email.",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/2_i0s0kg.webp"
    },
    {
      id: 'progress-analysis',
      title: "Your Progress Analyzer",
      description: "Stay in tune with your journey. Track your progress with our detailed analysis tool that monitors completed tasks, evaluates your learning pace, and shows whether you're ahead, on track, or need to catch up. Get real-time insights to boost your motivation and ensure you're always moving towards your career goals.",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/3_ypnvue.webp"
    },
    {
      id: 'college-info',
      title: "College Insights",
      description: "Discover unbiased college information with no ads or endorsements. Our platform features a student-created rating system, allowing you to choose universities based on the metrics that matter most to you.",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1743938066/4_sljgbg.webp"
    },
    {
      id: 'job-opportunities',
      title: "Boundless Job Opportunities",
      description: "Explore billions of job listings, including niche careers. Our platform ensures every dream has a chance to thrive, supporting you from your first step to your ultimate destination.",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1743938065/5_udvvlr.webp"
    }
  ];

  // Always initialize with the first feature selected
  const [activeFeature, setActiveFeature] = useState<string>(features[0].id);
  const [displayedFeature, setDisplayedFeature] = useState<string>(features[0].id);
  const [previousFeature, setPreviousFeature] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'fadeOut' | 'fadeIn'>('idle');

  const toggleFeature = (featureId: string) => {
    if (featureId !== activeFeature && animationState === 'idle') {
      setActiveFeature(featureId);
      setPreviousFeature(displayedFeature);
      setAnimationState('fadeOut');
    }
  };

  // Handle fade-out animation
  useEffect(() => {
    if (animationState === 'fadeOut') {
      // Wait for fade-out to complete
      const timer = setTimeout(() => {
        setDisplayedFeature(activeFeature);
        setAnimationState('fadeIn');
      }, 500); // Fade-out duration
      
      return () => clearTimeout(timer);
    }
  }, [animationState, activeFeature]);

  // Handle fade-in animation
  useEffect(() => {
    if (animationState === 'fadeIn') {
      // Wait for fade-in to complete
      const timer = setTimeout(() => {
        setPreviousFeature(null);
        setAnimationState('idle');
      }, 500); // Fade-in duration
      
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  // Get current feature object
  const getCurrentFeature = (): Feature => {
    return features.find(f => f.id === displayedFeature) || features[0];
  };

  // Get previous feature object
  const getPreviousFeature = (): Feature | null => {
    return previousFeature ? features.find(f => f.id === previousFeature) || null : null;
  };

  return (
    <section id="features" className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-44 pb-8 md:pb-16 pt-0">
      <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-center mb-12 md:mb-28">
        <RoadmapFlipWords/>
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side: Feature accordion - Takes full width on mobile */}
        <div className="w-full lg:w-1/2 space-y-4 order-2 lg:order-1">
          {features.map((feature) => (
            <div key={feature.id} className={`rounded-lg shadow-sm ${
              activeFeature === feature.id ? 'bg-[#fff4ed]' : 'bg-white'
            }`}>
              <button
                onClick={() => toggleFeature(feature.id)}
                className={`w-full text-left p-4 font-medium text-base sm:text-lg transition-all duration-300 ${
                  activeFeature === feature.id ? 'text-gray-800' : 'text-gray-700'
                }`}
              >
                {feature.title}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  activeFeature === feature.id ? 'max-h-80 p-4 pt-0' : 'max-h-0'
                }`}
              >
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right side: Feature image - Show above accordion on mobile */}
            <div className="w-full lg:w-1/2 order-1  lg:order-2 mb-8 lg:mb-0">
              {/* Image container with aspect ratio matching your image dimensions (1042x800) */}
              <div className="relative pt-[76.78%] mt-8 rounded-2xl overflow-hidden">
                {/* Previous image (fading out) */}
                {getPreviousFeature() && (
                  <div 
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      animationState === 'fadeOut' ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={getPreviousFeature()?.imageUrl || features[0].imageUrl}
                        alt={getPreviousFeature()?.title || features[0].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain" 
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                
                {/* Current image (fading in) */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    animationState === 'fadeIn' ? 'opacity-100' : 
                    animationState === 'fadeOut' ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={getCurrentFeature().imageUrl}
                      alt={getCurrentFeature().title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
      </div>
    </section>
  );
}