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
  roadmap?: number;
}

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

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded shadow-lg border-none">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function UserMetricsPage() {
  // Hide site footer on this page
  useLayoutEffect(() => {
    document.body.classList.add("user-metrics-page");
    const style = document.createElement("style");
    style.innerHTML = `body.user-metrics-page footer { display: none !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove("user-metrics-page");
      document.head.removeChild(style);
    };
  }, []);

  // Authentication
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };
  const handlePasswordSubmit = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN) {
      setAuthenticated(true);
    } else {
      setError("Incorrect password");
    }
  };

  // Dashboard state
  const [timeFrame, setTimeFrame] = useState<"1d" | "3d" | "7d" | "30d" | "90d">("30d");
  const [periodCounts, setPeriodCounts] = useState<Record<string, number>>({
    "1d": 0,
    "3d": 0,
    "7d": 0,
    "30d": 0,
    "90d": 0,
  });
  const [counts, setCounts] = useState<Record<string, MetricCounts>>({
    "signed-in": { total: 0 },
    paid: { total: 0, monthly: 0, quarterly: 0, yearly: 0 },
    unpaid: { total: 0, monthly: 0, quarterly: 0, yearly: 0 },
    details: { total: 0, school: 0, college: 0, roadmap: 0 },
  });
  const [growthData, setGrowthData] = useState<UserGrowthPoint[]>([]);


  const [displayValues, setDisplayValues] = useState({
    "signed-in": 0,
    paid: 0,
    details: 0,

    roadmap: 0,

  });
  const animRefs = useRef<Record<string, NodeJS.Timeout | null>>({
    "signed-in": null,
    paid: null,
    details: null,

    roadmap: null,

  });
  const [showPaid, setShowPaid] = useState(true);
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Fetch all counts + periodCounts
  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      // 1) Total & subscription counts
      const [
        { count: totalUsers },
        { count: paidTotal },
        { count: monthly },
        { count: quarterly },
        { count: yearly },
      ] = await Promise.all([
        supabase.from("users").select("*", { head: true, count: "exact" }),
        supabase.from("users").select("*", { head: true, count: "exact" }).eq("subscription_status", true),
        supabase
          .from("users")
          .select("*", { head: true, count: "exact" })
          .eq("subscription_status", true)
          .eq("subscription_plan", "monthly"),
        supabase
          .from("users")
          .select("*", { head: true, count: "exact" })
          .eq("subscription_status", true)
          .eq("subscription_plan", "quarterly"),
        supabase
          .from("users")
          .select("*", { head: true, count: "exact" })
          .eq("subscription_status", true)
          .eq("subscription_plan", "yearly"),
      ]);
      const [
        { count: unpaidMonthly },
        { count: unpaidQuarterly },
        { count: unpaidYearly },
      ] = await Promise.all([
        supabase
          .from("users")
          .select("*", { head: true, count: "exact" })
          .eq("subscription_status", false)
          .eq("subscription_plan", "monthly"),
        supabase
          .from("users")
          .select("*", { head: true, count: "exact" })
          .eq("subscription_status", false)
          .eq("subscription_plan", "quarterly"),
        supabase
          .from("users")
          .select("*", { head: true, count: "exact" })
          .eq("subscription_status", false)
          .eq("subscription_plan", "yearly"),
      ]);
      // 2) Details / roadmap counts
      const [
        { count: dt },
        { count: school },
        { count: college },
        { count: roadmap },
      ] = await Promise.all([
        supabase.from("career_info").select("*", { head: true, count: "exact" }),
        supabase
          .from("career_info")
          .select("*", { head: true, count: "exact" })
          .eq("college_student", false),
        supabase
          .from("career_info")
          .select("*", { head: true, count: "exact" })
          .eq("college_student", true),
        supabase
          .from("career_info")

          .select("*", { head: true, count: "exact" })

          .not("roadmap", "is", null),
      ]);

      // 3) Compute period breakpoints by DATE only
      const today = new Date();
      const iso = (d: Date) => d.toISOString().split("T")[0];
      const periods: Record<string, string> = {
        "1d": iso(today),
        "3d": iso(new Date(today.getTime() - 2 * 864e5)),
        "7d": iso(new Date(today.getTime() - 6 * 864e5)),
        "30d": iso(new Date(today.getTime() - 29 * 864e5)),
        "90d": iso(new Date(today.getTime() - 89 * 864e5)),
      };

      // 4) Count users by created_at date
      const { data: userData } = await supabase.from("users").select("created_at");
      const pc: Record<string, number> = { "1d": 0, "3d": 0, "7d": 0, "30d": 0, "90d": 0 };
      userData?.forEach((u : { created_at: string }) => {
        const day = u.created_at.split("T")[0];
        if (day === periods["1d"]) pc["1d"]++;
        if (day >= periods["3d"]) pc["3d"]++;
        if (day >= periods["7d"]) pc["7d"]++;
        if (day >= periods["30d"]) pc["30d"]++;
        if (day >= periods["90d"]) pc["90d"]++;
      });

      setPeriodCounts(pc);
      setCounts({
        "signed-in": { total: totalUsers ?? 0 },
        paid: {
          total: paidTotal ?? 0,
          monthly: monthly ?? 0,
          quarterly: quarterly ?? 0,
          yearly: yearly ?? 0,
        },
        unpaid: {
          total: (unpaidMonthly ?? 0) + (unpaidQuarterly ?? 0) + (unpaidYearly ?? 0),
          monthly: unpaidMonthly ?? 0,
          quarterly: unpaidQuarterly ?? 0,
          yearly: unpaidYearly ?? 0,

        },
        details: { total: dt ?? 0, school: school ?? 0, college: college ?? 0, roadmap: roadmap ?? 0 },
      });
    })();
  }, [authenticated]);

  // Build cumulative growth series by date
  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      const now = new Date();
      const start = new Date(now);
      switch (timeFrame) {
        case "1d":
          start.setDate(now.getDate());
          break;
        case "3d":
          start.setDate(now.getDate() - 3);
          break;
        case "7d":
          start.setDate(now.getDate() - 7);
          break;
        case "30d":
          start.setDate(now.getDate() - 30);
          break;
        case "90d":
          start.setDate(now.getDate() - 90);
          break;
      }

      const { data } = await supabase.from("users").select("created_at");
      const bucket = new Map<string, number>();
      for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
        bucket.set(d.toISOString().split("T")[0], 0);
      }
      data?.forEach((u: { created_at: string }) => {
        const day = u.created_at.split("T")[0];
        if (bucket.has(day)) bucket.set(day, bucket.get(day)! + 1);
      });

      let cum = 0;
      const out: UserGrowthPoint[] = [];
      Array.from(bucket.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, cnt]) => {
          cum += cnt;
          out.push({ date, count: cum });
        });
      setGrowthData(out);
    })();
  }, [authenticated, timeFrame]);

  // Animate the totals
  useEffect(() => {
    if (!authenticated) return;

    ["signed-in", "paid", "details", "roadmap"].forEach((sec) => {
      const target = sec === "roadmap" ? counts.details.roadmap! : counts[sec].total;
      if (animRefs.current[sec]) clearInterval(animRefs.current[sec]!);

      let step = 0;
      const steps = 60;
      const inc = target / steps;
      setDisplayValues((prev) => ({ ...prev, [sec]: 0 }));
      animRefs.current[sec] = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayValues((prev) => ({ ...prev, [sec]: target }));
          clearInterval(animRefs.current[sec]!);
        } else {
          setDisplayValues((prev) => ({ ...prev, [sec]: Math.floor(inc * step) }));
        }
      }, 1500 / steps);
    });
    return () => Object.values(animRefs.current).forEach((t) => t && clearInterval(t));
  }, [authenticated, counts, showRoadmap]);

  const getSubscriptionData = () =>
    showPaid
      ? [
          { name: "Monthly", value: counts.paid.monthly! },
          { name: "Quarterly", value: counts.paid.quarterly! },
          { name: "Yearly", value: counts.paid.yearly! },
        ]
      : [
          { name: "Monthly", value: counts.unpaid.monthly! },
          { name: "Quarterly", value: counts.unpaid.quarterly! },
          { name: "Yearly", value: counts.unpaid.yearly! },
        ];


  return (
    <div className="min-h-screen bg-gray-800 text-gray-200 flex flex-col relative">
      {!authenticated && (
        <PasswordModal
          value={password}
          error={error}
          onChange={handlePasswordChange}
          onSubmit={handlePasswordSubmit}
        />
      )}

      {authenticated && (
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 bg-gray-900 mb-2 z-10">
            <h1 className="text-2xl font-semibold">CareerRoadmap</h1>
          </header>

          <div className="flex flex-col space-y-2 px-16">
            {/* Users Signed In */}
            <div className="bg-gray-900 rounded-3xl p-4 w-full text-center">
              <h2 className="text-3xl mb-6 font-semibold">Users Signed In</h2>
              <div className="text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">
                {periodCounts[timeFrame].toLocaleString()}
              </div>
              <div className="text-lg text-gray-400 mt-1">
                / {counts["signed-in"].total.toLocaleString()}
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
                {(["1d", "3d", "7d", "30d", "90d"] as const).map((tf) => (
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-semibold">
                    {showPaid ? "Paid Users" : "Unpaid Users"}
                  </h2>
                  <button
                    onClick={() => setShowPaid(!showPaid)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm"
                  >
                    Show {showPaid ? "Unpaid" : "Paid"}
                  </button>
                </div>
                <div className="text-5xl font-normal text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 mb-6">
                  {showPaid 
                    ? displayValues["paid"].toLocaleString()
                    : counts.unpaid.total.toLocaleString()}
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={getSubscriptionData()}
                    >
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[0, "dataMax"]} />
                      <ReTooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="value"
                        fill={showPaid ? "#FF6500" : "#9CA3AF"}
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={false}
                        barSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Third Card (Details Filled / Roadmap Generated) */}
              <div className="bg-gray-900 rounded-3xl p-8 flex-1 text-center">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-semibold">
                    {showRoadmap ? "Roadmap Generated" : "Users Filled Details"}
                  </h2>
                  <button
                    onClick={() => setShowRoadmap(!showRoadmap)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm"
                  >
                    Show {showRoadmap ? "Details Filled" : "Roadmap Generated"}
                  </button>
                </div>
                
                {showRoadmap ? (
                  // Roadmap Generated View - Just the count with larger font
                  <div className="text-6xl font-normal text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 h-48 flex items-center justify-center">
                    {displayValues["roadmap"].toLocaleString()}
                  </div>
                ) : (
                  // Details Filled View - Original content
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
