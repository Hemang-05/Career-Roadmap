"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip as ReTooltip,
  TooltipProps,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/utils/supabase/supabaseClient";

// Add this import for useLayoutEffect
import { useLayoutEffect } from "react";

interface UserGrowthPoint {
  date: string;
  count: number;
}

interface MetricCounts {
  total: number;
  monthly?: number;
  quarterly?: number;
  yearly?: number;
  school?: number;
  college?: number;
}

// ─── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({
  value,
  error,
  onChange,
  onSubmit,
}: {
  value: string;
  error: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Enter Admin Password
        </h2>
        <input
          type="password"
          value={value}
          onChange={onChange}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          className="w-full p-2 border text-black border-gray-300 rounded mb-2"
          placeholder="Password"
          autoFocus
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          onClick={onSubmit}
          className="w-full bg-orange-500 text-white py-2 rounded hover:opacity-90"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

// Custom tooltip component with proper dark styling
const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded shadow-lg border-none">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserMetricsPage() {
  // ─ Footer Hiding Logic ──────────────────
  useLayoutEffect(() => {
    // Add a custom class to the document body to identify this page
    document.body.classList.add('user-metrics-page');
    
    // Create a style element to hide the footer
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Hide footer when on the metrics page */
      body.user-metrics-page footer {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup function
    return () => {
      document.body.classList.remove('user-metrics-page');
      document.head.removeChild(styleElement);
    };
  }, []);

  // ─ Password Gate States ──────────────────
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handlePasswordSubmit = () => {
    const correct = process.env.NEXT_PUBLIC_ADMIN;
    if (password === correct) {
      setAuthenticated(true);
    } else {
      setError("Incorrect password");
    }
  };

  // ─ Dashboard States ──────────────────────
  const [timeFrame, setTimeFrame] = useState<"3d" | "7d" | "30d" | "90d">("30d");
  const [counts, setCounts] = useState<Record<string, MetricCounts>>({
    "signed-in": { total: 0 },
    paid: { total: 0, monthly: 0, quarterly: 0, yearly: 0 },
    details: { total: 0, school: 0, college: 0 },
  });
  const [growthData, setGrowthData] = useState<UserGrowthPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // animate totals
  const [displayValues, setDisplayValues] = useState({
    "signed-in": 0,
    paid: 0,
    details: 0
  });
  const animRefs = useRef<{[key: string]: NodeJS.Timeout | null}>({
    "signed-in": null,
    paid: null,
    details: null
  });

  // ─ Fetch counts (only when authenticated) ────────────────────────────────
  useEffect(() => {
    if (!authenticated) return;

    setLoading(true);
    (async () => {
      const [
        { count: si },
        { count: p },
        { count: monthly },
        { count: quarterly },
        { count: yearly },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("subscription_status", true),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("subscription_status", true)
          .eq("subscription_plan", "monthly"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("subscription_status", true)
          .eq("subscription_plan", "quarterly"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("subscription_status", true)
          .eq("subscription_plan", "yearly"),
      ]);

      const [
        { count: dt },
        { count: school },
        { count: college },
      ] = await Promise.all([
        supabase.from("career_info").select("*", { count: "exact", head: true }),
        supabase
          .from("career_info")
          .select("*", { count: "exact", head: true })
          .eq("college_student", false),
        supabase
          .from("career_info")
          .select("*", { count: "exact", head: true })
          .eq("college_student", true),
      ]);

      setCounts({
        "signed-in": { total: si ?? 0 },
        paid: {
          total: p ?? 0,
          monthly: monthly ?? 0,
          quarterly: quarterly ?? 0,
          yearly: yearly ?? 0,
        },
        details: {
          total: dt ?? 0,
          school: school ?? 0,
          college: college ?? 0,
        },
      });

      setLoading(false);
    })();
  }, [authenticated]);

  // ─ Fetch growth data ──────────────────────────────────────────────
  useEffect(() => {
    if (!authenticated) return;

    (async () => {
      const now = new Date();
      const start = new Date(now);
      if (timeFrame === "3d") start.setDate(now.getDate() - 3);
      if (timeFrame === "7d") start.setDate(now.getDate() - 7);
      if (timeFrame === "30d") start.setDate(now.getDate() - 30);
      if (timeFrame === "90d") start.setDate(now.getDate() - 90);

      const { data } = await supabase.from("users").select("created_at");
      const bucket = new Map<string, number>();
      let d = new Date(start);
      while (d <= now) {
        bucket.set(d.toISOString().split("T")[0], 0);
        d.setDate(d.getDate() + 1);
      }
      data?.forEach((u: { created_at: string }) => {
        const day = u.created_at.split("T")[0];
        if (bucket.has(day)) bucket.set(day, bucket.get(day)! + 1);
      });
      let cum = 0;
      const out: UserGrowthPoint[] = [];
      Array.from(bucket.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .forEach(([day, cnt]) => {
          cum += cnt;
          out.push({ date: day, count: cum });
        });
      setGrowthData(out);
    })();
  }, [authenticated, timeFrame]);

  // ─ Animate totals on change ────────────────────────────────────────────────
  useEffect(() => {
    if (!authenticated) return;
    
    const sections = ["signed-in", "paid", "details"];
    
    sections.forEach(section => {
      const target = counts[section].total;
      if (animRefs.current[section]) clearInterval(animRefs.current[section]!);
      
      let step = 0;
      const totalSteps = 60;
      const inc = target / totalSteps;
      
      setDisplayValues(prev => ({
        ...prev,
        [section]: 0
      }));

      animRefs.current[section] = setInterval(() => {
        step++;
        if (step >= totalSteps) {
          setDisplayValues(prev => ({
            ...prev,
            [section]: target
          }));
          clearInterval(animRefs.current[section]!);
        } else {
          setDisplayValues(prev => ({
            ...prev,
            [section]: Math.floor(inc * step)
          }));
        }
      }, 1500 / totalSteps);
    });

    return () => {
      sections.forEach(section => {
        if (animRefs.current[section]) clearInterval(animRefs.current[section]!);
      });
    };
  }, [authenticated, counts]);

  return (
    <div className="min-h-screen bg-gray-800 text-gray-200 flex flex-col relative">
      {/* Password modal */}
      {!authenticated && (
        <PasswordModal
          value={password}
          error={error}
          onChange={handlePasswordChange}
          onSubmit={handlePasswordSubmit}
        />
      )}

      {/* Dashboard (only when authenticated) */}
      {authenticated && (
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 bg-gray-900 mb-2  z-10">
            <h1 className="text-2xl font-semibold">CareerRoadmap</h1>
          </header>

          <div className="flex flex-col space-y-2 px-16">
            {/* First Card (Signed In Users) - Takes full width on top */}
            <div className="bg-gray-900 rounded-3xl p-4 w-full text-center">
              <h2 className="text-3xl mb-6 font-semibold">Users Signed In</h2>
              <div className="text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 mb-4">
                {displayValues["signed-in"].toLocaleString()}
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, "dataMax"]} />
                    <Line
                      dataKey="count"
                      stroke="#FF6500"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-2 text-xs mt-3">
                {(["3d", "7d", "30d", "90d"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeFrame(tf)}
                    className={`px-2 py-1 rounded-full ${
                      timeFrame === tf
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Second and Third cards - side by side */}
            <div className="flex flex-col md:flex-row gap-4 pb-4">
              {/* Second Card (Paid Users) */}
              <div className="bg-gray-900 rounded-3xl p-8 flex-1 text-center">
                <h2 className="text-3xl mb-6 font-semibold">Paid Users</h2>
                <div className="text-5xl font-normal text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 mb-6">
                  {displayValues["paid"].toLocaleString()}
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[
                        { name: "Monthly", value: counts.paid.monthly ?? 0 },
                        { name: "Quarterly", value: counts.paid.quarterly ?? 0 },
                        { name: "Yearly", value: counts.paid.yearly ?? 0 },
                      ]}
                    >
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[0, "dataMax"]} />
                      <ReTooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#FF6500"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={false}
                        barSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Third Card (Details Filled) */}
              <div className="bg-gray-900 rounded-3xl p-8 flex-1 text-center">
                <h2 className="text-3xl mb-6 font-semibold">Users Filled Details</h2>
                <div className="text-5xl font-normal text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 mb-6">
                  {displayValues["details"].toLocaleString()}
                </div>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "School", value: counts.details.school ?? 0 },
                          { name: "College", value: counts.details.college ?? 0 },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={4}
                        isAnimationActive={false}
                      >
                        {[
                          { name: "School", value: counts.details.school ?? 0 },
                          { name: "College", value: counts.details.college ?? 0 },
                        ].map((_, idx) => (
                          <Cell key={idx} fill={["#4ADE80", "#60A5FA"][idx]} />
                        ))}
                      </Pie>
                      <ReTooltip
                        contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 text-sm mt-4">
                  <div className="flex items-center space-x-1">
                    <span
                      className="w-3 h-3 block rounded-full"
                      style={{ backgroundColor: "#4ADE80" }}
                    />
                    <span>School</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className="w-3 h-3 block rounded-full"
                      style={{ backgroundColor: "#60A5FA" }}
                    />
                    <span>College</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
