import React, { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  label: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip = ({ 
  children, 
  label, 
  position = 'top', 
  delay = 200,
  className = ''
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [tooltipWidth, setTooltipWidth] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate optimal width based on container and viewport
  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Set width based on available space
      const availableSpace = Math.min(
        viewportWidth - 40, // Keep 20px padding on each side
        320 // Maximum width in pixels
      );
      
      setTooltipWidth(availableSpace);
    }
  }, [isVisible]);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Position styles with adaptive width
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 transform -translate-x-2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform translate-x-2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex ${className}`} 
      onMouseEnter={showTooltip} 
      onMouseLeave={hideTooltip}
      onTouchStart={showTooltip}
      onTouchEnd={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]}`}
          style={{ 
            width: tooltipWidth ? `${tooltipWidth}px` : 'auto',
            maxWidth: '90vw' // Prevent overflow on very small screens
          }}
        >
          <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg">
            <div className="inline-block text-left">{label}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;