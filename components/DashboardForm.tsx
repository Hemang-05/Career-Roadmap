'use client';

import React from "react";
import Select, { GroupBase, StylesConfig } from "react-select";
import countryList from "react-select-country-list";
import DifficultySelector from "@/components/DifficultySelector";
import { Info } from 'lucide-react';

export type OptionType = { label: string; value: string };

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
      borderColor: state.isFocused ? "#fdc6a1" : "#fed7aa",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(254, 215, 170, 0.5)" : "none",
      borderRadius: "12px",
      backgroundColor: "#fff7ed", // bg-orange-50
      color: "#374151", // text-gray-700
      minHeight: "56px", // p-4 equivalent
      borderWidth: "2px",
      fontWeight: "200", // font-extralight
      padding: "4px 12px",
      transition: "all 0.3s ease",
      "&:hover": { 
        borderColor: state.isFocused ? "#fdc6a1" : "#fed7aa",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(254, 215, 170, 0.5)" : "none"
      },
      outline: "none",
    }),
    menuList: (base) => ({
      ...base,
      // Custom scrollbar styles
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#ffedd5', // orange-100
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#fed7aa', // orange-200
        borderRadius: '10px',
        border: '2px solid #fff7ed', // orange-50
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#fdc6a1', // focus orange color
      },
      // For Firefox
      scrollbarWidth: 'thin',
      scrollbarColor: '#fed7aa #ffedd5',
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af", // placeholder-gray-400
      fontWeight: "200", // font-extralight
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151", // text-gray-700
      fontWeight: "200", // font-extralight
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#fdc6a1" : state.isFocused ? "#ffedd5" : "#fff7ed", // orange-50 background
      color: state.isSelected ? "#374151" : "#374151", // text-gray-700
      fontWeight: "200", // font-extralight
      padding: "12px 16px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#fdc6a1" : "#ffedd5", // orange-100 on hover
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#fff7ed", // bg-orange-50
      border: "2px solid #fed7aa", // border-orange-200
      borderRadius: "12px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const isBrowser = typeof window !== 'undefined';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-16 xl:px-24">
      <form onSubmit={onSubmit} className="max-w-7xl mx-auto space-y-6">
        {/* Column Layout for Independent Card Movement */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Card 1: Career Option + Interest Paragraph */}
            <div className="bg-white rounded-3xl shadow-lg backdrop-blur p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[400px] flex flex-col">
              <p className="text-gray-800 mb-6 text-xl">What best describes you?</p>
              <div className="flex flex-col mt-8 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setCareerOption('known')}
                  className={`py-4 px-6 rounded-xl border-2 transition-all duration-300 font-thin text-lg ${
                    careerOption === 'known'
                      ? 'bg-[#FF6500] text-white border-[#FF6500] shadow-lg transform scale-105'
                      : 'bg-orange-50 text-gray-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                  }`}
                >I know what career I want</button>
                <button
                  type="button"
                  onClick={() => setCareerOption('unknown')}
                  className={`py-4 px-6 rounded-xl border-2 transition-all duration-300 font-thin text-lg ${
                    careerOption === 'unknown'
                      ? 'bg-[#FF6500] text-white border-[#FF6500] shadow-lg transform scale-105'
                      : 'bg-orange-50 text-gray-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                  }`}
                >I'm not sure what to do</button>
              </div>
              
              {careerOption === 'unknown' && (
                <div className="border-t-2 border-orange-200 pt-6 flex-1">
                  <label className="text-gray-800 font-thin mb-3 block text-lg">Tell us what you like doing</label>
                  <textarea
                    value={interestParagraph}
                    onChange={e => setInterestParagraph(e.target.value)}
                    placeholder="Write about your interests, hobbies, things you enjoy..."
                    rows={4}
                    minLength={300}
                    maxLength={1200}
                    required
                    className="w-full border-2 border-orange-200 rounded-xl p-4 focus:border-[#fdc6a1] focus:outline-none focus:ring-2 focus:ring-orange-100 bg-orange-50 text-gray-700 placeholder-gray-400 transition-all duration-300 font-extralight resize-none outline-none"
                  />
                  <p className="mt-3 text-sm font-extralight text-gray-600">
                    300 &lt;{' '}
                    <span className={interestParagraph.length >= 300 && interestParagraph.length <= 1200 ? 'text-green-600 font-extralight' : 'text-red-600 font-thin'}>
                      {interestParagraph.length}
                    </span>{' '}
                    &lt; 1200 characters
                  </p>
                </div>
              )}
            </div>

            {/* Card 3: Spending Capacity + Accountability Email */}
            <div className="bg-white rounded-3xl shadow-lg backdrop-blur p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[400px] flex flex-col">
              <div className="mb-12">
              <div className="flex items-center mb-3">
                <label className="text-gray-800 mb-3 block text-xl">Spending Capacity</label>
                <div className="relative ml-4 mb-3 group">
                  <Info 
                    size={16} 
                    className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                  />
                  <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Enter you education budget, or how much you can spend on your career.
                  </div>
                </div>
                </div>
                <input
                  type="number"
                  value={spendingCapacity}
                  onChange={e => setSpendingCapacity(e.target.value)}
                  placeholder="e.g. 500000"
                  required
                  className="w-full border-2 border-orange-200 rounded-xl p-4 focus:border-[#fdc6a1] focus:outline-none focus:ring-2 focus:ring-orange-100 bg-orange-50 text-gray-700 placeholder-gray-400 transition-all duration-300 font-extralight resize-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
                />
              </div>

              <div className="border-t-2 border-orange-200 pt-6">
              <div className="flex items-center mb-3">
              <label className="text-gray-800 mb-3 block text-xl">Accountability Email</label>
              <div className="relative ml-4 mb-3 group">
                  <Info 
                    size={16} 
                    className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                  />
                  <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Enter email of someone who can be accountable for you. Guardian, Friend, Teacher or Sibling.
                  </div>
                </div>
              </div>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                  placeholder="e.g. parent@example.com"
                  required
                  className="w-full border-2 border-orange-200 rounded-xl p-4 focus:border-[#fdc6a1] focus:outline-none focus:ring-2 focus:ring-orange-100 bg-orange-50 text-gray-700 placeholder-gray-400 transition-all duration-300 font-extralight resize-none outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-6">
            {/* Card 2: Residing Country + Move Abroad */}
            <div className="bg-white rounded-3xl shadow-lg backdrop-blur p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[400px] flex flex-col">
              <div className="mb-8 ">
                <label className="text-gray-800 mb-8 block text-xl">Residing Country</label>
                <Select
                  options={countryOptions}
                  value={residingCountry}
                  onChange={setResidingCountry}
                  placeholder="Select your country..."
                  required
                  styles={customStyles}
                  menuPortalTarget={isBrowser ? document.body : undefined}
                  menuPosition="fixed"
                />
              </div>

              <div className="border-t-2 border-orange-200 mt-2">
                <label className="text-gray-800 mt-8 mb-4 block text-xl">Move Abroad?</label>
                <div className="flex mb-6">
                  <button
                    type="button"
                    onClick={() => setWillingToMoveAbroad(true)}
                    className={`px-6 py-3 rounded-l-xl transition-all duration-300 font-semibold text-lg border-2 ${
                      willingToMoveAbroad ? 'bg-[#FF6500] text-white shadow-lg' : 'bg-grey-100 text-gray-700 border-grey-200  hover:bg-orange-100'
                    }`}
                  >Yes</button>
                  <button
                    type="button"
                    onClick={() => setWillingToMoveAbroad(false)}
                    className={`px-6 py-3 rounded-r-xl transition-all duration-300 font-semibold text-lg border-2 border-l-0 ${
                      willingToMoveAbroad === false ? 'bg-[#FF6500] text-white shadow-lg' : 'bg-grey-100 text-gray-700 border-grey-200  hover:bg-orange-100'
                    }`}
                  >No</button>
                </div>
                {willingToMoveAbroad && (
                  <div className="space-y-4">
                    <label className="text-gray-800 mb-3 block text-lg">Abroad Preference</label>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <label className="flex items-center text-gray-700 font-light">
                        <input 
                          type="radio" 
                          name="moveAbroad" 
                          value="yes" 
                          checked={moveAbroad === 'yes'} 
                          onChange={() => setMoveAbroad('yes')} 
                          className="peer sr-only"
                          required 
                        />
                        {/* This is our custom-styled radio button circle */}
                        <span className="w-5 h-5 mr-3 border-2 border-gray-400 rounded-full flex items-center justify-center transition-colors
                                        peer-checked:border-[#FF6500] peer-checked:bg-[#FF6500]">
                        </span>
                        I'll select
                      </label>
                      <label className="flex items-center text-gray-700 font-light">
                        <input 
                          type="radio" 
                          name="moveAbroad" 
                          value="suggest" 
                          checked={moveAbroad === 'suggest'} 
                          onChange={() => setMoveAbroad('suggest')} 
                          className="peer sr-only" 
                          required 
                        />
                        {/* This is our custom-styled radio button circle */}
                        <span className="w-5 h-5 mr-3 border-2 border-gray-400 rounded-full flex items-center justify-center transition-colors
                                        peer-checked:border-[#FF6500] peer-checked:bg-[#FF6500]">
                        </span>
                        Suggest
                      </label>
                    </div>
                    {moveAbroad === 'yes' && (
                      <Select
                        options={countryOptions}
                        value={preferredAbroadCountry}
                        onChange={setPreferredAbroadCountry}
                        placeholder="Select preferred country"
                        required
                        styles={customStyles}
                        menuPortalTarget={isBrowser ? document.body : undefined}
                        menuPosition="fixed"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: College Student + Current Class */}
            <div className="bg-white rounded-3xl shadow-lg backdrop-blur p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[400px] flex flex-col">
              <div className="mb-4 pt-1">
                <label className="text-gray-800 mb-6 block text-xl">Are you a college student?</label>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setIsCollegeStudent(true)}
                    className={`px-6 py-3 rounded-l-xl transition-all duration-300 font-semibold text-lg border-2 ${
                      isCollegeStudent ? 'bg-[#FF6500] text-white shadow-lg' : 'bg-grey-100 text-gray-700 border-grey-200  hover:bg-orange-100'
                    }`}
                  >Yes</button>
                  <button
                    type="button"
                    onClick={() => setIsCollegeStudent(false)}
                    className={`px-6 py-3 rounded-r-xl transition-all duration-300 font-semibold text-lg border-2 border-l-0 ${
                      isCollegeStudent === false ? 'bg-[#FF6500] text-white shadow-lg' : 'bg-grey-100 text-gray-700 border-grey-200  hover:bg-orange-100'
                    }`}
                  >No</button>
                </div>
              </div>

              <div className="border-t-2 border-orange-200 mt-8 pt-6 flex-1">
              <div className="flex items-center mb-3">
              <label className="text-gray-800 mb-3 block text-xl">Class/College Year & Course</label>
              <div className="relative ml-4 mb-3 group">
                  <Info 
                    size={16} 
                    className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                  />
                  <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Enter your current class if in school, specify stream if in 11th and 12th.<br></br>
                  If in college enter current year and course pursuing.
                  </div>
                </div>
              </div>
                <input
                  type="text"
                  value={currentClass}
                  onChange={e => setCurrentClass(e.target.value)}
                  placeholder="e.g. 12th Science/Arts, 1st year B.Tech"
                  required
                  className="w-full border-2 border-orange-200 rounded-xl p-4 focus:border-[#fdc6a1] focus:outline-none focus:ring-2 focus:ring-orange-100 bg-orange-50 text-gray-700 placeholder-gray-400 transition-all duration-300 font-extralight resize-none outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Desired Career + Previous Experience (Only if careerOption is 'known') */}
        {careerOption === 'known' && (
          <div className="bg-white rounded-3xl shadow-lg backdrop-blur p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
              <div className="flex items-center mb-3">
                <label className="text-gray-800  mb-3 block text-xl">Desired Career</label>
                <div className="relative ml-4 mb-3 group">
                  <Info 
                    size={16} 
                    className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                  />
                  <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Enter the Career you want to pursue.
                  </div>
                </div>

                </div>
                <input
                  type="text"
                  value={desiredCareer}
                  onChange={e => setDesiredCareer(e.target.value)}
                  placeholder="e.g. Astronaut, Software Engineer"
                  required
                  className="w-full border-2 border-orange-200 rounded-xl p-4 focus:border-[#fdc6a1] focus:outline-none focus:ring-2 focus:ring-orange-100 bg-orange-50 text-gray-700 placeholder-gray-400 transition-all duration-300 font-extralight resize-none outline-none"
                />
              </div>
              
              <div>
              <div className="flex items-center mb-3">
                <label className="text-gray-800  mb-3 block text-xl">Previous Experience</label>
                <div className="relative ml-4 mb-3 group">
                  <Info 
                    size={16} 
                    className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                  />
                  <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Enter anything you have learnt or achieved related to you desired career.
                  </div>
                </div>

                </div>
                <input
                  type="text"
                  value={previousExperience}
                  onChange={e => setPreviousExperience(e.target.value)}
                  placeholder="Describe your experience..."
                  required
                  className="w-full border-2 border-orange-200 rounded-xl p-4 focus:border-[#fdc6a1] focus:outline-none focus:ring-2 focus:ring-orange-100 bg-orange-50 text-gray-700 placeholder-gray-400 transition-all duration-300 font-extralight resize-none outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Difficulty Selector */}
        <div className="x">
          <DifficultySelector difficulty={difficulty} setDifficulty={setDifficulty} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#FF6500] to-[#FF8500] text-white py-4 px-12 rounded-3xl  hover:from-[#FF5500] hover:to-[#FF7500] hover:border-orange-400 transition-all duration-300 shadow-xl hover:shadow-2xl font-light text-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Form'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardForm;