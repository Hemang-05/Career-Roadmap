//app/events/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useSyncUser } from "@/app/hooks/sync-user";
import FloatingNavbar from "@/components/Navbar";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getCurrentMonth = () => {
  return new Date().toLocaleString("default", { month: "long" });
};

export default function EventsPage() {
  useSyncUser();
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // State for filtering stored events
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [storedEvents, setStoredEvents] = useState<any[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [storedError, setStoredError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // New state for horizontal card
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // State to hold user's desired career (from career_info)
  const [desiredCareer, setDesiredCareer] = useState<string>("");

  // Test API button state
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testAPIResult, setTestAPIResult] = useState<string | null>(null);

  // Custom nav links for the events page
  const navLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/blog", label: "Blogs" },
    { href: "/jobs", label: "Jobs" },
  ];

  // Fetch user's desired career from career_info
  useEffect(() => {
    if (!isLoaded || !user) return;
    async function fetchDesiredCareer() {
      try {
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user!.id)
          .single();
        if (userError || !userRecord) {
          console.error("Error fetching Supabase user record:", userError);
          return;
        }
        const userId = userRecord.id;
        const { data: careerInfo, error: careerInfoError } = await supabase
          .from("career_info")
          .select("desired_career")
          .eq("user_id", userId)
          .single();
        if (careerInfoError || !careerInfo) {
          console.error("Error fetching career info:", careerInfoError);
          return;
        }
        console.log("Fetched desired career:", careerInfo.desired_career);
        setDesiredCareer(careerInfo.desired_career || "");
      } catch (err) {
        console.error("Error in fetchDesiredCareer:", err);
      }
    }
    fetchDesiredCareer();
  }, [isLoaded, user]);

  // Fetch stored events from Supabase based on selected month
  useEffect(() => {
    if (!isLoaded || !user) return;
    async function fetchStoredEvents() {
      try {
        setLoadingStored(true);
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user!.id)
          .single();
        if (userError || !userRecord) {
          console.error("Error fetching user record:", userError);
          setStoredError("User record not found in Supabase.");
          return;
        }
        const userId = userRecord.id;
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("user_id", userId)
          .eq("event_month", selectedMonth);
        if (error) {
          console.error("Error fetching stored events:", error);
          setStoredError("Error fetching events: " + error.message);
        } else {
          setStoredEvents(data || []);
          console.log("Fetched stored events:", data);
        }
      } catch (err) {
        console.error("Error in fetchStoredEvents:", err);
        setStoredError("An error occurred while fetching events.");
      } finally {
        setLoadingStored(false);
      }
    }
    if (selectedMonth) {
      fetchStoredEvents();
    } else {
      setStoredEvents([]);
      setLoadingStored(false);
    }
  }, [selectedMonth, isLoaded, user]);

  // Test API function
  // const handleTestAPI = async () => {
  //   if (!user) {
  //     setTestAPIResult("Error: User not available");
  //     return;
  //   }

  //   setIsTestingAPI(true);
  //   setTestAPIResult(null);

  //   try {
  //     // Get user_id from Supabase
  //     const { data: userRecord, error: userError } = await supabase
  //       .from("users")
  //       .select("id")
  //       .eq("clerk_id", user.id)
  //       .single();

  //     if (userError || !userRecord) {
  //       setTestAPIResult("Error: Could not find user record in Supabase");
  //       return;
  //     }

  //     const response = await fetch("/api/events-api-gemini", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         user_id: userRecord.id,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       setTestAPIResult(
  //         `Success! Found ${data.events_found} events. Check the current month to see updated events.`
  //       );
  //       // Refresh the stored events to show newly fetched ones
  //       if (selectedMonth === getCurrentMonth()) {
  //         // Trigger a re-fetch of stored events
  //         const { data: refreshedEvents, error } = await supabase
  //           .from("events")
  //           .select("*")
  //           .eq("user_id", userRecord.id)
  //           .eq("event_month", selectedMonth);
  //         if (!error) {
  //           setStoredEvents(refreshedEvents || []);
  //         }
  //       }
  //     } else {
  //       setTestAPIResult(`Error: ${data.error}`);
  //     }
  //   } catch (error) {
  //     console.error("Test API error:", error);
  //     setTestAPIResult(
  //       `Error: ${
  //         error instanceof Error ? error.message : "Unknown error occurred"
  //       }`
  //     );
  //   } finally {
  //     setIsTestingAPI(false);
  //   }
  // };

  // Redirect if user is not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("month-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle opt-in button click (previously check-in)
  const handleOptIn = () => {
    if (selectedEvent?.url) {
      window.open(selectedEvent.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Floating Navbar */}
      <FloatingNavbar navLinks={navLinks} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow mt-24">
        <h1 className="text-3xl text-center font-bold mb-8 text-gray-800">
          <span className="text-[#FF6500]">Career</span> Events & Opportunities
        </h1>

        {/* Test API Button */}
        {/* <div className="mb-8 px-40 flex flex-col items-center">
          <button
            onClick={handleTestAPI}
            disabled={isTestingAPI}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isTestingAPI
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#FF6500] hover:bg-[#e55a00] text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {isTestingAPI ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing API...
              </div>
            ) : (
              "Test Events API (Gemini)"
            )}
          </button>

          {testAPIResult && (
            <div
              className={`mt-4 p-4 rounded-lg max-w-2xl text-center ${
                testAPIResult.startsWith("Success")
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {testAPIResult}
            </div>
          )}
        </div> */}

        {/* Fancy Month Dropdown */}
        <div className="mb-8 px-40 relative" id="month-dropdown">
          <label className="block text-gray-700 mb-2 font-medium">
            Select Month:
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center justify-between p-3 w-1/3 bg-white border border-gray-300 rounded-2xl shadow-sm hover:border-[#FF6500] transition-all duration-200">
              <span className="text-gray-800 px-4">
                {selectedMonth || "-- Select Month --"}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                  isDropdownOpen ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="absolute mt-1 w-1/3 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 max-h-60 overflow-auto py-1 transform transition-all duration-200 ease-in-out origin-top">
                <div className="py-1 px-4 text-xs text-gray-500 border-b border-gray-100">
                  Select a month
                </div>
                {months.map((month) => (
                  <div
                    key={month}
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      selectedMonth === month
                        ? "bg-orange-50 text-[#FF6500]"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedMonth(month);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stored Events Section */}
        {loadingStored ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-[#FF6500]"></div>
          </div>
        ) : storedEvents.length > 0 ? (
          storedEvents.map((row) => (
            <div key={row.id} className="mb-8 px-8 md:px-20 lg:px-36">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Events for {row.event_month}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(row.event_json) && row.event_json.length > 0 ? (
                  row.event_json.map((event: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#FFEFD5] rounded-3xl shadow-md p-4 transition-transform duration-300 hover:scale-105 flex flex-col"
                    >
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4">
                        <img
                          src={
                            event.image_url ||
                            "https://i.pinimg.com/1200x/b8/03/b9/b803b96b7112022cd2e3d0b1e56a0edd.jpg"
                          } // Use a default image if none is provided
                          alt={event.title || "Event Image"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <p className="absolute bottom-2 left-2 text-white text-lg font-semibold">
                          {event.title}
                        </p>
                      </div>
                      {/* <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {event.title}
                      </h3> */}
                      <p className="text-sm text-gray-800 mb-4 line-clamp-3">
                        {event.description || "No description available."}
                      </p>
                      <div className="flex justify-between items-center text-gray-500 text-xs mt-auto">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {event.date || "Date N/A"}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {event.location || "Location N/A"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          handleOptIn();
                        }}
                        className="mt-4 px-6 py-2 bg-[#5cef99] font-semibold text-[#5d536f] rounded-full hover:bg-[#65a142] transition-colors self-center"
                      >
                        Opt In
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">
                    No events stored in JSON for this month.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 mb-4">
              No events found for {selectedMonth || "the selected month"}.
            </p>
            <p className="text-sm text-gray-500">
              Select a different month from the dropdown or check back later for
              updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
