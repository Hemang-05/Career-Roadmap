"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

interface CardProps {
  image: string;
  title: string;
  alt: string;
}

const defaultCarouselCards: CardProps[] = [
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753552227/11_wfimk7.jpg",
    title: "USA",
    alt: "Image for Product One",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625797/18_vkup7d.jpg",
    title: "INDIA",
    alt: "Image for Service Two",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625797/e7bf838dbc506aff3ab5cd2e7e08d2e9_n0bsit.jpg",
    title: "JAPAN",
    alt: "Image for Feature Three",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625796/4e5a1522e1cb1fdd90fca26bc37ddf22_a5yvse.jpg",
    title: "GERMANY",
    alt: "Image for Solution Four",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625797/fd252ae1d82d63da9de8ec6ba9b591ed_jt6w8x.jpg",
    title: "CANADA",
    alt: "Image for Client Five",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625797/3f9f248bab9d6a04cd9960227048d30c_ylqo6e.jpg",
    title: "UK",
    alt: "Image for Innovation Six",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625796/75d5cbf6b6635e5ce574464137f83ae1_ex0bt8.jpg",
    title: "BRAZIL",
    alt: "Image for Innovation Six",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625796/3d1ab751573f82502158ce721f1c9384_z2pqbp.jpg",
    title: "SINGAPORE",
    alt: "Image for Innovation Six",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625797/7e3f86531a6200b13b577128aa74bed7_am7a3x.jpg",
    title: "AUSTRALIA",
    alt: "Image for Innovation Six",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625797/bd74237cd3a4ff4ea93406c105dc1385_sradje.jpg",
    title: "UAE",
    alt: "Image for Innovation Six",
  },
  {
    image:
      "https://res.cloudinary.com/ditn9req1/image/upload/v1753625796/ea914c1901363da17f6e133deeb97770_rozhxt.jpg",
    title: "SOUTH AFRICA",
    alt: "Image for Innovation Six",
  },
];

interface AutoCarouselSliderProps {
  cards?: CardProps[];
  speed?: number; // pixels per second
}

export const AutoCarouselSlider: React.FC<AutoCarouselSliderProps> = ({
  cards = defaultCarouselCards,
  speed = 60,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [singleWidth, setSingleWidth] = useState(0);

  // After mount (and whenever cards change), measure half the scrollWidth
  useEffect(() => {
    if (!containerRef.current) return;
    const full = containerRef.current.scrollWidth;
    setSingleWidth(full / 2);
  }, [cards]);

  // Duplicate cards so that when we scroll one set out, the next set is identical
  const items = [...cards, ...cards];

  // duration = distance / speed
  const duration = singleWidth / speed;

  return (
    <div className="w-full mx-auto justify-center items-center bg-white overflow-hidden py-16">
      <h2 className="text-xl font-normal mb-12 text-center text-gray-800">
        Loved by Students From
      </h2>
      <div className="relative">
        <motion.div
          ref={containerRef}
          className="flex items-center"
          animate={{ x: [-singleWidth, 0] }}
          transition={{
            repeat: Infinity,
            duration,
            ease: "linear",
          }}
        >
          {items.map((card, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 bg-gradient-to-br from-blue-500/25 to-emerald-500/15 backdrop-blur-none rounded-3xl m-2 p-4 w-32 h-40 flex flex-col items-center border border-blue-400/25 shadow-sm shadow-emerald-400/20 hover:shadow-2xl hover:shadow-blue-400/35 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-blue-400/30 hover:to-emerald-400/20"
            >
              <div className="relative">
                <img
                  src={card.image}
                  alt={card.alt}
                  className="w-20 h-20 rounded-full border-2 border-gradient-to-r from-cyan-400 to-blue-500 object-cover mb-2 shadow-md shadow-cyan-500/25"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100x100/6B7280/FFFFFF?text=Error";
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-transparent pointer-events-none"></div>
              </div>
              <p className="text-sm font-thin text-gray-900 text-center leading-tight">
                {card.title}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AutoCarouselSlider;
