"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import PlanCard from "./ui/PlanCard";
import DiscountCard from '@/components/ui/discountCard';

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

  // discount-related state
  const [discountCode, setDiscountCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1️⃣ Validate button handler
  async function handleValidate() {
    if (!discountCode.trim()) return;
    setIsValidating(true);
    setErrorMsg(null);
    setIsValid(null);

    try {
      const res = await fetch("/api/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) {
        throw new Error(json.error || "Invalid code");
      }
      setIsValid(true);
    } catch (err: any) {
      setIsValid(false);
      setErrorMsg(err.message);
    } finally {
      setIsValidating(false);
    }
  }

  // 2️⃣ Payment handler
  const handlePayment = async (plan: "month" | "quarter" | "year") => {
    setLoading(true);
    setError(null);

    try {
      // build payload
      const payload: any = { clerk_id, plan, cunt };
      if (isValid) payload.discountCode = discountCode;

      const response = await fetch("/api/initiate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate subscription");
      }

      // update your local Supabase record
      const now = new Date();
      let endDate = new Date();
      if (plan === "month") endDate.setMonth(now.getMonth() + 1);
      if (plan === "quarter") endDate.setMonth(now.getMonth() + 3);
      if (plan === "year") endDate.setFullYear(now.getFullYear() + 1);

      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_plan: plan,
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
        })
        .eq("clerk_id", clerk_id);
      if (updateError) throw updateError;

      // redirect to Dodo checkout
      window.location.href = data.subscriptionUrl;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Monthly",
      price: 5,
      symbol: "$",
      period: "month",
      duration: "30 days",
      features: ["30 days access", "All features included"],
      backgroundImage:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625002/ii_a723uf.jpg",
    },
    {
      name: "Quarterly",
      price: 13,
      originalPrice: 15,
      symbol: "$",
      period: "3 months",
      duration: "90 days",
      features: ["90 days access", "All features included", "Save $2"],
      backgroundImage:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625001/14_ctro6r.jpg",
    },
    {
      name: "Yearly",
      price: 49,
      originalPrice: 59,
      symbol: "$",
      period: "year",
      duration: "365 days",
      features: [
        "365 days access",
        "All features included",
        "Best value - Save $10",
      ],
      backgroundImage:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625006/114_xdgi0h.jpg",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-start sm:items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="relative bg-white h-full p-3 sm:p-4 md:p-6 shadow-xl w-full sm:max-w-full overflow-y-auto sm:max-h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <h2 className="text-sm sm:text-base md:text-xl text-black font-thin m-3 sm:m-2 text-center">
          {message ||
            "Your subscription has expired. Please choose a payment plan."}
        </h2>
        {error && (
          <p className="text-red-600 text-center mb-3 text-xs sm:text-sm">
            {error}
          </p>
        )}

        {/* Get 80% Refund */}
        <DiscountCard className="mb-4 mt-4 mx-auto" />

        {/* Coupon + Check button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 px-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setIsValid(null);
              setErrorMsg(null);
            }}
            placeholder="Enter discount code"
            className="w-full sm:w-auto border border-gray-300 m-2 p-2 text-green-800 rounded-xl text-sm max-w-xs focus:outline-none focus:ring-1"
          />
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="w-1/2 sm:w-auto px-4 py-2 rounded-xl text-green-600 bg-gray-100 hover:bg-gray-200 transition text-sm font-medium min-w-[80px]"
          >
            {isValidating ? (
              <FaSpinner className="w-4 h-4 animate-spin mx-auto" />
            ) : isValid === true ? (
              <FaCheck className="w-4 h-4 text-green-600 mx-auto" />
            ) : isValid === false ? (
              <FaTimes className="w-4 h-4 text-red-600 mx-auto" />
            ) : (
              "Apply"
            )}
          </button>
        </div>
        {errorMsg && (
          <p className="text-red-600 text-xs sm:text-sm text-center mt-2">
            {errorMsg}
          </p>
        )}

        {/* price cards */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                onClick={() =>
                  handlePayment(
                    plan.name.toLowerCase() as
                      | "month"
                      | "quarter"
                      | "year"
                  )
                }
                className={`cursor-pointer transition-all h-full duration-300 ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-102 sm:hover:scale-105"
                }`}
              >
                <div className="h-full">
                  <PlanCard
                    title={plan.name}
                    price={plan.price}
                    originalPrice={plan.originalPrice}
                    symbol={plan.symbol}
                    period={plan.period}
                    features={plan.features}
                    backgroundImage={plan.backgroundImage}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        

        <div className="mt-4 text-center pb-4 sm:pb-0">
          <button
            onClick={() => (onClose ? onClose() : router.push("/dashboard"))}
            className="text-gray-500 hover:text-red-600 text-xs sm:text-sm transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 sm:rounded-2xl flex items-center justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <FaSpinner className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm sm:text-base font-medium text-gray-700 text-center">
                Processing payment...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
