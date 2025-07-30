//components/DiscountGenerator.tsx

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Check, Copy } from "lucide-react";

interface DiscountGeneratorProps {
  email: string;
}

export default function DiscountGenerator({ email }: DiscountGeneratorProps) {
  const { user } = useUser();
  const [code, setCode] = useState<string | null>(null);
  const [usage, setUsage] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [checkedExisting, setCheckedExisting] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundActivated, setRefundActivated] = useState(false);
  const [refundStatus, setRefundStatus] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRefundMessage, setShowRefundMessage] = useState(false);

  // Check refund status from database
  const checkRefundStatus = async () => {
    if (!user) return;

    try {
      // No need to join with user_id since user_discounts table doesn't have that column
      const { data: discountData, error: discountError } = await supabase
        .from("user_discounts")
        .select("refund_active")
        .eq("email", email)
        .single();

      if (!discountError && discountData) {
        setRefundStatus(discountData.refund_active);
      }
    } catch (err) {
      console.error("Error checking refund status:", err);
    }
  };

  // On mount: try to fetch any existing coupon and check refund status
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch(
          `/api/generate-discount?email=${encodeURIComponent(email)}`
        );
        if (res.status === 204) {
          return;
        }
        const data = await res.json();
        setCode(data.code);
        setUsage(data.times_used);
      } catch (err) {
        console.error("Error fetching existing coupon:", err);
      } finally {
        setCheckedExisting(true);
      }
    };

    fetchExisting();
    checkRefundStatus();
  }, [email, user]);

  // On button click: create or return existing coupon
  const fetchOrCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setCode(data.code);
      setUsage(data.times_used);
    } catch (err) {
      console.error("Error creating coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!user) return;

    setRefundLoading(true);
    try {
      const res = await fetch("/api/send-refund-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        // Update refund status to false in database
        await supabase
          .from("user_discounts")
          .update({ refund_active: false })
          .eq("email", email);

        setRefundActivated(true);
        setRefundStatus(false);
        setShowRefundMessage(true);
        setTimeout(() => {
          setShowRefundMessage(false);
        }, 3000);
      } else {
        alert("Failed to send refund request. Please try again.");
      }
    } catch (error) {
      console.error("Error sending refund request:", error);
      alert("Failed to send refund request. Please try again.");
    } finally {
      setRefundLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!checkedExisting) {
    return <p>Checking for existing coupon…</p>;
  }

  return (
    <div className="space-y-4">
      {!code ? (
        <button
          onClick={fetchOrCreate}
          disabled={loading}
          className="bg-green-300 backdrop-blur-md text-gray-700 py-4 px-6 rounded-full border border-gray-200 transition-all duration-300 font-light hover:shadow-sm hover:shadow-green-700/60 hover:-translate-y-0.5 hover:bg-green/25"
        >
          {loading ? "Generating…" : "Generate Coupon"}
        </button>
      ) : (
        <div className="space-y-2 text-black">
          <div className="relative inline-flex flex-col w-fit bg-slate-100 text-gray-900 font-thin text-sm rounded-3xl p-4 shadow-sm">
            <p className="mb-2 font-semibold text-gray-900">Code:</p>
            <pre className="whitespace-pre-wrap break-words pr-10">{code}</pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-300 hover:bg-slate-400 transition"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="font-thin font-sm">Used {usage} of 3 times</p>
          {usage >= 3 && (
            <>
              {refundStatus === true ? (
                <p className="text-green-600 font-semibold">Refunded</p>
              ) : (
                <button
                  onClick={handleRefund}
                  disabled={refundLoading || refundActivated}
                  className={`bg-gray-500/5 backdrop-blur-md text-gray-700 py-4 px-6 rounded-full border border-gray-200 transition-all duration-300 font-light hover:shadow-sm hover:shadow-gray-700/60 hover:-translate-y-0.5 hover:bg-white/25 ${
                    refundActivated
                      ? "bg-green-200"
                      : "bg-blue-200 hover:bg-blue-300"
                  } ${
                    refundLoading || refundActivated
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {refundLoading
                    ? "Sending..."
                    : refundActivated
                    ? "Activated"
                    : "Activate Refund"}
                </button>
              )}
            </>
          )}
          {showRefundMessage && (
            <p className="mt-2 text-green-600 text-sm font-medium transition-opacity">
              Refund request has been sent successfully!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
