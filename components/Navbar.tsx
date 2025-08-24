// // components/FloatingNavbar.tsx
// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { useUser, UserButton, SignInButton } from "@clerk/nextjs";

// interface NavLink {
//   href: string;
//   label: string;
//   onClick?: () => void;
// }

// interface FloatingNavbarProps {
//   navLinks?: NavLink[];
//   className?: string;
// }

// export default function FloatingNavbar({ navLinks }: FloatingNavbarProps) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { isSignedIn } = useUser();

//   // Default links if none are provided
//   const defaultLinks: NavLink[] = [
//     { href: "/blog", label: "Blogs" },
//     { href: "#features", label: "Features" },
//     { href: "#pricing", label: "Pricing" },
//     { href: "#testimonials", label: "Testimonials" },
//   ];

//   const links = navLinks || defaultLinks;

//   return (
//     <>
//       <header
//         className="fixed top-4 md:top-8 z-50 bg-[#F7F7F7]/70 backdrop-blur-md border border-white/20 shadow-lg
//         h-12 md:h-12 w-[65%] md:w-[60%] left-1/2 -translate-x-1/2 rounded-2xl
//         flex items-center justify-between md:justify-around px-4"
//       >
//         <div className="flex items-center">
//           <div className="text-xl md:text-2xl font-bold">
//             <span className="text-[#FF6500]">Career</span>
//             <span className="text-black">Roadmap</span>
//           </div>
//         </div>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:block">
//           <ul className="flex space-x-8">
//             {links.map((link) => (
//               <li key={link.href}>
//                 {link.href === "/dashboard" ? (
//                   isSignedIn ? (
//                     <Link
//                       href={link.href}
//                       onClick={link.onClick}
//                       className="text-gray-700 hover:text-[#FF6500] font-medium"
//                     >
//                       {link.label}
//                     </Link>
//                   ) : (
//                     <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
//                       <button className="text-gray-700 hover:text-[#FF6500] font-medium">
//                         {link.label}
//                       </button>
//                     </SignInButton>
//                   )
//                 ) : (
//                   <Link
//                     href={link.href}
//                     onClick={link.onClick}
//                     className="text-gray-700 hover:text-[#FF6500] font-medium"
//                   >
//                     {link.label}
//                   </Link>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* User Info */}
//         <div className="hidden md:flex items-center space-x-4">
//           <UserButton afterSignOutUrl="/" />
//         </div>

//         {/* Mobile menu button */}
//         <div className="md:hidden">
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="text-gray-600 focus:outline-none"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               {isMenuOpen ? (
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               ) : (
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               )}
//             </svg>
//           </button>
//         </div>
//       </header>

//       {/* Mobile Navigation */}
//       {isMenuOpen && (
//         <div className="md:hidden fixed top-20 left-0 right-0 z-40 bg-white py-4 px-4 shadow-lg">
//           <ul className="flex flex-col space-y-4">
//             {links.map((link) => (
//               <li key={link.href}>
//                 {link.href === "/dashboard" ? (
//                   isSignedIn ? (
//                     <Link
//                       href={link.href}
//                       onClick={() => setIsMenuOpen(false)}
//                       className="text-gray-700 hover:text-[#FF6500] font-medium block py-2"
//                     >
//                       {link.label}
//                     </Link>
//                   ) : (
//                     <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
//                       <button
//                         onClick={() => setIsMenuOpen(false)}
//                         className="text-gray-700 hover:text-[#FF6500] font-medium block py-2"
//                       >
//                         {link.label}
//                       </button>
//                     </SignInButton>
//                   )
//                 ) : (
//                   <Link
//                     href={link.href}
//                     onClick={() => setIsMenuOpen(false)}
//                     className="text-gray-700 hover:text-[#FF6500] font-medium block py-2"
//                   >
//                     {link.label}
//                   </Link>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </>
//   );
// }

// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
// import { supabase } from "@/utils/supabase/supabaseClient";
// import { useRouter } from "next/navigation";

// interface NavLink {
//   href: string;
//   label: string;
//   onClick?: () => void;
// }

// interface NavbarProps {
//   navLinks?: NavLink[];
// }

// const useScrollDirection = () => {
//   const [scrollDirection, setScrollDirection] = useState("up");
//   const [prevOffset, setPrevOffset] = useState(0);

//   useEffect(() => {
//     const toggleScrollDirection = () => {
//       const scrollY = window.pageYOffset;
//       if (scrollY === 0) {
//         setScrollDirection("up");
//       } else if (scrollY > prevOffset) {
//         setScrollDirection("down");
//       } else if (scrollY < prevOffset) {
//         setScrollDirection("up");
//       }
//       setPrevOffset(scrollY);
//     };

//     window.addEventListener("scroll", toggleScrollDirection);
//     return () => window.removeEventListener("scroll", toggleScrollDirection);
//   }, [prevOffset]);

//   return scrollDirection;
// };

// export default function Navbar({ navLinks }: NavbarProps) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { user, isSignedIn, isLoaded } = useUser();
//   const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const router = useRouter();

//   const scrollDirection = useScrollDirection();

