"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import PlanCard from "./ui/PlanCard";
import DiscountCard from "@/components/ui/discountCard";

// Define the Razorpay window object type to avoid TypeScript errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentPlanProps {
  clerk_id: string;
  onSuccess?: (plan: "monthly" | "quarterly" | "yearly") => void;
  onClose?: () => void;
  message?: string;
}

export default function PaymentPlan({
  clerk_id,
  onSuccess,
  onClose,
  message,
}: PaymentPlanProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (plan: "monthly" | "quarterly" | "yearly") => {
    setLoading(true);
    setError(null);

    // Check if Razorpay script is loaded
    if (typeof window === "undefined" || !window.Razorpay) {
      setError(
        "Razorpay SDK not loaded. Please check your internet connection and try again."
      );
      setLoading(false);
      return;
    }

    try {
      // 1. Call backend endpoint to initiate a Razorpay subscription
      //    (this endpoint returns { subscription_id, key_id })
      const response = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id, plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      const { subscription_id, key_id } = data;

      // 2. Configure and open Razorpay Checkout
      const options = {
        key: key_id,
        subscription_id: subscription_id,
        name: "Your App Name",
        description: `Subscription - ${
          plan.charAt(0).toUpperCase() + plan.slice(1)
        } Plan`,
        image: "https://barely-simple-asp.ngrok-free.app/lo.png", // Optional: Add your logo URL
        handler: function (response: any) {
          // This handler is called on successful payment
          console.log("Payment successful:", response);
          // The webhook is the source of truth, but you can redirect here for a better UX
          if (onSuccess) {
            onSuccess(plan);
          } else {
            router.push("/dashboard?status=success");
          }
        },
        prefill: {
          // You can prefill user data if you have it
          // email: user.email,
          // contact: user.phone
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed.");
            setLoading(false); // Re-enable buttons if user closes the modal
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Monthly",
      price: 99,
      symbol: "₹",
      period: "month",
      features: ["30 days access", "All features included"],
      backgroundImage:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625002/ii_a723uf.jpg",
    },
    {
      name: "Quarterly",
      price: 269,
      originalPrice: 299,
      symbol: "₹",
      period: "3 months",
      features: ["90 days access", "All features included", "Save ₹28"],
      backgroundImage:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625001/14_ctro6r.jpg",
    },
    {
      name: "Yearly",
      price: 999,
      originalPrice: 1199,
      symbol: "₹",
      period: "year",
      features: [
        "365 days access",
        "All features included",
        "Best value - Save ₹189",
      ],
      backgroundImage:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1753625006/114_xdgi0h.jpg",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-start sm:items-center justify-center">
      <div className="relative bg-white h-full p-3 sm:p-4 md:p-6 lg:mt-40 shadow-xl w-full sm:max-w-full overflow-y-auto sm:max-h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <h2 className="text-sm sm:text-base md:text-xl text-black font-thin m-12 sm:m-2 text-center">
          {message ||
            "Your subscription has expired. Please choose a payment plan."}
        </h2>
        {error && (
          <p className="text-red-600 text-center mb-3 text-xs sm:text-sm">
            {error}
          </p>
        )}

        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                onClick={() =>
                  !loading &&
                  handlePayment(
                    plan.name.toLowerCase() as
                      | "monthly"
                      | "quarterly"
                      | "yearly"
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

        <div className="mt-3 text-center pb-4 sm:pb-0">
          <button
            onClick={() => (onClose ? onClose() : router.push("/dashboard"))}
            className="text-gray-500 hover:text-red-600 text-xs sm:text-sm transition-colors"
          >
            Cancel
          </button>
        </div>

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
