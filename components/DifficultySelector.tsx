import React from 'react';
// --- DifficultyCard Component ---
// Adjusted width for responsiveness
const DifficultyCard = ({
  title,
  description,
  taskCount,
  successRate,
  difficulty,
  isSelected,
  onSelect
}: {
  title: string;
  description: string;
  taskCount: string;
  successRate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isSelected: boolean;
  onSelect: (difficulty: 'easy' | 'medium' | 'hard') => void;
}) => {
  return (
    // Base: Full width with a max-width for small screens
    // md and up: Use a fixed width (e.g., w-96, adjust as needed, w-128 was quite large)
    <div className="relative w-full max-w-md md:w-96 h-auto">
      <input
        id={difficulty}
        type="radio"
        value={difficulty}
        checked={isSelected}
        onChange={() => onSelect(difficulty)}
        className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer"
        required
      />
      {/* Apply transitions and peer styles as before */}
      <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
        <label
          htmlFor={difficulty}
          className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300 mb-4 cursor-pointer" // Added cursor-pointer here too
        >
          {title} Difficulty
        </label>

        <p className="text-xs text-center text-black mb-4 peer-checked:text-white transition-colors duration-300"> {/* Added text-center */}
          {description}
        </p>

        <div className="mt-2 text-xs peer-checked:text-white transition-colors duration-300">
          <div className="flex justify-start items-center mb-2 w-full"> {/* Changed justify-normal to justify-start */}
            <span className="font-semibold mr-4 w-16 text-right">Tasks:</span> {/* Added fixed width and text-align */}
            <span>{taskCount}</span>
          </div>
          <div className="flex justify-start items-center w-full"> {/* Changed justify-normal to justify-start */}
            <span className="font-semibold mr-4 w-16 text-right">Success:</span> {/* Added fixed width and text-align */}
            <span>{successRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- DifficultySelector Component ---
// Fixed the type to match what DashboardForm is passing
export default function DifficultySelector({
  difficulty,
  setDifficulty
}: {
  difficulty: 'easy' | 'medium' | 'hard' | null;
  setDifficulty: (value: 'easy' | 'medium' | 'hard' | null) => void;
}) {
  const difficulties = [
    {
      difficulty: 'easy' as const,
      title: 'Easy',
      description: 'A steady and structured path for those who prefer a relaxed pace. Learn at your comfort while building a solid foundation.',
      taskCount: '2-3 tasks per phase',
      successRate: 'Increases chances by 40-50%' // Shortened for potentially smaller cards
    },
    {
      difficulty: 'medium' as const,
      title: 'Medium',
      description: 'A balanced journey with a mix of challenge and ease, designed for those who want steady progress with deeper learning.',
      taskCount: '3-5 tasks per phase',
      successRate: 'Boosts chances by 60-70%' // Shortened
    },
    {
      difficulty: 'hard' as const,
      title: 'Hard',
      description: 'An intensive and fast-paced roadmap for those who thrive on challenges and aim for rapid mastery.',
      taskCount: '5-8 tasks per phase',
      successRate: 'Maximizes chances by 80-90%' // Shortened
    }
];


  return (
    <div className="mt-16 px-4"> {/* Added some horizontal padding */}
      <label className="block text-gray-800 mb-4 text-center md:text-left"> {/* Center text on small screens */}
        Choose Your Learning Difficulty
      </label>
      {/*
        Base (Small screens): Stack vertically, center items, add vertical gap
        md and up: Row layout, center items horizontally, restore horizontal gap
      */}
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8">
        {difficulties.map((diff) => (
          <DifficultyCard
            key={diff.difficulty}
            {...diff}
            isSelected={difficulty === diff.difficulty}
            onSelect={setDifficulty}
          />
        ))}
      </div>
      {/* Error message centered */}
      {!difficulty && (
        <p className="text-red-500 mt-4 text-sm text-center">
          Please select a difficulty level
        </p>
      )}
    </div>
  );
}