//components\ui\ProofInput.tsx
'use client';
import React from 'react';

interface ProofInputProps {
  value: string;
  onChange: (val: string) => void;
  onRemove?: () => void;
  onConfirm?: () => void;
  isFirst?: boolean;
  placeholder?: string;
}

export default function ProofInput({ 
  value, 
  onChange, 
  onRemove, 
  onConfirm,
  isFirst = false,
  placeholder 
}: ProofInputProps) {
  const hasValue = value.trim().length > 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Paste link to certificate / project / profile'}
        className="w-full border rounded-xl p-2 focus:border-gray-300 focus:outline-none  bg-white text-gray-700 placeholder-gray-200 transition-all duration-300 text-xs font-extralight outline-none"
      />
      
      {/* Show tick when field has value */}
      {hasValue && (
        <button 
          type="button" 
          onClick={onConfirm}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
          title="Confirm and add"
        >
          ✓
        </button>
      )}
      
      {/* Show X for empty additional fields (not the first one) */}
      {!hasValue && onRemove && !isFirst && (
        <button 
          type="button" 
          onClick={onRemove}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          title="Remove field"
        >
          ✕
        </button>
      )}
    </div>
  );
}
