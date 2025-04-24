"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

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
      name: "Month",
      totalPrice: "$19.99",
      duration: "30 days",
      imageUrl:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744970242/monthly_qcfqdl.png",
    },
    {
      name: "Quarter",
      totalPrice: "$49.99",
      perMonth: "$16.66",
      duration: "90 days",
      imageUrl:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744970243/quarterly_hq7je1.png",
    },
    {
      name: "Year",
      totalPrice: "$149.99",
      perMonth: "$12.49",
      duration: "365 days",
      imageUrl:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744970248/yearly_ipoftu.png",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
      <div className="relative bg-white rounded-lg p-3 sm:p-6 md:p-8 shadow-xl w-full max-w-3xl overflow-y-auto max-h-[95vh]">
        <h2 className="text-base sm:text-xl md:text-2xl text-black font-bold mb-2 sm:mb-4 text-center">
          {message ||
            "Your subscription has expired. Please choose a payment plan."}
        </h2>
        {error && (
          <p className="text-red-600 text-center mb-2 sm:mb-4 text-sm sm:text-base">
            {error}
          </p>
        )}

        <div className="w-full border- overflow-hidden">
          <div className="flex flex-row justify-around space-x-1 sm:space-x-2 md:space-x-4">
            {plans.map((plan) => (
              <button
                key={plan.name}
                onClick={() =>
                  handlePayment(
                    plan.name.toLowerCase() as "month" | "quarter" | "year"
                  )
                }
                disabled={loading}
                className="flex flex-col text-black items-center relative w-[100px] sm:w-[150px] md:w-[220px] h-[220px] sm:h-[250px] md:h-[400px] rounded-lg sm:rounded-[20px] overflow-hidden shadow-md sm:shadow-[12px_12px_0px_rgba(0,0,0,0.1)] bg-white cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {plan.name === "Quarterly" && (
                  <span className="absolute top-0 left-4 md:left-16 bg-[#FF6500] text-white text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                    Recommended
                  </span>
                )}
                <img
                  src={plan.imageUrl}
                  alt={`${plan.name} Plan Illustration`}
                  className="w-full h-[100%] object-cover"
                />
                <div className="w-full h-[40%] p-1 sm:p-2 md:p-4 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1">
                    {plan.name} Plan
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

        {/* 1️⃣ Coupon + Check button */}
        <div className="flex items-center justify-center text-green-800 rounded-md  m-4 space-x-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setIsValid(null);
              setErrorMsg(null);
            }}
            placeholder="Enter discount code"
            className="border p-2 text-green-800 rounded-2xl flex-1 max-w-xs"
          />
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="p-2 px-4 rounded-2xl text-green-600 bg-gray-200 hover:bg-gray-300 transition"
          >
            {isValidating ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : isValid === true ? (
              <FaCheck className="w-5 h-5 text-green-600" />
            ) : isValid === false ? (
              <FaTimes className="w-5 h-5 text-red-600" />
            ) : (
              "Apply"
            )}
          </button>
        </div>
        {errorMsg && (
          <p className="text-red-600 text-sm text-center">{errorMsg}</p>
        )}

        <div className="mt-2 sm:mt-2 md:mt-6 text-center">
          <button
            onClick={() => (onClose ? onClose() : router.back())}
            className="text-gray-600 hover:text-red-800 text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
