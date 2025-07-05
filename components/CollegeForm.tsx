// components/CollegeForm.tsx

"use client";
import React from 'react';

interface University {
    id: number;
    name: string;
}

interface CollegeFormData {
    tuitionFees: string;
    culturalRating: number;
    infraRating: number;
    vibeRating: number;
    companiesCount: string;
    highestCTC: string;
    avgCTC: string;
}

interface CollegeFormProps {
    show: boolean;
    onSubmit: (e: React.FormEvent) => void;
    universities: University[];
    formData: CollegeFormData;
    setFormData: React.Dispatch<React.SetStateAction<CollegeFormData>>;
    inputValue: string;
    setInputValue: (value: string) => void;
    isSuggestionsOpen: boolean;
    setIsSuggestionsOpen: (isOpen: boolean) => void;
    setSelectedUniversityId: (id: number | null) => void;
}

const CollegeForm: React.FC<CollegeFormProps> = ({
    show,
    onSubmit,
    universities,
    formData,
    setFormData,
    inputValue,
    setInputValue,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    setSelectedUniversityId,
}) => {
    if (!show) return null;

    const renderRatingSlider = (label: string, value: number, onRate: (rating: number) => void) => (
        <div className="transition-all duration-200">
            <label className="text-sm font-medium text-gray-700 mb-4 block">{label}</label>
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Low</span>
                <div className="flex gap-1 flex-1 mx-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <div key={num} onClick={() => onRate(num)} className={`cursor-pointer h-2 flex-1 rounded-full transition-all duration-200 ${value >= num ? "bg-gradient-to-r from-orange-200 to-orange-500" : "bg-gray-200"}`}/>
                    ))}
                </div>
                <span className="text-xs text-gray-500">High</span>
            </div>
            <div className="text-center mt-2 font-medium text-green-600">{value || "-"}/10</div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300">
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-auto border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">University Rating</h2>
                <form onSubmit={onSubmit} className="space-y-8">
                    <div className="transition-all duration-200">
                        <label htmlFor="universityInput" className="text-sm font-medium text-gray-700 mb-2 block">University</label>
                        <div className="relative">
                            <input id="universityInput" type="text" value={inputValue} onChange={(e) => { setInputValue(e.target.value); setIsSuggestionsOpen(true); }} onFocus={() => setIsSuggestionsOpen(true)} className="w-full p-3 rounded-xl border text-gray-700 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none" placeholder="Search universities..." required autoComplete="off"/>
                            <p className="text-xs text-gray-500 mt-1 mx-2">Type and select "Other" if yours not present</p>
                            {isSuggestionsOpen && inputValue && (
                                <div className="absolute z-10 w-full mt-1 bg-white text-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto border border-gray-100">
                                    {universities.filter((uni) => uni.name.toLowerCase().includes(inputValue.toLowerCase())).map((uni) => (
                                        <div key={uni.id} className="p-3 hover:bg-blue-50 text-gray-700 cursor-pointer transition-colors duration-150" onClick={() => { setSelectedUniversityId(uni.id); setInputValue(uni.name); setIsSuggestionsOpen(false); }}>
                                            {uni.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="transition-all duration-200">
                        <label htmlFor="tuitionFees" className="text-sm font-medium text-gray-700 mb-2 block">Tuition Fees (per semester)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                            <input type="number" id="tuitionFees" min="0" step="1000" value={formData.tuitionFees} onChange={(e) => setFormData({ ...formData, tuitionFees: e.target.value })} className="w-full p-3 pl-8 rounded-xl text-gray-700 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none" required/>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {renderRatingSlider("Cultural Events Rating", formData.culturalRating, (num) => setFormData({ ...formData, culturalRating: num }))}
                        {renderRatingSlider("Infrastructure Rating", formData.infraRating, (num) => setFormData({ ...formData, infraRating: num }))}
                        {renderRatingSlider("Vibe Check Rating", formData.vibeRating, (num) => setFormData({ ...formData, vibeRating: num }))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Placement Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="companiesCount" className="text-xs text-gray-500 mb-1 block">Companies Count</label>
                                <input type="number" id="companiesCount" min="0" step="1" value={formData.companiesCount} onChange={(e) => setFormData({ ...formData, companiesCount: e.target.value })} className="w-full p-2 text-gray-700 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none" required/>
                            </div>
                            <div>
                                <label htmlFor="highestCTC" className="text-xs text-gray-500 mb-1 block">Highest CTC (LPA)</label>
                                <input type="number" id="highestCTC" min="0" step="1" value={formData.highestCTC} onChange={(e) => setFormData({ ...formData, highestCTC: e.target.value })} className="w-full p-2 text-gray-700 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none" required/>
                            </div>
                            <div>
                                <label htmlFor="avgCTC" className="text-xs text-gray-500 mb-1 block">Average CTC (LPA)</label>
                                <input type="number" id="avgCTC" min="0" step="1" value={formData.avgCTC} onChange={(e) => setFormData({ ...formData, avgCTC: e.target.value })} className="w-full p-2 text-gray-700 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none" required/>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="submit" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 font-medium text-sm">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollegeForm;