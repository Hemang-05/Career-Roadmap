// src/components/VideoDemo.tsx
import React, { useEffect, useRef, useState } from "react";

const VideoDemo: React.FC = ({}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const videoUrl = shouldLoad
    ? `https://res.cloudinary.com/ditn9req1/video/upload/v1745336963/2025-04-22-Career_Roadmap__3_gbjkga.mp4`
    : "";

  return (
    <section className="my-16 mx-16 p-20 flex justify-center bg-white">
      <div
        ref={containerRef}
        className="relative box-content w-full  max-h-[80svh] aspect-[2.1892816419612315] py-10 bg-white"
      >
        {shouldLoad && (
          <video
            src={videoUrl}
            controls
            preload="metadata"
            className="absolute inset-0 rounded-lg bg-white object-cover"
          />
        )}
      </div>
    </section>
  );
};

export default VideoDemo;
