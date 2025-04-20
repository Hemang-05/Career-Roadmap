"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";

interface USDPaymentPlanProps {
  clerk_id: string;
  onSuccess?: (plan: "month" | "quarter" | "year") => void;
  onClose?: () => void;
  message?: string;
}

export default function USDPaymentPlan({
  clerk_id,
  onSuccess,
  onClose,
  message,
}: USDPaymentPlanProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cunt = "US";

  const handlePayment = async (plan: "month" | "quarter" | "year") => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route to initiate USD subscription using clerk_id
      const response = await fetch("/api/initiate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id, plan, cunt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate subscription");
      }

      // Optionally update local subscription details immediately
      const now = new Date();
      let endDate = new Date();
      if (plan === "month") {
        endDate.setMonth(now.getMonth() + 1);
      } else if (plan === "quarter") {
        endDate.setMonth(now.getMonth() + 3);
      } else if (plan === "year") {
        endDate.setFullYear(now.getFullYear() + 1);
      }

      // Update the user record in Supabase for local tracking
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_plan: plan,
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
        })
        .eq("clerk_id", clerk_id);
      
      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw new Error("Failed to update subscription.");
      }

      // Redirect to the payment link provided by your payment service
      window.location.href = data.subscriptionUrl;
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Month",
      totalPrice: "$19.99",
      duration: "30 days",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1744970242/monthly_qcfqdl.png"
    },
    {
      name: "Quarter",
      totalPrice: "$49.99",
      perMonth: "$16.66",
      duration: "90 days",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1744970243/quarterly_hq7je1.png"
    },
    {
      name: "Year",
      totalPrice: "$149.99",
      perMonth: "$12.49",
      duration: "365 days",
      imageUrl: "https://res.cloudinary.com/ditn9req1/image/upload/v1744970248/yearly_ipoftu.png"
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
      <div className="relative bg-white rounded-lg p-3 sm:p-6 md:p-8 shadow-xl w-full max-w-3xl overflow-y-auto max-h-[95vh]">
        <h2 className="text-base sm:text-xl md:text-2xl text-black font-bold mb-2 sm:mb-4 text-center">
          {message ||
            "Your subscription has expired. Please choose a payment plan."}
        </h2>
        {error && <p className="text-red-600 text-center mb-2 sm:mb-4 text-sm sm:text-base">{error}</p>}
        
        <div className="w-full overflow-hidden">
          <div className="flex flex-row justify-around space-x-1 sm:space-x-2 md:space-x-4">
            {plans.map((plan) => (
              <button
                key={plan.name}
                onClick={() =>
                  handlePayment(
                    plan.name.toLowerCase() as
                      | "month"
                      | "quarter"
                      | "year"
                  )
                }
                disabled={loading}
                className="flex flex-col text-black items-center relative w-[100px] sm:w-[150px] md:w-[220px] h-[220px] sm:h-[250px] md:h-[350px] rounded-lg sm:rounded-[20px] overflow-hidden shadow-md sm:shadow-[12px_12px_0px_rgba(0,0,0,0.1)] bg-white cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {plan.name === "Quarter" && (
                  <span className="absolute top-0 left-0 md:left-12 bg-[#FF6500] text-white text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                    Recommended
                  </span>
                )}
                <img
                  src={plan.imageUrl}
                  alt={`${plan.name} Plan Illustration`}
                  className="w-full h-[60%] object-cover"
                />
                <div className="w-full h-[40%] p-1 sm:p-2 md:p-4 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1">
                    {plan.name}ly Plan
                  </h3>
                  {plan.perMonth ? (
                    <>
                      <p className="text-xs sm:text-base md:text-lg font-bold text-[#FF6500]">
                        {plan.totalPrice}
                      </p>
                      <p className="text-[8px] sm:text-xs md:text-sm text-gray-600">
                        (per month: {plan.perMonth})
                      </p>
                    </>
                  ) : (
                    <p className="text-xs sm:text-base md:text-lg font-bold text-[#FF6500]">
                      {plan.totalPrice}
                    </p>
                  )}
                  <p className="text-[8px] sm:text-xs md:text-sm text-gray-600 mt-0.5 sm:mt-1 md:mt-2">
                    Access all features for {plan.duration}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-2 sm:mt-4 md:mt-6 text-center">
          <button
            onClick={() => (onClose ? onClose() : router.back())}
            className="text-gray-600 hover:underline text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}