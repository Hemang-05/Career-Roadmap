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
    <div 
      onClick={() => onSelect(difficulty)}
      className={`
        p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-300 
        ${isSelected 
          ? 'border-4 border-[#FF6500] bg-orange-50 scale-105' 
          : 'border border-gray-200 hover:bg-gray-50'}
        flex flex-col justify-between
      `}
    >
      <div>
        <h3 className={`
          text-lg font-bold mb-2 uppercase 
          ${difficulty === 'easy' ? 'text-green-600' : 
            difficulty === 'medium' ? 'text-blue-600' : 
            'text-red-600'}
        `}>
          {title} Difficulty
        </h3>
        <p className="text-xs text-gray-700 mb-2">{description}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold">Tasks per Phase:</span>
            <span>{taskCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Success Probability:</span>
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
      description: 'Perfect for slow learners. Gentle introduction with fewer tasks.',
      taskCount: '2-3 tasks per phase',
      successRate: '40-50%'
    },
    {
      difficulty: 'medium' as const,
      title: 'Medium',
      description: 'Balanced approach for average learners. More comprehensive tasks.',
      taskCount: '3-5 tasks per phase',
      successRate: '60-70%'
    },
    {
      difficulty: 'hard' as const,
      title: 'Hard',
      description: 'Challenging path for quick learners. Maximum tasks with high complexity.',
      taskCount: '5-8 tasks per phase',
      successRate: '80-90%'
    }
  ];

  return (
    <div className="mt-16">
      <label className="block text-gray-800 mb-4 text-xl">
        Choose Your Learning Difficulty
        <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-4">
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