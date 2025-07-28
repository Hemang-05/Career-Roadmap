"use client";

import { useEffect, useState } from "react";
import PlanCard from "./ui/PlanCard";

interface Pricing {
  symbol: string;
  monthly: number;
  quarterly: number;
  yearly: number;
  quarterlyStrike: number;
  yearlyStrike: number;
}

// Pre-define price sets
const INDIA_PRICING: Pricing = {
  symbol: "₹",
  monthly: 99,
  quarterly: 269,
  yearly: 999,
  quarterlyStrike: 299,
  yearlyStrike: 1199,
};

const GLOBAL_PRICING: Pricing = {
  symbol: "$",
  monthly: 5,
  quarterly: 13,
  yearly: 49,
  quarterlyStrike: 15,
  yearlyStrike: 59,
};

export default function Plans() {
  const [pricing, setPricing] = useState<Pricing>(GLOBAL_PRICING);

  useEffect(() => {
    // fetch geo IP info client-side
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code === "IN") {
          setPricing(INDIA_PRICING);
        }
      })
      .catch((err) => {
        console.error("Geo lookup failed", err);
      });
  }, []);

  const commonFeatures = [
    "Full access to all features",
    "24/7 customer support",
  ];

  // Background images array for the three cards
  const backgroundImages = [
    "https://res.cloudinary.com/ditn9req1/image/upload/v1753625002/ii_a723uf.jpg",
    "https://res.cloudinary.com/ditn9req1/image/upload/v1753625001/14_ctro6r.jpg",
    "https://res.cloudinary.com/ditn9req1/image/upload/v1753625006/114_xdgi0h.jpg",
  ];

  const plans = [
    {
      title: "Monthly",
      price: pricing.monthly,
      symbol: pricing.symbol,
      period: "month",
      features: commonFeatures,
    },
    {
      title: "Quarterly",
      price: pricing.quarterly,
      originalPrice: pricing.quarterlyStrike,
      symbol: pricing.symbol,
      period: "3 months",
      features: [...commonFeatures, "Better value for short-term"],
    },
    {
      title: "Yearly",
      price: pricing.yearly,
      originalPrice: pricing.yearlyStrike,
      symbol: pricing.symbol,
      period: "year",
      isPopular: true,
      features: [...commonFeatures, "Maximum savings", "Most popular choice"],
    },
  ];

  return (
    <section id="pricing" className="container mx-auto py-24 px-4">
      {/* Header */}
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          what's the price you'd pay for your dream?
        </h2>
        <p className="text-gray-900 text-base max-w-3xl mx-auto leading-relaxed">
          Achieve your goals for the price of a one-off fast-food treat. Be
          smart, and use your fast-food money to invest in your future.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <PlanCard
            key={index}
            title={plan.title}
            price={plan.price}
            originalPrice={plan.originalPrice}
            symbol={plan.symbol}
            period={plan.period}
            features={plan.features}
            backgroundImage={backgroundImages[index]}
          />
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center mt-12">
        <p className="text-gray-900 text-[0.675rem]">
          Cancel anytime. We don't want you to, that's why it's so small.
        </p>
      </div>
    </section>
  );
}
