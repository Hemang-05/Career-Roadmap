"use client";
import React from "react";
import Select, { GroupBase, StylesConfig } from "react-select";
import countryList from "react-select-country-list";
import { Info } from 'lucide-react';

export type OptionType = { label: string; value: string };

interface FormComponentProps {
// User and UI state
user: any;
hasRoadmap: boolean;
onSubmit: (e: React.FormEvent) => void;
isSubmitting: boolean;

// Chatbot integration
determinedCareer?: string;
userPath: 'aware' | 'confused' | null;

// ✅ SIMPLIFIED PROPS (removed legacy ones)
residingCountry: OptionType | null;
setResidingCountry: (value: OptionType | null) => void;
spendingCapacity: string;
setSpendingCapacity: (value: string) => void;
parentEmail: string;
setParentEmail: (value: string) => void;
willingToMoveAbroad: boolean | null;
setWillingToMoveAbroad: (value: boolean | null) => void;
moveAbroad: "yes" | "suggest";
setMoveAbroad: (value: "yes" | "suggest") => void;
preferredAbroadCountry: OptionType | null;
setPreferredAbroadCountry: (value: OptionType | null) => void;

// ✅ SIMPLE CAREER FIELD
desiredCareer: string;
setDesiredCareer: (value: string) => void;

difficulty: "easy" | "medium" | "hard" | null;
setDifficulty: (value: "easy" | "medium" | "hard" | null) => void;

// NEW 16 FIELDS
educationalStage: string;
setEducationalStage: (value: string) => void;
schoolGrade: string;
setSchoolGrade: (value: string) => void;
schoolStream: string;
setSchoolStream: (value: string) => void;
collegeYear: string;
setCollegeYear: (value: string) => void;
collegeDegree: string;
setCollegeDegree: (value: string) => void;
practicalExperience: string;
setPracticalExperience: (value: string) => void;
academicStrengths: string;
setAcademicStrengths: (value: string) => void;
extracurricularActivities: string;
setExtracurricularActivities: (value: string) => void;
industryKnowledgeLevel: string;
setIndustryKnowledgeLevel: (value: string) => void;
preferredLearningStyle: string;
setPreferredLearningStyle: (value: string) => void;
roleModelInfluences: string;
setRoleModelInfluences: (value: string) => void;
culturalFamilyExpectations: string;
setCulturalFamilyExpectations: (value: string) => void;
mentorshipAndNetworkStatus: string;
setMentorshipAndNetworkStatus: (value: string) => void;
preferredLanguage: string;
setPreferredLanguage: (value: string) => void;
preferredWorkEnvironment: string;
setPreferredWorkEnvironment: (value: string) => void;
longTermAspirations: string;
setLongTermAspirations: (value: string) => void;
}

