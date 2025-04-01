import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";

export interface ExtendedRatingData {
  universityId: number;
  companiesCount: number;
  highestCTC: number;
  averageCTC: number;
  tuitionFee: number;
  culturalRating: number;
  infraRating: number;
  vibeRating: number;
}

interface University {
  id: number;
  name: string;
}

interface UniversityDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExtendedRatingData) => void;
}

export default function UniversityDataModal({
  isOpen,
  onClose,
  onSubmit,
}: UniversityDataModalProps) {
  const [formData, setFormData] = useState({
    companiesCount: "",
    highestCTC: "",
    averageCTC: "",
    tuitionFee: "",
    culturalRating: 0,
    infraRating: 0,
    vibeRating: 0,
  });

  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch universities from Supabase when the component mounts
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("universities")
          .select("id, name");
        if (error) throw error;
        setUniversities(data || []);
      } catch (error) {
        console.error("Error fetching universities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Reset form when the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        companiesCount: "",
        highestCTC: "",
        averageCTC: "",
        tuitionFee: "",
        culturalRating: 0,
        infraRating: 0,
        vibeRating: 0,
      });
      setSelectedUniversityId(null);
      setInputValue("");
      setIsSuggestionsOpen(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to set a numeric rating (1–10) for the three categories
  const handleRatingClick = (
    field: "culturalRating" | "infraRating" | "vibeRating",
    value: number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Ensure a university is selected
    if (!selectedUniversityId) {
      alert("Please select a university.");
      return;
    }

    const data: ExtendedRatingData = {
      universityId: selectedUniversityId,
      companiesCount: parseInt(formData.companiesCount),
      highestCTC: parseInt(formData.highestCTC),
      averageCTC: parseInt(formData.averageCTC),
      tuitionFee: parseFloat(formData.tuitionFee),
      culturalRating: formData.culturalRating,
      infraRating: formData.infraRating,
      vibeRating: formData.vibeRating,
    };

    onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black z-50 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative max-h-[90vh] overflow-auto custom-scrollbar">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl  font-bold mb-4">University Data Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Placement Details in a single row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="companiesCount"
                className="block font-medium mb-1"
              >
                Companies Count
              </label>
              <input
                type="number"
                name="companiesCount"
                id="companiesCount"
                min="0"
                step="1"
                value={formData.companiesCount}
                onChange={handleInputChange}
                className="p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="highestCTC" className="block font-medium mb-1">
                Highest CTC (LPA)
              </label>
              <input
                type="number"
                name="highestCTC"
                id="highestCTC"
                min="0"
                step="1"
                value={formData.highestCTC}
                onChange={handleInputChange}
                className="p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="averageCTC" className="block font-medium mb-1">
                Average CTC (LPA)
              </label>
              <input
                type="number"
                name="averageCTC"
                id="averageCTC"
                min="0"
                step="1"
                value={formData.averageCTC}
                onChange={handleInputChange}
                className="p-2 border rounded w-full"
                required
              />
            </div>
          </div>

          {/* University Input with Autocomplete */}
          <div>
            <label htmlFor="universityInput" className="block font-medium mb-1">
              University
            </label>
            <div className="relative">
              <input
                id="universityInput"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onFocus={() => setIsSuggestionsOpen(true)}
                className="p-2 border rounded w-full"
                placeholder="Type to search universities..."
                required
                autoComplete="off"
              />
              {isSuggestionsOpen && inputValue && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                  {universities
                    .filter((uni) =>
                      uni.name.toLowerCase().includes(inputValue.toLowerCase())
                    )
                    .map((uni) => (
                      <div
                        key={uni.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedUniversityId(uni.id);
                          setInputValue(uni.name);
                          setIsSuggestionsOpen(false);
                        }}
                      >
                        {uni.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tuitionFee" className="block font-medium mb-1">
              Tuition Fee (per semester)
            </label>
            <input
              type="number"
              name="tuitionFee"
              id="tuitionFee"
              min="0"
              step="0.1"
              value={formData.tuitionFee}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          {/* Cultural Rating */}
          <div>
            <label className="block font-medium mb-2">
              Cultural Events Rating
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  onClick={() => handleRatingClick("culturalRating", num)}
                  className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded 
                    ${
                      formData.culturalRating === num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }
                  `}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Rating */}
          <div>
            <label className="block font-medium mb-2">
              Infrastructure Rating
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  onClick={() => handleRatingClick("infraRating", num)}
                  className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded 
                    ${
                      formData.infraRating === num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }
                  `}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Vibe Check Rating */}
          <div>
            <label className="block font-medium mb-2">Vibe Check Rating</label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  onClick={() => handleRatingClick("vibeRating", num)}
                  className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded 
                    ${
                      formData.vibeRating === num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }
                  `}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Data
          </button>
        </form>
      </div>
    </div>
  );
}