//   // Check if user has roadmap when they sign in
//   useEffect(() => {
//     if (!isLoaded || !isSignedIn || !user) return;

//     async function checkUserRoadmap() {
//       setLoading(true);
//       try {
//       const { data: userData, error: userError } = await supabase
//           .from("users")
//           .select("id")
//           .eq("clerk_id", user?.id)
//           .single();

//         if (userError || !userData) {
//           console.log("Navbar: Error fetching user data:", userError);
//           setHasRoadmap(false);
//           setLoading(false);
//           return;
//         }

//         console.log("Navbar: Found internal user_id:", userData.id);

//         const { data: careerData, error: careerError } = await supabase
//           .from("career_info")
//           .select("roadmap")
//           .eq("user_id", userData.id)
//           .maybeSingle();

//         console.log("Navbar: Career data received:", careerData);

//         if (careerError) {
//           console.log("Navbar: Error fetching career data:", careerError);
//           setHasRoadmap(false);
//         } else {
//           const roadmapExists = !!(
//             careerData &&
//             careerData.roadmap &&
//             typeof careerData.roadmap === "object" &&
//             Object.keys(careerData.roadmap).length > 0
//           );
//           console.log("Navbar: Does roadmap exist and have content?", roadmapExists);
//           setHasRoadmap(roadmapExists);
//         }
//       } catch (error) {
//         console.error("Navbar: Unexpected error checking roadmap:", error);
//         setHasRoadmap(false);
//       } finally {
//         setLoading(false);
//       }
//     }

//     checkUserRoadmap();
//   }, [isLoaded, isSignedIn, user]);

//   const handleDashboardClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (isSignedIn && user?.id) {
//       const destination = hasRoadmap ? "/roadmap" : "/dashboard";
//       console.log("Navbar: Manual navigation to:", destination);
//       router.push(destination);
//     }
//   };

//   const defaultLinks: NavLink[] = [
//     { href: "/blog", label: "Blogs" },
//     { href: "#features", label: "Features" },
//     { href: "#pricing", label: "Pricing" },
//     { href: "/dashboard", label: "Login" },
//   ];

//   const links = navLinks || defaultLinks;

//   return (
//     <header
//       className={`fixed top-0 z-50 w-full bg-white transition-transform duration-300 ${
//         scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 h-16 flex items-center justify-between">
//         {/* Logo */}
//         {/* <Link href="/" className="text-xl font-semibold whitespace-nowrap">
//           <span className="text-[#519770]">Career</span>
//           <span className="text-black">CareerRoadmap</span>
//         </Link> */}
//         <Link
//           href="/"
//           className="flex items-center text-xl font-semibold whiteness-nowrap"
//         >
//           <img src="/lo.png" alt="CareerRoadmap Logo" className="h-12 w-12" />
//           <span className="text-black">CareerRoadmap</span>
//         </Link>

//         {/* Desktop nav */}
//         <nav className="hidden md:flex items-center space-x-8">
//           {links.map((link) => (
//             <div key={link.href}>
//               {link.href === "/dashboard" ? (
//                 isSignedIn ? (
//                   <Link
//                     href={link.href}
//                     onClick={handleDashboardClick}
//                     className="text-sm text-black hover:text-[#428388] font-medium"
//                   >
//                     {link.label}
//                   </Link>
//                 ) : (
//                   <SignInButton mode="modal">
//                     <button className="text-sm text-black hover:text-[#428388] font-thin">
//                       {link.label}
//                     </button>
//                   </SignInButton>
//                 )
//               ) : (
//                 <Link
//                   href={link.href}
//                   className="text-sm text-black hover:text-[#428388] font-thin"
//                 >
//                   {link.label}
//                 </Link>
//               )}
//             </div>
//           ))}
//           {isSignedIn && <UserButton afterSignOutUrl="/" />}
//         </nav>

//         {/* Mobile menu button */}
//         <div className="md:hidden">
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="text-black"
//             aria-label="Toggle menu"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               {isMenuOpen ? (
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               ) : (
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               )}
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isMenuOpen && (
//         <div className="md:hidden px-4 mx-8 pt-2 pb-4 border rounded-3xl border-gray-200 bg-[#fcfbffd4]">
//           <ul className="space-y-2">
//             {links.map((link) => (
//               <li key={link.href}>
//                 {link.href === "/dashboard" ? (
//                   isSignedIn ? (
//                     <Link
//                       href={link.href}
//                       onClick={(e) => {
//                         handleDashboardClick(e);
//                         setIsMenuOpen(false);
//                       }}
//                       className="block text-black pb-2 hover:text-[#428388] font-normal"
//                     >
//                       {link.label}
//                     </Link>
//                   ) : (
//                     <SignInButton mode="modal">
//                       <button
//                         onClick={() => setIsMenuOpen(false)}
//                         className="block text-black pb-2 hover:text-[#428388] font-normal"
//                       >
//                         {link.label}
//                       </button>
//                     </SignInButton>
//                   )
//                 ) : (
//                   <Link
//                     href={link.href}
//                     onClick={() => setIsMenuOpen(false)}
//                     className="block text-black pb-2 hover:text-[#428388] font-normal"
//                   >
//                     {link.label}
//                   </Link>
//                 )}
//               </li>
//             ))}
//             {isSignedIn && <UserButton afterSignOutUrl="/" />}
//           </ul>
//         </div>
//       )}
//     </header>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  onClick?: () => void;
  forceDirect?: boolean; // NEW: Added this to bypass redirect logic
}

