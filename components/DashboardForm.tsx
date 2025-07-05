// components/DashboardForm.tsx
"use client";
import React from "react";
import Select, { GroupBase, StylesConfig } from "react-select";
import countryList from "react-select-country-list";
import DifficultySelector from "@/components/DifficultySelector";

export type OptionType = {
  label: string;
  value: string;
};

interface DashboardFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  careerOption: "known" | "unknown";
  setCareerOption: (value: "known" | "unknown") => void;
  residingCountry: OptionType | null;
  setResidingCountry: (value: OptionType | null) => void;
  spendingCapacity: string;
  setSpendingCapacity: (value: string) => void;
  isCollegeStudent: boolean | null;
  setIsCollegeStudent: (value: boolean | null) => void;
  currentClass: string;
  setCurrentClass: (value: string) => void;
  parentEmail: string;
  setParentEmail: (value: string) => void;
  willingToMoveAbroad: boolean | null;
  setWillingToMoveAbroad: (value: boolean | null) => void;
  moveAbroad: "yes" | "suggest";
  setMoveAbroad: (value: "yes" | "suggest") => void;
  preferredAbroadCountry: OptionType | null;
  setPreferredAbroadCountry: (value: OptionType | null) => void;
  desiredCareer: string;
  setDesiredCareer: (value: string) => void;
  previousExperience: string;
  setPreviousExperience: (value: string) => void;
  interestParagraph: string;
  setInterestParagraph: (value: string) => void;
  difficulty: "easy" | "medium" | "hard" | null;
  setDifficulty: (value: "easy" | "medium" | "hard" | null) => void;
}

