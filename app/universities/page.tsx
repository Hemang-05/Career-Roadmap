// // // Code: app/universities/page.tsx

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import UniversityCard from "../../components/ui/UniversityCard";
import UniversityDetailModal from "../../components/ui/UniversityDetailModal";
import FloatingNavbar from "../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface University {
  id: number;
  name: string;
  country: string;
  placement_score: number;
  tuition_fees: number;
  cultural_score: number;
  vibe_check: number;
  image_url?: string;
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for search and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/events", label: "Events" },
    { href: "/analytics", label: "User Analysis" },
    { href: "/jobs", label: "Jobs" },
    { href: "/universities", label: "Universities" },
  ];

  // Fetch all universities once
  useEffect(() => {
    async function fetchUniversities() {
      setLoading(true);
      const { data, error } = await supabase.from("universities").select("*"); // or specify columns

      if (error) {
        console.error("Error fetching universities:", error);
      } else if (data) {
        setUniversities(data);
      }
      setLoading(false);
    }

    fetchUniversities();
  }, []);

  // Filter + Sort client-side
  const filteredAndSortedUniversities = universities
    // 1) Filter
    .filter((uni) => {
      // If searchTerm is empty, everything passes
      if (!searchTerm) return true;

      // Otherwise, check name or country
      const lowerSearch = searchTerm.toLowerCase();
      return (
        uni.name.toLowerCase().includes(lowerSearch) ||
        uni.country.toLowerCase().includes(lowerSearch)
      );
    })
    // 2) Sort
    .sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "placement_score-desc":
          return b.placement_score - a.placement_score;
        default:
          return 0; // no sorting
      }
    });

  const handleCardClick = (uni: University) => {
    setSelectedUniversity(uni);
    setModalOpen(true);
  };

  return (
    <div className="container mx-auto p-36">
      <FloatingNavbar navLinks={dashboardLinks} />
      <h1 className="text-5xl text-[#FF6500] font-bold mb-6 text-center">
        Universities
      </h1>

      {/* Search & Sort controls */}
      <div className="flex flex-col mb-16 sm:flex-row justify-center items-start sm:items-center gap-4">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by name or country"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-3 py-2 text-gray-800 rounded-lg w-full lg:w-1/3"
        />

        {/* Sort dropdown */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 text-gray-800 px-3 py-2 rounded-lg w-full lg:w-1/4"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="placement_score-desc">
            Placement Score (High to Low)
          </option>
        </select>
      </div>

      {/* Main content */}
      {loading ? (
        <p>Loading universities...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredAndSortedUniversities.map((uni, index) => (
            <UniversityCard
              key={uni.id}
              ranking={index + 1}
              name={uni.name}
              country={uni.country}
              placementScore={uni.placement_score}
              tuitionScore={uni.tuition_fees}
              culturalScore={uni.cultural_score}
              vibeScore={uni.vibe_check}
              imageUrl={uni.image_url || "/happy.png"}
              onClick={() => handleCardClick(uni)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedUniversity && (
        <UniversityDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          university={selectedUniversity}
        />
      )}
    </div>
  );
}
