"use client";

interface PlanCardProps {
  title: string;
  price: number;
  originalPrice?: number;
  symbol: string;
  period: string;
  features: string[];
  backgroundImage: string;
}

export default function PlanCard({
  title,
  price,
  originalPrice,
  symbol,
  period,
  features,
  backgroundImage,
}: PlanCardProps) {
  return (
    <div
      className={`
        relative
        rounded-[3rem]
        border-2
        shadow-lg
        h-full
        transition-all duration-300
        hover:shadow-2xl hover:-translate-y-2
      `}
    >
      <div
        className="absolute inset-0 rounded-[3rem] overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.5),
              rgba(0,0,0,0.3)
            ),
            url(${backgroundImage})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* ========== Content ========== */}
      <div className="relative p-8 text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">
              {symbol}
              {price}
            </span>
            <span className="text-gray-200 text-lg">/{period}</span>
          </div>
          {originalPrice && (
            <div className="mt-2">
              <span className="line-through text-gray-300 text-lg">
                {symbol}
                {originalPrice}
              </span>
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                Save{" "}
                {Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <span className="text-gray-100 font-normal">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