const DashboardForm: React.FC<DashboardFormProps> = ({
  onSubmit,
  isSubmitting,
  careerOption,
  setCareerOption,
  residingCountry,
  setResidingCountry,
  spendingCapacity,
  setSpendingCapacity,
  isCollegeStudent,
  setIsCollegeStudent,
  currentClass,
  setCurrentClass,
  parentEmail,
  setParentEmail,
  willingToMoveAbroad,
  setWillingToMoveAbroad,
  moveAbroad,
  setMoveAbroad,
  preferredAbroadCountry,
  setPreferredAbroadCountry,
  desiredCareer,
  setDesiredCareer,
  previousExperience,
  setPreviousExperience,
  interestParagraph,
  setInterestParagraph,
  difficulty,
  setDifficulty,
}) => {
  const countryOptions = countryList().getData() as OptionType[];

  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#FF6500" : base.borderColor,
      boxShadow: state.isFocused ? "0 0 0 1px #FF6500" : base.boxShadow,
      borderRadius: "1rem",
      "&:hover": {
        borderColor: state.isFocused ? "#FF6500" : base.borderColor,
      },
    }),
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex justify-center items-center mb-16 mt-16">
        <div className={`transition-opacity duration-300 mr-4 ${careerOption === "known" ? "opacity-100" : "opacity-0"}`}>
          <img src="https://res.cloudinary.com/ditn9req1/image/upload/v1744969912/happy_dd79nt.png" alt="Known career" className="w-36 h-36 object-contain"/>
        </div>
        <div className="relative w-48 h-24">
          <input id="known" type="radio" value="known" checked={careerOption === "known"} onChange={() => setCareerOption("known")} className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer" required/>
          <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
            <label htmlFor="known" className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300">I know what career I want</label>
          </div>
        </div>
        <div className="relative w-48 h-24 ml-4">
          <input id="unknown" type="radio" value="unknown" checked={careerOption === "unknown"} onChange={() => setCareerOption("unknown")} className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer" required/>
          <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
            <label htmlFor="unknown" className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300">I'm not sure what to do</label>
          </div>
        </div>
        <div className={`transition-opacity duration-300 ml-0 ${careerOption === "unknown" ? "opacity-100" : "opacity-0"}`}>
          <img src="https://res.cloudinary.com/ditn9req1/image/upload/v1744969896/sad_mzj5qf.png" alt="Exploring careers" className="w-36 h-36 object-contain"/>
        </div>
      </div>

      <div className="mt-8">
        {careerOption === "known" && (
          <div className="p-2 rounded-lg">
            <h3 className="text-xl text-black font-bold mb-3">Great! You know your career path</h3>
            <p className="text-[#FF6500]">We'll help you achieve your specific career goals with a focused approach.</p>
          </div>
        )}
        {careerOption === "unknown" && (
          <div className="p-2 rounded-lg">
            <h3 className="text-xl text-black font-bold mb-3">Let's explore your options</h3>
            <p className="text-[#FF6500]">We'll help you discover potential career paths based on your interests and skills.</p>
          </div>
        )}
      </div>

      <p className="text-black font-semibold">Please answer the following common questions:</p>
      
      <div className="space-y-12">
        <div>
          <label className="block text-gray-800 mb-4">Residing Country:</label>
          <Select<OptionType, false, GroupBase<OptionType>> options={countryOptions} value={residingCountry} onChange={setResidingCountry} placeholder="Select your country..." required styles={customStyles} className="text-black mb-16 focus:outline-none focus:ring-0 cursor-pointer"/>
        </div>
        <div>
          <label className="block text-gray-800 mb-4">Spending Capacity: <label className="font-style: italic text-sm text-gray-400">(How much can you spend on your education to pursue this career?)</label></label>
          <input type="number" value={spendingCapacity} onChange={(e) => setSpendingCapacity(e.target.value)} placeholder="eg. 500000" className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]" required/>
        </div>
        <div>
          <label className="block text-gray-800 mb-4">I am a college student:</label>
          <div className="flex space-x-8 mb-16 mt-2">
            <label className="text-black mr-8"><input type="radio" name="collegeStudent" value="yes" checked={isCollegeStudent === true} onChange={() => setIsCollegeStudent(true)} required className="appearance-none h-4 w-4 border border-gray-400 rounded-full checked:bg-[#FF6500] checked:border-[#FF6500] focus:outline-none cursor-pointer mr-4"/>Yes</label>
            <label className="text-black"><input type="radio" name="collegeStudent" value="no" checked={isCollegeStudent === false} onChange={() => setIsCollegeStudent(false)} required className="appearance-none h-4 w-4 border border-gray-400 rounded-full checked:bg-[#FF6500] checked:border-[#FF6500] focus:outline-none cursor-pointer mr-4"/>No</label>
          </div>
        </div>
        <div>
          <label className="block text-gray-800 mb-4">Which class/standard do you study in?</label>
          <input type="text" value={currentClass} onChange={(e) => setCurrentClass(e.target.value)} placeholder="e.g., 10th, 12th, or college year (If in college, also mention the course opted.)" className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]" required/>
        </div>
        <div>
          <label className="block text-gray-800 mb-4">Share email id of someone you want to be accountable to. <label className="font-style: italic text-sm text-gray-400">(Parent, Guardian, Teacher or Friend)</label></label>
          <input type="text" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="e.g., parentemail@gmail.com" className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]" required/>
        </div>
        <div>
            <label className="block text-gray-800 mb-4">Are you willing to move abroad for study/work?</label>
            <div className={`relative w-36 h-10 rounded-full cursor-pointer mb-16 transition-all duration-200 ease-in-out ${willingToMoveAbroad ? "bg-green-500" : "bg-red-500"}`} onClick={() => setWillingToMoveAbroad(!willingToMoveAbroad)}>
                <span className={`absolute left-0 w-16 h-10 leading-10 text-center font-semibold ${willingToMoveAbroad ? "text-white" : "text-red-500"}`}>Yes</span>
                <span className={`absolute right-0 w-16 h-10 leading-10 text-center font-semibold ${!willingToMoveAbroad ? "text-white" : "text-green-500"}`}>No</span>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">{willingToMoveAbroad ? "✓" : "✕"}</span>
            </div>
            {willingToMoveAbroad && (
                <div className="mt-4">
                    <label className="block text-gray-800 mb-4">Please choose an option:</label>
                    <div className="flex space-x-6 mt-2">
                        <label className="text-black"><input type="radio" name="moveAbroad" value="yes" checked={moveAbroad === "yes"} onChange={() => setMoveAbroad("yes")} className="appearance-none h-4 w-4 border border-gray-400 rounded-full checked:bg-[#FF6500] checked:border-[#FF6500] focus:outline-none cursor-pointer mr-4" required/>I'll select my preferred country</label>
                        <label className="text-black"><input type="radio" name="moveAbroad" value="suggest" checked={moveAbroad === "suggest"} onChange={() => setMoveAbroad("suggest")} className="appearance-none h-4 w-4 border border-gray-400 rounded-full checked:bg-[#FF6500] checked:border-[#FF6500] focus:outline-none cursor-pointer mr-4" required/>Suggest best for me</label>
                    </div>
                    {moveAbroad === "yes" && (
                        <div className="mt-4">
                            <label className="block text-gray-800 mt-16 mb-2">Preferred Country Abroad:</label>
                            <Select<OptionType, false, GroupBase<OptionType>> options={countryOptions} value={preferredAbroadCountry} onChange={setPreferredAbroadCountry} placeholder="Select a country..." required className="text-black" styles={customStyles}/>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {careerOption === "known" ? (
        <div className="space-y-12">
          <div>
            <label className="block text-gray-800 mb-4 mt-8">What career do you want to pursue?</label>
            <input type="text" value={desiredCareer} onChange={(e) => setDesiredCareer(e.target.value)} placeholder="e.g., Astronaut" className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]" required/>
          </div>
          <div>
            <label className="block text-gray-800 mb-4">Previous experience or work done in this career (e.g., a home project):</label>
            <input type="text" value={previousExperience} onChange={(e) => setPreviousExperience(e.target.value)} placeholder="Describe your experience..." className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-20 focus:outline-none focus:ring-0 focus:border-[#FF6500]" required/>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-gray-800 mt-16">Tell us what you like doing the most:</label>
            <textarea value={interestParagraph} onChange={(e) => setInterestParagraph(e.target.value)} placeholder="Write about your interests, hobbies, or activities you enjoy (e.g., 'I love solving puzzles, building things with my hands, and helping my friends with their problems...')" className="mt-2 block w-full px-2 py-4 text-black border border-gray-300 rounded-[1rem] focus:outline-none focus:ring-0 focus:border-[#FF6500]" rows={4} minLength={300} maxLength={1200} required/>
            <p className="text-sm text-gray-500 mt-2 mb-20">300 &lt; <span className={interestParagraph.length >= 300 && interestParagraph.length <= 1200 ? "text-green-600" : "text-red-600"}>{interestParagraph.length}</span> &lt; 1200</p>
          </div>
        </div>
      )}

      <DifficultySelector difficulty={difficulty} setDifficulty={setDifficulty} />

      <div className="flex justify-center w-full">
        <button type="submit" disabled={isSubmitting} className="bg-white text-black py-5 px-12 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-orange-400 mt-8">
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default DashboardForm;