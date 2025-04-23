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

  // State for external events search
  // const [externalEvents, setExternalEvents] = useState<any[]>([]);
  // const [loadingExternal, setLoadingExternal] = useState(false);
  // const [externalError, setExternalError] = useState<string | null>(null);
  // const [externalSearchTriggered, setExternalSearchTriggered] = useState(false);

  // New state for horizontal card
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isHorizontalCardVisible, setIsHorizontalCardVisible] = useState(false);

  // State to hold user's desired career (from career_info)
  const [desiredCareer, setDesiredCareer] = useState<string>("");

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

  // Handler for triggering external events search via Tavily API
  // const handleExternalSearch = async () => {
  //   if (!desiredCareer) {
  //     setExternalError(
  //       "Desired career is not available. Please update your career info."
  //     );
  //     return;
  //   }
  //   if (!user?.id) {
  //     setExternalError("User not available.");
  //     return;
  //   }
  //   setLoadingExternal(true);
  //   setExternalError(null);
  //   try {
  //     const query = `display all upcoming events, scholarship programs, fests, trials, olympiads, exams, and other opportunities relevant to your ${desiredCareer}, in next two months`;
  //     const res = await fetch("/api/tavily-search", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ query, clerk_id: user!.id }),
  //     });
  //     const data = await res.json();
  //     if (data.success) {
  //       console.log("External events fetched:", data.events);
  //       setExternalEvents(data.events || []); // Fallback to an empty array if undefined
  //     } else {
  //       setExternalError(data.error || "Failed to fetch external events.");
  //     }
  //   } catch (err: any) {
  //     console.error("Error fetching external events:", err);
  //     setExternalError("An error occurred while fetching external events.");
  //   } finally {
  //     setLoadingExternal(false);
  //   }
  // };

  // Automatically trigger external events search only on specific dates
  // useEffect(() => {
  //   if (isLoaded && user && desiredCareer) {
  //     const today = new Date();
  //     const dayOfMonth = today.getDate();
  //     // Check localStorage for a flag
  //     const triggeredMonth = localStorage.getItem("externalSearchTriggered");
  //     // Only trigger if today is specified day and the flag for this month is not set
  //     if ((dayOfMonth  === 1 || dayOfMonth  === 15)) {
        
  //       const checkIfSearchNeeded = async () => {
  //         try {
  //           // 1. Get Supabase user ID
  //           const { data: userRecord, error: userError } = await supabase
  //             .from("users")
  //             .select("id")
  //             .eq("clerk_id", user.id) // Use non-null assertion since 'user' is checked above
  //             .single();

  //           if (userError || !userRecord) {
  //             console.error("Error fetching Supabase user record for check:", userError);
  //             // Decide if you want to proceed without the check or stop
  //             // For safety, let's stop here if we can't confirm the user ID
  //             return;
  //           }
  //           const userId = userRecord.id;

  //           // 2. Define date range for today
  //           const startOfDay = new Date();
  //           startOfDay.setHours(0, 0, 0, 0); // Set to beginning of the day
  //           const endOfDay = new Date();
  //           endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

  //           // 3. Check if an event was created today for this user
  //           const { count, error: checkError } = await supabase
  //             .from("events")
  //             .select("id", { count: 'exact', head: true }) // Only need the count
  //             .eq("user_id", userId)
  //             .gte("created_at", startOfDay.toISOString()) // Check if created_at >= start of today
  //             .lte("created_at", endOfDay.toISOString());   // Check if created_at <= end of today

  //           if (checkError) {
  //             console.error("Error checking for existing events today:", checkError);
  //             // Decide if you want to proceed despite the error, maybe default to searching?
  //             // Let's be cautious and not search if the check fails
  //             return;
  //           }

  //           // 4. Trigger search ONLY if no event was created today (count is 0 or null)
  //           if (count === 0) {
  //             console.log(
  //               "Auto-triggering external events search: No record found for today."
  //             );
  //             handleExternalSearch(); // Call your existing search function
  //             sendEmailNotification(); // Call your existing email function
  //             // You might still want a flag (in state or DB) if you need to ensure it runs *only once* per day
  //             // even if the component re-mounts, but this check prevents it based on DB data.
  //           } else {
  //             console.log(
  //               "Skipping external events search: Record already exists for today.",
  //               `Count: ${count}`
  //             );
  //           }
  //         } catch (err) {
  //           console.error("Error in checkIfSearchNeeded:", err);
  //         }
  //       };

  //       checkIfSearchNeeded();
  //       sendEmailNotification();
  //     }
  //   }
  // }, [isLoaded, user, desiredCareer]);

  // Function to send email notification via your API route for sending emails
  // const sendEmailNotification = async () => {
  //   if (!user?.primaryEmailAddress) {
  //     console.error("User email not available for sending notification.");
  //     return;
  //   }
  
  //   let parentEmail = null;
  //   try {
  //     // We already have the user ID from previous supabase queries in this page
  //     const { data: userRecord, error: userError } = await supabase
  //       .from("users")
  //       .select("id")
  //       .eq("clerk_id", user.id)
  //       .single();
        
  //     if (userError || !userRecord) {
  //       console.error("Error fetching user record:", userError);
  //       // Continue with sending email to user even if parent email fetch fails
  //     } else {
  //       // Fetch parent_email from career_info table using the user_id
  //       const { data: careerInfo, error: careerInfoError } = await supabase
  //         .from("career_info")
  //         .select("parent_email")
  //         .eq("user_id", userRecord.id)
  //         .single();
          
  //       if (careerInfoError) {
  //         console.error("Error fetching parent email:", careerInfoError);
  //       } else if (careerInfo && careerInfo.parent_email) {
  //         parentEmail = careerInfo.parent_email;
  //         console.log("Parent email fetched:", parentEmail);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error fetching parent email:", err);
  //     // Continue with sending email to user even if parent email fetch fails
  //   }
  
  //   // Create an array of recipients
  //   const recipients = [user.primaryEmailAddress.emailAddress];
  //   if (parentEmail) {
  //     recipients.push(parentEmail);
  //   }
  
  //   // const emailPayload = {
  //   //   to: recipients, // Send to both user and parent if available
  //   //   subject: "New Career Events Updates!",
  //   //   text: `Hi ${
  //   //     user.fullName || "there"
  //   //   },\n\nWe have received updates regarding new events related to your career. Please open the app to register.\n\nBest,\nCareer Roadmap Team`,
  //   // };
  //   const emailPayload = {
  //     to: recipients,
  //     subject: "New Career Events Available",
  //     html: `
  //       <!DOCTYPE html>
  //       <html lang="en">
  //       <head>
  //         <meta charset="UTF-8">
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //         <title>Career Events Update</title>
  //         <style>
  //           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

            
  //           body {
  //     font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  //     line-height: 1.5;
  //     color: #1a1a1a;
  //     background-color: #f8f9fa;
  //     margin: 0;
  //     padding: 20px;
  //     display: flex;
  //     justify-content: center;
  //   }
  //           .container {
  //     max-width: 600px;
  //     width: 100%;
  //     margin: 0 auto;
  //     background-color: #FDFAF6;
  //     border-radius: 32px;
  //     overflow: hidden;
  //     box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  //   }
  //           .header {
  //     padding: 28px 0;
  //     text-align: center;
  //     background: linear-gradient(70deg, #FF6500, #FCB454);
  //     color: white;
  //   }
  //   .logo {
  //     font-size: 32px;
  //     font-weight: 600;
  //     letter-spacing: 1.3px;
  //   }

  //           .content {
  //             padding: 40px 36px;
  //           }
  //           .title {
  //             font-size: 24px;
  //             font-weight: 600;
  //             color: #1a1a1a;
  //             margin: 0 0 24px 0;
  //             letter-spacing: -0.5px;
  //           }
  //           .text {
  //             font-size: 15px;
  //             color: #444;
  //             margin-bottom: 20px;
  //             font-weight: 400;
  //           }
  //           .button-container {
  //             text-align: center;
  //             margin: 32px 0;
  //           }
  //           .button {
  //     display: inline-block;
  //     background: linear-gradient(135deg, #FF6500, #FCB454);
  //     color: white;
  //     text-decoration: none;
  //     padding: 14px 32px;
  //     border-radius: 32px;
  //     font-weight: 500;
  //     font-size: 15px;
  //     box-shadow: 0 4px 12px rgba(102, 101, 221, 0.3);
  //   }
  //           .divider {
  //             height: 1px;
  //             background-color: #eaeaea;
  //             margin: 36px 0;
  //           }
          
  //           .event-title {
  //             font-size: 17px;
  //             font-weight: 600;
  //             margin: 0 0 8px 0;
  //           }
  //           .event-description {
  //             font-size: 14px;
  //             color: #666;
  //             margin: 0;
  //           }
  //           .footer {
  //             background-color: #f8f9fa;
  //             padding: 24px;
  //             text-align: center;
  //             font-size: 13px;
  //             color: #888;
  //           }
           
  //           @media only screen and (max-width: 550px) {
  //             .content {
  //               padding: 30px 24px;
  //             }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <div class="header">
  //             <div class="logo">Career Roadmap</div>
  //           </div>
            
  //           <div class="content">
  //             <h1 class="title">New Career Opportunities Available</h1>
              
  //             <p class="text">Hello ${user.fullName || "there"},</p>
              
  //             <p class="text">We're pleased to inform you that new career events matching your professional profile have been added to our platform.</p>
              
  //             <div class="event-preview">
  //               <h3 class="event-title">Events Notification</h3>
  //               <p class="event-description">Check out the new events and improve your chances to reach your dream.</p>
  //             </div>
              
  //             <div class="button-container">
  //               <a href="https://www.careeroadmap.com/events" class="button">View All Events</a>
  //             </div>
              
  //             <div class="divider"></div>
              
  //             <p class="text">We carefully curate opportunities to help accelerate your career growth and connect you with ways to improve your portfolio.</p>
              
  //             <p class="text" style="margin-bottom: 0;">Best regards,<br>The Career Roadmap Team</p>
  //           </div>
            
  //           <div class="footer">
              
  //             <div>© 2025 Career Roadmap. All rights reserved.</div>
  
  //           </div>
  //         </div>
  //       </body>
  //       </html>
  //     `,
  //     text: `Hello ${user.fullName || "there"},
    
  //   We've curated new career events that align with your professional goals. These exclusive opportunities are now available in your personalized dashboard.
    
  //   FEATURED EVENT:
  //   Tech Industry Networking Summit - Connect with industry leaders and explore emerging career paths in technology.
    
  //   View all events: [APP_LINK]
    
  //   Your career growth matters to us. Our team has carefully selected these events based on your profile and interests.
    
  //   Best regards,
  //   The Career Roadmap Team
    
  //   © 2025 Career Roadmap. All rights reserved.
  //   `,
  //   };
  
  //   try {
  //     const res = await fetch("/api/send-email", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(emailPayload),
  //     });
  //     const data = await res.json();
  //     console.log("Email notification sent:", data);
  //   } catch (err: any) {
  //     console.error("Error sending email notification:", err);
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

  // Handle clicking outside the horizontal card to close it
  useEffect(() => {
    const handleClickOutsideCard = (event: MouseEvent) => {
      const card = document.getElementById("horizontal-event-card");
      if (
        isHorizontalCardVisible &&
        card &&
        !card.contains(event.target as Node)
      ) {
        closeHorizontalCard();
      }
    };

    document.addEventListener("mousedown", handleClickOutsideCard);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCard);
    };
  }, [isHorizontalCardVisible]);

  // Function to handle event card click
  const handleEventCardClick = (event: any) => {
    setSelectedEvent(event);
    setIsHorizontalCardVisible(true);
  };

  // Function to close horizontal card
  const closeHorizontalCard = () => {
    setIsHorizontalCardVisible(false);
    setTimeout(() => {
      setSelectedEvent(null);
    }, 300); // Delay to allow transition animation to complete
  };

  // Function to handle check-in button click
  const handleCheckIn = () => {
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

        {/* Fancy Month Dropdown */}
        <div className="mb-8 px-40  relative" id="month-dropdown">
          <label className="block text-gray-700 mb-2 font-medium">
            Select Month:
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-md shadow-sm hover:border-[#FF6500] transition-all duration-200">
              <span className="text-gray-800">
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
              <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-auto py-1 transform transition-all duration-200 ease-in-out origin-top">
                <div className="py-1 text-xs text-gray-500 border-b border-gray-100">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.isArray(row.event_json) && row.event_json.length > 0 ? (
                  row.event_json.map((event: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => handleEventCardClick(event)}
                      className="block cursor-pointer w-6/7"
                    >
                      <div className="h-72 bg-white shadow-[0px_0px_15px_rgba(0,0,0,0.09)] p-6 space-y-3 rounded-lg relative overflow-hidden transition-transform duration-300 hover:scale-105">
                        <div className="w-24 h-24 bg-[#FF6500] rounded-full absolute -right-5 -top-7 ">
                          <p className="absolute bottom-6 left-7 text-white text-2xl">
                            {String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>
                        <div className="w-24 h-24">
                          {idx === 0 && (
                            <img
                              src="https://res.cloudinary.com/ditn9req1/image/upload/v1744970734/event2_dgzrdw.webp"
                              alt="Triangle"
                              className="w-full h-full object-contain"
                            />
                          )}
                          {idx === 1 && (
                            <img
                              src="https://res.cloudinary.com/ditn9req1/image/upload/v1744970739/event5_trpn3j.webp"
                              alt="Line"
                              className="w-full h-full object-contain"
                            />
                          )}
                          {idx === 2 && (
                            <img
                              src="https://res.cloudinary.com/ditn9req1/image/upload/v1744970733/event1_ugxa3g.webp"
                              alt="Circle"
                              className="w-full h-full object-contain"
                            />
                          )}
                          {idx === 3 && (
                            <img
                              src="https://res.cloudinary.com/ditn9req1/image/upload/v1744970735/event4_vsa0w7.webp"
                              alt="Circle"
                              className="w-full h-full object-contain"
                            />
                          )}
                          {idx === 4 && (
                            <img
                              src="https://res.cloudinary.com/ditn9req1/image/upload/v1744970734/event3_djk8l8.webp"
                              alt="Circle"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>

                        <h1 className="font-bold text-gray-700 text-lg line-clamp-3">
                          {event.title}
                        </h1>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-3">
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

        {/* Horizontal Event Card (Modal) */}
        {selectedEvent && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
              isHorizontalCardVisible
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              id="horizontal-event-card"
              className={`bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto overflow-hidden transition-transform duration-300 transform ${
                isHorizontalCardVisible ? "translate-y-0" : "translate-y-8"
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left section with image (for larger screens) */}
                <div className="md:w-1/3 bg-[#e1af6f] p-6 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-black">
                    {selectedEvent.title}
                  </h2>
                </div>

                {/* Right section with content */}
                <div className="md:w-2/3 p-6 md:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <button
                      onClick={closeHorizontalCard}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className=" absolute w-6 h-6 top-2 right-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-6 h-64 overflow-y-auto pr-2">
                    <p className="text-gray-600 ">
                      {selectedEvent.content ||
                        "This is a career event that matches your interests. Click the Check-In button below to learn more and register for this opportunity."}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleCheckIn}
                      className="bg-white text-black py-3 px-12 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-orange-400 mb-2"
                    >
                      Check-In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
