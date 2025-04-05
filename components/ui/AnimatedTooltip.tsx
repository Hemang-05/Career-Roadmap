'use client'
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import UserAnalyticsDialog from "@/components/UserAnalyticsDialog";

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<typeof items[0] | null>(null);

  const handleClick = (user: typeof items[0]) => {
    setSelectedUser(user);
  };

  const closeDialog = () => {
    setSelectedUser(null);
  };

  return (
    <div className="flex items-center justify-left -space-x-3 sm:-space-x-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleClick(item)}
        >
          {/* Tooltip for desktop */}
          <div className="hidden md:block">
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 
                  bg-black text-white px-3 py-2 rounded-md 
                  flex flex-col items-center z-50 shadow-lg cursor-pointer"
              >
                <div className="font-bold text-sm">Click to see analytics</div>
              </motion.div>
            )}
          </div>
          
          {/* Tooltip for mobile - always visible */}
          <div className="md:hidden absolute -top-12 left-1/2 -translate-x-1/2 
            bg-black text-white px-3 py-2 rounded-md 
            flex flex-col items-center z-50 shadow-lg opacity-0 group-hover:opacity-100 
            transition-opacity duration-300">
            <div className="font-bold text-sm">Click to see analytics</div>
          </div>
          
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1, zIndex: 10 }}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
              rounded-full border-2 border-white 
              transition-all duration-300 cursor-pointer
              ${hoveredIndex === index ? 'z-20' : 'z-10'}
            `}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={56}
              height={56}
              className="rounded-full object-cover w-full h-full"
            />
          </motion.div>
        </div>
      ))}

      {/* Render the dialog when a user is selected */}
      {selectedUser && (
        <UserAnalyticsDialog user={selectedUser} onClose={closeDialog} />
      )}
    </div>
  );
};

export default AnimatedTooltip;