interface NavbarProps {
  navLinks?: NavLink[];
}

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const toggleScrollDirection = () => {
      const scrollY = window.pageYOffset;
      if (scrollY === 0) {
        setScrollDirection("up");
      } else if (scrollY > prevOffset) {
        setScrollDirection("down");
      } else if (scrollY < prevOffset) {
        setScrollDirection("up");
      }
      setPrevOffset(scrollY);
    };

    window.addEventListener("scroll", toggleScrollDirection);
    return () => window.removeEventListener("scroll", toggleScrollDirection);
  }, [prevOffset]);

  return scrollDirection;
};

export default function Navbar({ navLinks }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const scrollDirection = useScrollDirection();

  // Check if user has roadmap when they sign in
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    async function checkUserRoadmap() {
      setLoading(true);
      try {
      const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user?.id)
          .single();

        if (userError || !userData) {
          console.log("Navbar: Error fetching user data:", userError);
          setHasRoadmap(false);
          setLoading(false);
          return;
        }

        console.log("Navbar: Found internal user_id:", userData.id);

        const { data: careerData, error: careerError } = await supabase
          .from("career_info")
          .select("roadmap")
          .eq("user_id", userData.id)
          .maybeSingle();

        console.log("Navbar: Career data received:", careerData);

        if (careerError) {
          console.log("Navbar: Error fetching career data:", careerError);
          setHasRoadmap(false);
        } else {
          const roadmapExists = !!(
            careerData &&
            careerData.roadmap &&
            typeof careerData.roadmap === "object" &&
            Object.keys(careerData.roadmap).length > 0
          );
          console.log("Navbar: Does roadmap exist and have content?", roadmapExists);
          setHasRoadmap(roadmapExists);
        }
      } catch (error) {
        console.error("Navbar: Unexpected error checking roadmap:", error);
        setHasRoadmap(false);
      } finally {
        setLoading(false);
      }
    }

    checkUserRoadmap();
  }, [isLoaded, isSignedIn, user]);

  // MODIFIED: Updated to handle forceDirect properly
  const handleDashboardClick = (e: React.MouseEvent, link: NavLink) => {
    // If forceDirect is true, let the normal Link navigation happen
    if (link.forceDirect) {
      return; // Don't prevent default, let it navigate normally
    }
    
    // Original logic for non-forceDirect dashboard links
    e.preventDefault();
    if (isSignedIn && user?.id) {
      const destination = hasRoadmap ? "/roadmap" : "/dashboard";
      console.log("Navbar: Manual navigation to:", destination);
      router.push(destination);
    }
  };

  const defaultLinks: NavLink[] = [
    { href: "/blog", label: "Blogs" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/dashboard", label: "Login" },
  ];

  const links = navLinks || defaultLinks;

  return (
    <header
      className={`fixed top-0 z-50 w-full bg-white transition-transform duration-300 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 h-16 flex items-center justify-between">
        {/* Logo - PRESERVED from original */}
        <Link
          href="/"
          className="flex items-center text-xl font-semibold whiteness-nowrap"
        >
          <img src="/lo.png" alt="CareerRoadmap Logo" className="h-12 w-12" />
          <span className="text-black">CareerRoadmap</span>
        </Link>

        {/* Desktop nav - PRESERVED original structure */}
        <nav className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <div key={link.href}>
              {link.href === "/dashboard" ? (
                isSignedIn ? (
                  <Link
                    href={link.href}
                    onClick={(e) => handleDashboardClick(e, link)}
                    className="text-sm text-black hover:text-[#428388] font-medium"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="text-sm text-black hover:text-[#428388] font-thin">
                      {link.label}
                    </button>
                  </SignInButton>
                )
              ) : (
                <Link
                  href={link.href}
                  className="text-sm text-black hover:text-[#428388] font-thin"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
          {isSignedIn && <UserButton afterSignOutUrl="/" />}
        </nav>

        {/* Mobile menu button - PRESERVED */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu - PRESERVED original styling */}
      {isMenuOpen && (
        <div className="md:hidden px-4 mx-8 pt-2 pb-4 border rounded-3xl border-gray-200 bg-[#fcfbffd4]">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                {link.href === "/dashboard" ? (
                  isSignedIn ? (
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        handleDashboardClick(e, link);
                        setIsMenuOpen(false);
                      }}
                      className="block text-black pb-2 hover:text-[#428388] font-normal"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-black pb-2 hover:text-[#428388] font-normal"
                      >
                        {link.label}
                      </button>
                    </SignInButton>
                  )
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-black pb-2 hover:text-[#428388] font-normal"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </ul>
        </div>
      )}
    </header>
  );
}