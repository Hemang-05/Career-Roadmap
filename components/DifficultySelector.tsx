import React from 'react';
import { Dispatch, SetStateAction } from 'react';

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
    <div className="relative  w-128 h-auto">
      <input
        id={difficulty}
        type="radio"
        value={difficulty}
        checked={isSelected}
        onChange={() => onSelect(difficulty)}
        className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer"
        required
      />
      <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
        <label
          htmlFor={difficulty}
          className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300 mb-4"
        >
          {title} Difficulty
        </label>
        
        <p className="text-xs  text-black mb-4 peer-checked:text-white transition-colors duration-300">
          {description}
        </p>
        
        <div className="mt-2 text-xs peer-checked:text-white transition-colors duration-300">
          <div className="flex justify-normal mb-2">
            <span className="font-semibold mr-4">Tasks:</span>
            <span >{taskCount}</span>
          </div>
          <div className="flex justify-normal">
            <span className="font-semibold mr-4">Success:</span>
            <span>{successRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DifficultySelector({
  difficulty,
  setDifficulty
}: {
  difficulty: 'easy' | 'medium' | 'hard' | null;
  setDifficulty: Dispatch<SetStateAction<'easy' | 'medium' | 'hard' | null>>;
}) {
  const difficulties = [
    {
      difficulty: 'easy' as const,
      title: 'Easy',
      description: 'A steady and structured path for those who prefer a relaxed pace. Learn at your comfort while building a solid foundation.',
      taskCount: '2-3 tasks per phase',
      successRate: 'Increases your chances of success by 40-50%'
    },
    {
      difficulty: 'medium' as const,
      title: 'Medium',
      description: 'A balanced journey with a mix of challenge and ease, designed for those who want steady progress with deeper learning.',
      taskCount: '3-5 tasks per phase',
      successRate: 'Boosts your chances of success by 60-70%'
    },
    {
      difficulty: 'hard' as const,
      title: 'Hard',
      description: 'An intensive and fast-paced roadmap for those who thrive on challenges and aim for rapid mastery.',
      taskCount: '5-8 tasks per phase',
      successRate: 'Maximizes your chances of success by 80-90%'
    }
];


  return (
    <div className="mt-16">
      <label className="block text-gray-800 mb-4">
        Choose Your Learning Difficulty
      </label>
      <div className="flex justify-center space-x-8">
        {difficulties.map((diff) => (
          <DifficultyCard
            key={diff.difficulty}
            {...diff}
            isSelected={difficulty === diff.difficulty}
            onSelect={setDifficulty}
          />
        ))}
      </div>
      {!difficulty && (
        <p className="text-red-500 mt-2 text-sm">
          Please select a difficulty level
        </p>
      )}
    </div>
  );
}