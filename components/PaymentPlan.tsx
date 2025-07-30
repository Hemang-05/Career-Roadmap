// // //components/PaymentPlan.tsx

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/utils/supabase/supabaseClient";
// import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

// interface PaymentPlanProps {
//   clerk_id: string;
//   onSuccess?: (plan: "monthly" | "quarterly" | "yearly") => void;
//   onClose?: () => void;
//   message?: string;
// }

// export default function PaymentPlan({
//   clerk_id,
//   onSuccess,
//   onClose,
//   message,
// }: PaymentPlanProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // discount-related state
//   const [discountCode, setDiscountCode] = useState("");
//   const [isValidating, setIsValidating] = useState(false);
//   const [isValid, setIsValid] = useState<boolean | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   // 1️⃣ Validate button handler
//   async function handleValidate() {
//     if (!discountCode.trim()) return;
//     setIsValidating(true);
//     setErrorMsg(null);
//     setIsValid(null);

//     try {
//       const res = await fetch("/api/validate-discount", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ discountCode }),
//       });
//       const json = await res.json();
//       if (!res.ok || !json.valid) {
//         throw new Error(json.error || "Invalid code");
//       }
//       setIsValid(true);
//     } catch (err: any) {
//       setIsValid(false);
//       setErrorMsg(err.message);
//     } finally {
//       setIsValidating(false);
//     }
//   }

//   // 2️⃣ Payment handler
//   const handlePayment = async (plan: "monthly" | "quarterly" | "yearly") => {
//     setLoading(true);
//     setError(null);

//     try {
//       // build payload
//       const payload: any = { clerk_id, plan };
//       if (isValid) payload.discountCode = discountCode;

//       // 🔄 call new one-time payment endpoint
//       const response = await fetch("/api/initiate-payment", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || "Failed to initiate payment");
//       }

//       // 🔗 redirect straight to the Dodo checkout link
//       window.location.href = data.paymentLink;
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   const plans = [
//     {
//       name: "Monthly",
//       totalPrice: "99 ₹",
//       duration: "30 days",
//       imageUrl:
//         "https://res.cloudinary.com/ditn9req1/image/upload/v1744970242/monthly_qcfqdl.png",
//     },
//     {
//       name: "Quarterly",
//       totalPrice: "269 ₹",
//       perMonth: "90 ₹",
//       duration: "90 days",
//       imageUrl:
//         "https://res.cloudinary.com/ditn9req1/image/upload/v1744970243/quarterly_hq7je1.png",
//     },
//     {
//       name: "Yearly",
//       totalPrice: "999 ₹",
//       perMonth: "83 ₹",
//       duration: "365 days",
//       imageUrl:
//         "https://res.cloudinary.com/ditn9req1/image/upload/v1744970248/yearly_ipoftu.png",
//     },
//   ];

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-2 sm:p-4">
//       <div className="relative bg-white rounded-3xl p-3 sm:p-6 md:p-8 shadow-xl w-full max-w-3xl overflow-y-auto max-h-[95vh]">
//         <h2 className="text-base sm:text-xl md:text-2xl text-black font-thin mb-2 sm:mb-4 text-center">
//           {message ||
//             "Your subscription has expired. Please choose a payment plan."}
//         </h2>
//         {error && (
//           <p className="text-red-600 text-center mb-2 sm:mb-4 text-sm sm:text-base">
//             {error}
//           </p>
//         )}

//         <div className="w-full">
//           <div className="flex flex-row justify-center gap-4 sm:gap-6 md:gap-8">
//             {plans.map((plan) => (
//               <button
//                 key={plan.name}
//                 onClick={() =>
//                   handlePayment(
//                     plan.name.toLowerCase() as
//                       | "monthly"
//                       | "quarterly"
//                       | "yearly"
//                   )
//                 }
//                 disabled={loading}
//                 className="group relative w-[140px] sm:w-[180px] md:w-[220px] h-[140px] sm:h-[180px] md:h-[220px] rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
//               >
//                 <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6">
//                   <img
//                     src={plan.imageUrl}
//                     alt={`${plan.name} Plan Illustration`}
//                     className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover mb-2 sm:mb-3"
//                   />

//                   <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
//                     {plan.name}
//                   </h3>

//                   <div className="text-center">
//                     <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#FF6500] mb-1">
//                       {plan.totalPrice}
//                     </p>
//                     {plan.perMonth && (
//                       <p className="text-xs sm:text-sm text-gray-500">
//                         {plan.perMonth}/mo
//                       </p>
//                     )}
//                   </div>

//                   <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3 text-center leading-tight">
//                     {plan.duration} access
//                   </p>
//                 </div>

//                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* 1️⃣ Coupon + Check button */}
//         <div className="flex items-center justify-center text-green-800 rounded-md  m-4 space-x-2">
//           <input
//             type="text"
//             value={discountCode}
//             onChange={(e) => {
//               setDiscountCode(e.target.value);
//               setIsValid(null);
//               setErrorMsg(null);
//             }}
//             placeholder="Enter discount code"
//             className="border p-2 text-green-800 rounded-2xl flex-1 max-w-xs"
//           />
//           <button
//             onClick={handleValidate}
//             disabled={isValidating}
//             className="p-2 px-4 rounded-2xl text-green-600 bg-gray-200 hover:bg-gray-300 transition"
//           >
//             {isValidating ? (
//               <FaSpinner className="w-5 h-5 animate-spin" />
//             ) : isValid === true ? (
//               <FaCheck className="w-5 h-5 text-green-600" />
//             ) : isValid === false ? (
//               <FaTimes className="w-5 h-5 text-red-600" />
//             ) : (
//               "Apply"
//             )}
//           </button>
//         </div>
//         {errorMsg && (
//           <p className="text-red-600 text-sm text-center">{errorMsg}</p>
//         )}

//         <div className="mt-2 sm:mt-2 md:mt-6 text-center">
//           <button
//             onClick={() => (onClose ? onClose() : router.push("/dashboard"))}
//             className="text-gray-600 hover:text-red-800 text-sm sm:text-base"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import PlanCard from "./ui/PlanCard";
import DiscountCard from '@/components/ui/discountCard';

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
  const handlePayment = async (plan: "monthly" | "quarterly" | "yearly") => {
    setLoading(true);
    setError(null);

    try {
      // build payload
      const payload: any = { clerk_id, plan };
      if (isValid) payload.discountCode = discountCode;

      // 🔄 call new one-time payment endpoint
      const response = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      // 🔗 redirect straight to the Dodo checkout link
      window.location.href = data.paymentLink;
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
      duration: "30 days",
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
      duration: "90 days",
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
      duration: "365 days",
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
