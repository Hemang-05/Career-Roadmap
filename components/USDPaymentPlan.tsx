"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";

interface USDPaymentPlanProps {
  clerk_id: string;
  onSuccess?: (plan: "monthly" | "quarterly" | "yearly") => void;
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

  const handlePayment = async (plan: "monthly" | "quarterly" | "yearly") => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route to initiate USD subscription using clerk_id
      const response = await fetch("/api/initiate-usd-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id, plan }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate subscription");
      }

      // Optionally update local subscription details immediately
      const now = new Date();
      let endDate = new Date();
      if (plan === "monthly") {
        endDate.setMonth(now.getMonth() + 1);
      } else if (plan === "quarterly") {
        endDate.setMonth(now.getMonth() + 3);
      } else if (plan === "yearly") {
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
      name: "Monthly",
      totalPrice: "$5.99",
      duration: "30 days",
    },
    {
      name: "Quarterly",
      totalPrice: "$14.99",
      perMonth: "$5.00",
      duration: "90 days",
    },
    {
      name: "Yearly",
      totalPrice: "$59.99",
      perMonth: "$5.00",
      duration: "365 days",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg p-8 shadow-xl max-w-3xl w-full overflow-hidden">
        <h2 className="text-2xl text-black font-bold mb-4 text-center">
          {message ||
            "Your subscription has expired. Please choose a payment plan."}
        </h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <div className="relative bg-white rounded-lg p-8 max-w-3xl w-full overflow-hidden">
          <div className="flex justify-around space-x-4">
            {plans.map((plan) => (
              <button
                key={plan.name}
                onClick={() =>
                  handlePayment(
                    plan.name.toLowerCase() as
                      | "monthly"
                      | "quarterly"
                      | "yearly"
                  )
                }
                disabled={loading}
                className="flex flex-col text-black items-center relative w-[220px] h-[350px] rounded-[20px] overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,0.1)] bg-white cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {plan.name === "Quarterly" && (
                  <span className="absolute top-0 left-12 bg-[#FF6500] text-white text-xs font-bold px-2 py-1 rounded">
                    Recommended
                  </span>
                )}
                <img
                  src={`${plan.name.toLowerCase()}.png`}
                  alt={`${plan.name} Plan Illustration`}
                  className="w-full h-[60%] object-cover"
                />
                <div className="w-full h-[40%] p-4 flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-semibold mb-1">
                    {plan.name} Plan
                  </h3>
                  {plan.perMonth ? (
                    <>
                      <p className="text-lg font-bold text-[#FF6500]">
                        {plan.totalPrice}
                      </p>
                      <p className="text-sm text-gray-600">
                        (per month: {plan.perMonth})
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-bold text-[#FF6500]">
                      {plan.totalPrice}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Access all features for {plan.duration}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => (onClose ? onClose() : router.back())}
            className="text-gray-600 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}