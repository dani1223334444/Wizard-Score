'use client';

import { Player, PenaltyType } from '../types/game';

interface PenaltyPanelProps {
  players: Player[];
  onUpdatePenaltyMultiplier: (playerId: string, multiplier: number) => void;
}

export default function PenaltyPanel({ 
  players, 
  onUpdatePenaltyMultiplier 
}: PenaltyPanelProps) {
  const calculatePenaltyPoints = (multiplier: number) => {
    return -10 * Math.pow(2, multiplier - 1);
  };

  const handleResetMultiplier = (playerId: string) => {
    onUpdatePenaltyMultiplier(playerId, 1);
  };

  return (
    <div className="bg-green-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Penalty System</h3>
      <div className="grid grid-cols-1 gap-3">
        {players.map(player => {
          const currentPenaltyPoints = calculatePenaltyPoints(player.penaltyMultiplier);
          return (
            <div key={player.id} className="p-3 bg-red-800 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-200">{player.name}</span>
                <button
                  onClick={() => handleResetMultiplier(player.id)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded transition-colors"
                  title="Reset penalty multiplier"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-red-300">Multiplier:</span>
                  <span className="ml-1 text-red-100">×{player.penaltyMultiplier}</span>
                </div>
                <div>
                  <span className="text-red-300">Next:</span>
                  <span className="ml-1 text-red-100">{currentPenaltyPoints} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