export default function FormComponent({
user,
hasRoadmap,
onSubmit,
isSubmitting,
determinedCareer,
userPath,
residingCountry,
setResidingCountry,
spendingCapacity,
setSpendingCapacity,
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
difficulty,
setDifficulty,
// NEW FIELDS
educationalStage,
setEducationalStage,
schoolGrade,
setSchoolGrade,
schoolStream,
setSchoolStream,
collegeYear,
setCollegeYear,
collegeDegree,
setCollegeDegree,
practicalExperience,
setPracticalExperience,
academicStrengths,
setAcademicStrengths,
extracurricularActivities,
setExtracurricularActivities,
industryKnowledgeLevel,
setIndustryKnowledgeLevel,
preferredLearningStyle,
setPreferredLearningStyle,
roleModelInfluences,
setRoleModelInfluences,
culturalFamilyExpectations,
setCulturalFamilyExpectations,
mentorshipAndNetworkStatus,
setMentorshipAndNetworkStatus,
preferredLanguage,
setPreferredLanguage,
preferredWorkEnvironment,
setPreferredWorkEnvironment,
longTermAspirations,
setLongTermAspirations,
}: FormComponentProps) {

const countryOptions = countryList().getData() as OptionType[];
const isBrowser = typeof window !== 'undefined';

const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#d1d5db" : "#e5e7eb", // gray-300 : gray-200
    boxShadow: "none",
    borderRadius: "12px", // rounded-xl
    backgroundColor: "#ffffff", // bg-white
    color: "#374151", // text-gray-700
    minHeight: "56px",
    borderWidth: "1px", // border (default)
    fontWeight: "200", // font-extralight
    padding: "4px 12px", // p-4 equivalent
    transition: "all 0.3s ease", // transition-all duration-300
    "&:hover": {
      borderColor: state.isFocused ? "#d1d5db" : "#e5e7eb",
    },
    outline: "none", // outline-none
  }),
  
  menuList: (base) => ({
    ...base,
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': { background: '#f3f4f6', borderRadius: '10px' }, // gray-100
    '&::-webkit-scrollbar-thumb': { background: '#d1d5db', borderRadius: '10px', border: '2px solid #ffffff' }, // gray-300
    '&::-webkit-scrollbar-thumb:hover': { background: '#9ca3af' }, // gray-400
    scrollbarWidth: 'thin',
    scrollbarColor: '#d1d5db #f3f4f6',
  }),
  
  placeholder: (base) => ({ 
    ...base, 
    color: "#E5E7EB", // placeholder-gray-200
    fontWeight: "200" // font-extralight
  }),
  
  singleValue: (base) => ({ 
    ...base, 
    color: "#374151", // text-gray-700
    fontWeight: "200" // font-extralight
  }),
  
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#e5e7eb" : state.isFocused ? "#f9fafb" : "#ffffff", // gray-200 : gray-50 : white
    color: "#374151", // text-gray-700
    fontWeight: "200", // font-extralight
    padding: "12px 16px",
    "&:hover": { 
      backgroundColor: state.isSelected ? "#e5e7eb" : "#f9fafb" // gray-200 : gray-50
    },
  }),
  
  menu: (base) => ({
    ...base,
    backgroundColor: "#ffffff", // bg-white
    border: "1px solid #e5e7eb", // border-gray-200
    borderRadius: "12px", // rounded-xl
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    zIndex: 9999,
  }),
  
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

