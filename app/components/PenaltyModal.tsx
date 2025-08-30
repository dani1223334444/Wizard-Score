'use client';

import { useState, useEffect } from 'react';
import { Penalty, PenaltyType } from '../types/game';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (penalty: Omit<Penalty, 'id' | 'timestamp'>) => void;
  playerName: string;
  currentRound: number;
  penaltyMultiplier: number;
}

export default function PenaltyModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  playerName, 
  currentRound, 
  penaltyMultiplier 
}: PenaltyModalProps) {
  const [penaltyType, setPenaltyType] = useState<PenaltyType>('other_mistake');
  const [description, setDescription] = useState<string>('');
  const [points, setPoints] = useState<number>(0);

  const penaltyTypes: { value: PenaltyType; label: string }[] = [
    { value: 'wrong_play', label: 'Wrong Play' },
    { value: 'wrong_deal', label: 'Wrong Deal' },
    { value: 'wrong_bid', label: 'Wrong Bid' },
    { value: 'other_mistake', label: 'Other Mistake' }
  ];

  // Calculate default penalty points based on current multiplier
  useEffect(() => {
    if (isOpen) {
      const defaultPoints = -10 * Math.pow(2, penaltyMultiplier - 1);
      setPoints(defaultPoints);
    }
  }, [isOpen, penaltyMultiplier]);

  const handleSubmit = () => {
    if (!description.trim()) return;

    onSubmit({
      type: penaltyType,
      description: description.trim(),
      points,
      roundNumber: currentRound
    });

    // Reset form
    setDescription('');
    setPenaltyType('other_mistake');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-purple-600 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-purple-200">Add Penalty for {playerName}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-purple-200">Penalty Type</label>
            <select
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value as PenaltyType)}
              className="w-full px-3 py-2 bg-gray-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            >
              {penaltyTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-purple-200">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened?"
              className="w-full px-3 py-2 bg-gray-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-purple-200">Penalty Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            />
            <p className="text-xs text-purple-300 mt-1">
              Default: {penaltyMultiplier === 1 ? '-10' : `-${10 * Math.pow(2, penaltyMultiplier - 1)}`} points
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Add Penalty
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 border border-purple-600 hover:bg-gray-700 rounded-lg font-semibold text-purple-200 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
