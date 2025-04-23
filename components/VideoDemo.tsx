// src/components/VideoDemo.tsx
import React from "react";

const VideoDemo: React.FC = ({}) => {
  // Build a Cloudinary URL with white padding (c_pad) and desired aspect ratio (ar)
  const videoUrl = `https://res.cloudinary.com/ditn9req1/video/upload/v1745336963/2025-04-22-Career_Roadmap__3_gbjkga.mp4`;

  return (
    <section className="my-12 mx-12 flex justify-center bg-white">
      <div className="relative box-content w-full  max-h-[80svh] aspect-[2.1892816419612315] py-10 bg-white">
        <video
          src={videoUrl}
          controls
          className="absolute inset-0 rounded-lg bg-white object-cover"
        />
      </div>
    </section>
  );
};

export default VideoDemo;