return (
<div className="min-h-screen bg-[#ffff]">
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-16 xl:px-52">
        

      {/* Form */}
      <form onSubmit={onSubmit} className="max-w-7xl mt-24 space-y-6">
  {/* ✅ ROW 1: No changes (Career + Practical, Residing Country, Spending + Email) */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Card 1: Career + Practical Experience */} 
    <div className="border p-4 sm:px-10 sm:py-8 sm:rounded-[4rem] rounded-3xl ">      
      {/* Career Section    relative p-4 shadow-lg sm:rounded-3xl sm:p-20 backdrop-blur-xl border border-gray-200/50 min-h-[300px] bg-gradient-to-br from-gray-50/10 via-gray-200/60 to-gray-400/40*/}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <label className="text-gray-800 text-base ">What career you want to pursue?</label>
          <div className="relative ml-4 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Enter the specific career you want to pursue.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={desiredCareer}
          onChange={e => setDesiredCareer(e.target.value)}
          placeholder="e.g. Software Engineer, Doctor, Architect"
          required
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
      </div>

      {/* Practical Experience Section  bg-slate-200/60 */} 
      <div>
        <div className="flex items-center mb-6">
          <label className="text-gray-800 text-base">Practical Experience</label>
          <div className="relative ml-4 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Describe any hands-on experience, projects, internships, or practical work related to your desired career.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={practicalExperience}
          onChange={e => setPracticalExperience(e.target.value)}
          placeholder="Describe any projects, internships, certifications, or hands-on experience..."
          required
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
      </div>
    </div>

    {/* Card 2: Location & Abroad */}
    <div className="glassmorphism-card">
      <div className="mb-8">
        <label className="text-gray-800 mb-8 block text-base">Residing Country</label>
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

      <label className="text-gray-800 mt-8 mb-4 block text-base">Move Abroad?</label>
<div className="flex items-center mb-6">
  <label className="flex items-center cursor-pointer select-none">
    <div className="relative">
      <input 
        type="checkbox" 
        checked={willingToMoveAbroad || false}
        onChange={(e) => setWillingToMoveAbroad(e.target.checked)}
        className="peer sr-only" 
      />
      <div className="block h-5 rounded-full bg-gray-200 w-8 transition-colors duration-300 peer-checked:bg-[#c7ffe9]"></div>
      <div className="absolute w-3 h-3 transition-all duration-300 bg-white rounded-full left-1 top-1 peer-checked:translate-x-full shadow-md"></div>
    </div>
    <span className="ml-3 text-gray-700 text-sm font-light">
      {willingToMoveAbroad ? 'Yes, willing to move abroad' : 'No, I prefer to stay'}
    </span>
  </label>
</div>
{willingToMoveAbroad && (
  <div className="space-y-4">
    <label className="text-gray-800 mb-3 block text-base">Abroad Preference</label>
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <label className="flex items-center text-gray-700 text-sm font-light">
        <input 
          type="radio" 
          name="moveAbroad" 
          value="yes" 
          checked={moveAbroad === 'yes'} 
          onChange={() => setMoveAbroad('yes')} 
          className="peer sr-only"
          required 
        />
        <span className="w-4 h-4 mr-3  border-2 border-gray-300 rounded-full flex items-center justify-center transition-colors peer-checked:border-gray-300 peer-checked:bg-[#c7ffe9]">
        </span>
        I'll select
      </label>
      <label className="flex items-center text-gray-700 text-sm font-light">
        <input 
          type="radio" 
          name="moveAbroad" 
          value="suggest" 
          checked={moveAbroad === 'suggest'} 
          onChange={() => setMoveAbroad('suggest')} 
          className="peer sr-only" 
          required 
        />
        <span className="w-4 h-4 mr-3 border-2 border-gray-300 rounded-full flex items-center justify-center transition-colors peer-checked:border-gray-300 peer-checked:bg-[#c7ffe9]">
        </span>
        Suggest
      </label>
    </div>
    {moveAbroad === 'yes' && (
      <Select
        options={countryOptions}
        value={preferredAbroadCountry}
        onChange={setPreferredAbroadCountry}
        placeholder="Select country"
        required
        styles={customStyles}
        menuPortalTarget={isBrowser ? document.body : undefined}
        menuPosition="fixed"
      />
    )}
  </div>
)}
    </div>

    {/* Card 3: Spending & Email */}
    <div className="sm:px-10 sm:py-8 p-4">
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <label className="text-gray-800 mb-3 block text-base">Spending Capacity</label>
          <div className="relative ml-4 mb-3 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Enter your education budget, or how much you can spend on your career.
            </div>
          </div>
        </div>
        <input
          type="number"
          value={spendingCapacity}
          onChange={e => setSpendingCapacity(e.target.value)}
          placeholder="e.g. 500000"
          required
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
      </div>

        <div className="flex items-center mb-3">
          <label className="text-gray-800 mb-3 block text-base">Accountability Email</label>
          <div className="relative ml-4 mb-3 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
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
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
    </div>
  </div>

  {/* ✅ ROW 2: Educational Background, Academic + Extracurricular, Role Model */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Card 4: Educational Background */}
    <div className="glassmorphism-card">
      <div className="flex items-center mb-6">
        <p className="text-gray-800 text-base">Educational Background</p>
        <div className="relative ml-4 group">
          <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
          <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Select your current educational stage to help us tailor your roadmap.
          </div>
        </div>
      </div>
      
      {/* Educational Stage Selection */}
      <div className="mb-6">
        <label className="text-gray-800 mb-4 block text-sm font-light">Current Educational Stage</label>
        <div className="grid grid-cols-2 gap-3">
          {['School', 'College', 'Self-taught', 'Working'].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => {
                  const stageValue = stage.toLowerCase();
                  setEducationalStage(stageValue);
                  
                  // Clear irrelevant data immediately
                  if (stageValue === 'school') {
                    setCollegeYear('');
                    setCollegeDegree('');
                  } else if (stageValue === 'college') {
                    setSchoolGrade('');
                    setSchoolStream('');
                  } else {
                    // Clear both for self-taught/working
                    setSchoolGrade('');
                    setSchoolStream('');
                    setCollegeYear('');
                    setCollegeDegree('');
                  }
                }}
              className={`py-2 rounded-3xl font-light text-xs ${
                educationalStage === stage.toLowerCase()
                  ? 'bg-slate-200 text-gray-500'
                  : 'bg-transparent border text-gray-300 text-xs'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* School Fields */}
      {educationalStage === 'school' && (
        <div className="space-y-4 pt-6">
          <div>
            <label className="text-gray-800 mb-3 block text-sm font-light">Current Grade/Class</label>
            <input
              type="text"
              value={schoolGrade}
              onChange={e => setSchoolGrade(e.target.value)}
              placeholder="e.g. 8th, 9th, 10th, 11th, 12th"
              required
              className="w-full border rounded-xl p-2 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setSchoolGrade('11th')} className="px-3 py-1 text-xs bg-transparent border text-gray-300  rounded-lg transition-colors">11th</button>
              <button type="button" onClick={() => setSchoolGrade('12th')} className="px-3 py-1 text-xs bg-transparent border text-gray-300  rounded-lg transition-colors">12th</button>
            </div>
          </div>

          {(schoolGrade === '11th' || schoolGrade === '12th') && (
            <div>
              <label className="text-gray-800 mb-3 block text-sm font-thin">Stream</label>
              <div className="flex gap-2">
                {['Science', 'Commerce', 'Arts'].map((stream) => (
                  <button
                    key={stream}
                    type="button"
                    onClick={() => setSchoolStream(stream.toLowerCase())}
                    className={`py-2 px-2 rounded-3xl font-thin text-xs ${
                      schoolStream === stream.toLowerCase()
                        ? 'bg-slate-200 text-gray-400  '
                        : 'bg-transparent border text-gray-400'
                    }`}
                  >
                    {stream}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* College Fields */}
      {educationalStage === 'college' && (
        <div className="space-y-4 pt-6">
          <div>
            <label className="text-gray-800 mb-3 block text-sm font-light">College Year</label>
            <div className="grid grid-cols-2 gap-2">
              {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'].map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setCollegeYear(year.toLowerCase().replace(' ', ''))}
                  className={`py-2 rounded-3xl font-light text-xs ${
                    collegeYear === year.toLowerCase().replace(' ', '')
                      ? 'bg-slate-200 text-gray-500 '
                      : 'bg-transparent border text-gray-300 text-xs '
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-800 mb-3 block text-sm font-light">Degree/Course</label>
            <input
              type="text"
              value={collegeDegree}
              onChange={e => setCollegeDegree(e.target.value)}
              placeholder="e.g. B.Tech CSE, B.Com, MBA Finance"
              required
              className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
            />
          </div>
        </div>
      )}
    </div>

    {/* Card 5: Academic Strengths + Extracurricular Activities */}
    <div className="sm:px-10 sm:py-8 p-4">
      {/* Academic Strengths Section */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <label className="text-gray-800 text-base ">Academic Strengths</label>
          <div className="relative ml-4 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              List your strongest academic subjects or areas where you excel.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={academicStrengths}
          onChange={e => setAcademicStrengths(e.target.value)}
          placeholder="e.g. Mathematics, Physics, Literature, Computer Science, Business Studies..."
          required
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
      </div>

      {/* Extracurricular Activities Section */}
        <div className="flex items-center mb-6">
          <label className="text-gray-800 text-base">Extracurricular Activities</label>
          <div className="relative ml-4 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              List activities outside formal education like sports, clubs, volunteering, hobbies, competitions.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={extracurricularActivities}
          onChange={e => setExtracurricularActivities(e.target.value)}
          placeholder="e.g. Debate club, robotics team, sports, music, volunteer work, coding competitions..."
          required
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
    </div>

    {/* Card 6: Role Model Influences + Long Term Aspirations */}
    <div className="border p-4 sm:px-10 sm:py-8 sm:rounded-[4rem] rounded-3xl">
      {/* Role Model Influences Section */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <label className="text-gray-800 text-base">Role Model Influences</label>
          <div className="relative ml-4 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Mention people who inspire your career choice - professionals, leaders, or mentors you admire.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={roleModelInfluences}
          onChange={e => setRoleModelInfluences(e.target.value)}
          placeholder="e.g. Elon Musk for innovation, local teacher who inspired me, industry leaders I follow..."
          required
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
      </div>

      {/* Long Term Aspirations Section */}
        <div className="flex items-center mb-6">
          <label className="text-gray-800 text-base">Long Term Aspirations</label>
          <div className="relative ml-4 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              What are your bigger goals beyond your immediate career? Think 10-15 years ahead.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={longTermAspirations}
          onChange={e => setLongTermAspirations(e.target.value)}
          placeholder="e.g. Start my own company, become a university researcher, make a social impact, achieve financial independence..."
          required
          className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
        />
    </div>
  </div>

  {/* ✅ ROW 3: Preferred Language, Preferred Learning Style, Industry Knowledge Level */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Card 7: Preferred Language */}
    <div className="sm:px-10 sm:py-8 p-4">
      <div className="flex items-center mb-6">
        <label className="text-gray-800 text-base">Preferred Learning Style</label>
        <div className="relative ml-4 group">
          <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
          <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            How do you prefer to learn and acquire new skills?
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 mb-6 gap-3">
        {[
          { value: 'hands-on', label: 'Hands-on Projects' },
          { value: 'courses', label: 'Online Courses' },
          { value: 'books', label: 'Books & Theory' },
          { value: 'competitions', label: 'Competitions' }
        ].map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => setPreferredLearningStyle(style.value)}
            className={`py-3 px-4 rounded-3xl font-light text-xs text-center ${
              preferredLearningStyle === style.value
                ? 'bg-slate-200 text-slate-500'
                : 'bg-transparent border text-gray-300 text-xs '
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>

      {/* Language Section */}
  <div className="mt-4">
    <div className="flex items-center mb-6">
      <label className="text-gray-800 text-base">Preferred Language</label>
      <div className="relative ml-4 group">
            <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
            <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Select the language you prefer to watch Youtube tutorials in.
            </div>
          </div>
    </div>
    <input
      type="text"
      value={preferredLanguage}
      onChange={e => setPreferredLanguage(e.target.value)}
      placeholder="e.g. English, Hindi, Spanish, French..."
      required
      className="w-full border rounded-xl p-4 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-sm font-extralight outline-none"
    />
  </div>
    </div>

    {/* Card 9: Industry Knowledge Level */}
    <div className="border p-4 sm:px-10 sm:py-8 sm:rounded-[4rem] rounded-3xl">
      <div className="flex items-center mb-6">
        <label className="text-gray-800 text-base">Industry Knowledge Level</label>
        <div className="relative ml-4 group">
          <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
          <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            How much do you know about your target career field and industry?
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: 'beginner', label: 'Beginner', desc: 'Just starting to explore this field' },
          { value: 'moderate', label: 'Moderate Research', desc: 'Done some research and learning' },
          { value: 'well-informed', label: 'Well-informed', desc: 'Good understanding of the industry' }
        ].map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => setIndustryKnowledgeLevel(level.value)} 
            className={`px-4 py-2 rounded-3xl font-light text-xs text-left ${
              industryKnowledgeLevel === level.value
                ? 'bg-slate-200 text-gray-500'
                : 'bg-transparent border text-gray-300 text-xs'
            }`}
          >
            <div className="font-light text-sm">{level.label}</div>
            <div className="text-xs">{level.desc}</div>
          </button>
        ))}
      </div>
    </div>
    
    {/* Card 10: Work Environment */}
    <div className="glassmorphism-card">
      <div className="flex items-center mb-6">
        <label className="text-gray-800 text-base">Work Environment</label>
        <div className="relative ml-4 group">
          <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
          <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            What type of work environment appeals to you most?
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'corporate', label: 'Corporate' },
          { value: 'startup', label: 'Startup' },
          { value: 'freelance', label: 'Freelance' },
          { value: 'remote', label: 'Remote' },
          { value: 'non-profit', label: 'Non-profit' },
          { value: 'academic', label: 'Academic' }
        ].map((environment) => (
          <button
            key={environment.value}
            type="button"
            onClick={() => setPreferredWorkEnvironment(environment.value)} 
            className={`py-3 px-4 rounded-3xl font-light text-xs ${
              preferredWorkEnvironment === environment.value
                ? 'bg-slate-200 text-gray-500'
                : 'bg-transparent border text-gray-300 text-xs'
            }`}
          >
            {environment.label}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* ✅ ROW 4: Work Environment, Family Expectations, Mentorship & Network */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Card 11: Family Expectations */}
    <div className="border p-4 sm:px-10 sm:py-8 sm:rounded-[4rem] rounded-3xl">
      <div className="flex items-center mb-6">
        <label className="text-gray-800 text-base">Family Expectations</label>
        <div className="relative ml-4 group">
          <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
          <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            How does your family influence your career decisions?
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: 'fully-supportive', label: 'Fully Supportive', desc: 'Complete support for my choices' },
          { value: 'prefers-stable', label: 'Prefers Stable Jobs', desc: 'Want secure, traditional careers' },
          { value: 'traditional', label: 'Traditional Expectations', desc: 'Specific career preferences' },
          { value: 'high-pressure', label: 'High Pressure', desc: 'Strong expectations and pressure' }
        ].map((expectation) => (
          <button
            key={expectation.value}
            type="button"
            onClick={() => setCulturalFamilyExpectations(expectation.value)}  // //py-2 rounded-3xl font-light text-xs
            className={`px-4 p-2 rounded-3xl text-left ${
              culturalFamilyExpectations === expectation.value
                ? 'bg-slate-200 text-gray-500'
                : 'bg-transparent border text-gray-300'
            }`}
          >
            <div className="font-normal text-xs">{expectation.label}</div>
            <div className="font-thin text-xs">{expectation.desc}</div>
          </button>
        ))}
      </div>
    </div>

    {/* Card 12: Mentorship & Network */} 
    <div className="glassmorphism-card">
      <div className="flex items-center mb-6">
        <label className="text-gray-800 text-base">Mentorship & Network</label>
        <div className="relative ml-4 group">
          <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
          <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            What's your current level of professional connections and mentorship?
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: 'no-mentor', label: 'No Mentor', desc: 'Starting fresh, no connections' },
          { value: 'family-field', label: 'Family in Field', desc: 'Have family members in industry' },
          { value: 'some-connections', label: 'Some Connections', desc: 'Few industry contacts' },
          { value: 'active-communities', label: 'Active in Communities', desc: 'Part of industry forums/groups' }
        ].map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => setMentorshipAndNetworkStatus(status.value)}
            className={`px-4 p-2 rounded-3xl text-left text-xs ${
              mentorshipAndNetworkStatus === status.value
                ? 'bg-slate-200 text-gray-500'
                : 'bg-transparent border text-gray-300 text-xs'
            }`}
          >
            <div className="font-normal">{status.label}</div>
            <div className="font-thin">{status.desc}</div>
          </button>
        ))}
      </div>
    </div>

    {/* Difficulty Selection Card */}
    <div className="sm:px-10 sm:py-8 p-4">
  <div className="flex items-center mb-6">
    <label className="text-gray-800 text-base">Learning Difficulty</label>
    <div className="relative ml-4 group">
      <Info size={16} className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100" />
      <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-sm w-48 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Choose how intensive you want your learning journey to be.
      </div>
    </div>
  </div>
  
  <div className="grid grid-cols-1 gap-3 flex-1">
    {[
      { 
        value: 'easy' as const, // ✅ Add 'as const'
        label: 'Easy', 
        desc: 'Steady pace',
        success: '40-50% success boost'
      },
      { 
        value: 'medium' as const, // ✅ Add 'as const'
        label: 'Medium', 
        desc: 'Balanced approach',
        success: '60-70% success boost'
      },
      { 
        value: 'hard' as const, // ✅ Add 'as const'
        label: 'Hard', 
        desc: 'Intensive learning',
        success: '80-90% success boost'
      }
    ].map((diff) => (
      <button
        key={diff.value}
        type="button"
        onClick={() => setDifficulty(diff.value)} 
        className={`px-4 p-2 rounded-3xl text-left ${
          difficulty === diff.value
            ? 'bg-slate-200 text-gray-500'
            : 'bg-transparent border text-gray-300 '
        }`}
      >
        <div className="font-normal text-xs">{diff.label}</div>
        <div className="text-xs font-extralight">{diff.desc}</div>
        <div className="text-xs font-thin">{diff.success}</div>
      </button>
    ))}
  </div>
</div>
  </div>

  {/* Difficulty Selector */}
  {/* <div>
    <DifficultySelector difficulty={difficulty} setDifficulty={setDifficulty} />
  </div> */}

  {/* Submit Button */}
  <div className="flex justify-center pt-6">
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-80% max-w-lg bg-gray-500/5 backdrop-blur-md text-gray-700 py-4 px-6 rounded-full border border-gray-200 transition-all duration-300 font-light hover:shadow-sm hover:shadow-gray-700/60 hover:-translate-y-0.5 hover:bg-white/25"
    >
      {isSubmitting ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Submitting...
        </span>
      ) : (
        'Submit'
      )}
    </button>
  </div>
      </form>

      </div>
    </div>
  );
}
