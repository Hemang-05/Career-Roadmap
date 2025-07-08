// File: components/ui/Tooltip.tsx
import React, { ReactNode, useState, useRef, useEffect } from "react";

interface TooltipProps {
  children: ReactNode;
  label: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

const Tooltip = ({
  children,
  label,
  position = "top",
  delay = 200,
  className = "",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [tooltipWidth, setTooltipWidth] = useState<number>(320);
  const hiddenTooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate optimal width based on text content
  useEffect(() => {
    const calculateWidth = () => {
      if (hiddenTooltipRef.current) {
        const textWidth = hiddenTooltipRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;

        // Use actual text width or constrain to viewport/max width
        const optimalWidth = Math.min(
          Math.max(textWidth, 120), // Minimum 120px
          Math.min(viewportWidth - 40, 320) // Max 320px or viewport - 40px
        );

        setTooltipWidth(optimalWidth);
      }
    };

    calculateWidth();
    window.addEventListener("resize", calculateWidth);
    return () => window.removeEventListener("resize", calculateWidth);
  }, [label]); // Recalculate when label changes

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

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2",
    left: "right-full top-1/2 transform -translate-x-2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform translate-x-2 -translate-y-1/2 ml-2",
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

      {/* Hidden tooltip for measuring text width */}
      <div
        ref={hiddenTooltipRef}
        className="absolute invisible bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg whitespace-nowrap"
        style={{ top: "-9999px", left: "-9999px" }}
      >
        {label}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]}`}
          style={{
            width: `${tooltipWidth}px`,
            maxWidth: "90vw",
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
