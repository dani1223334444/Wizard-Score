'use client';

import { useState } from 'react';
import { Game, GameSetupData } from '../types/game';

interface GameSetupProps {
  onStartGame: (game: Game) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '']);
  const [totalRounds, setTotalRounds] = useState(20);
  const [customRounds, setCustomRounds] = useState(false);
  const [edition, setEdition] = useState<'standard' | '25year'>('25year');
  const [noRoundNumberBid, setNoRoundNumberBid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Wizard rules: 3 players = 20 rounds, 4 players = 15 rounds, 5 players = 12 rounds, 6 players = 10 rounds
  const getDefaultRounds = (playerCount: number): number => {
    switch (playerCount) {
      case 3: return 20;
      case 4: return 15;
      case 5: return 12;
      case 6: return 10;
      default: return 10;
    }
  };

  const addPlayer = () => {
    if (playerNames.length < 6) {
      const newPlayerNames = [...playerNames, ''];
      setPlayerNames(newPlayerNames);
      
      // Auto-adjust rounds if not using custom
      if (!customRounds) {
        const newPlayerCount = newPlayerNames.length;
        setTotalRounds(getDefaultRounds(newPlayerCount));
      }
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      const newPlayerNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newPlayerNames);
      
      // Auto-adjust rounds if not using custom
      if (!customRounds) {
        const newPlayerCount = newPlayerNames.length;
        setTotalRounds(getDefaultRounds(newPlayerCount));
      }
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const validateSetup = (): string[] => {
    const newErrors: string[] = [];
    
    if (playerNames.filter(name => name.trim()).length < 2) {
      newErrors.push('You need at least 2 players');
    }
    
    if (playerNames.some(name => name.trim() === '')) {
      newErrors.push('All player names must be filled');
    }
    
    if (new Set(playerNames.map(name => name.trim().toLowerCase())).size !== playerNames.length) {
      newErrors.push('Player names must be unique');
    }
    
    if (totalRounds < 1 || totalRounds > 20) {
      newErrors.push('Total rounds must be between 1 and 20');
    }
    
    return newErrors;
  };

  const handleStartGame = () => {
    const validationErrors = validateSetup();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const game: Game = {
      id: Date.now().toString(),
      name: `Wizard Game - ${new Date().toLocaleDateString()}`,
      players: playerNames.map((name, index) => ({
        id: `player-${index}`,
        name: name.trim(),
        score: 0,
        tricks: 0,
        bid: 0,
        isDealer: index === 0,
        penalties: [],
        penaltyMultiplier: 1
      })),
      rounds: [],
      currentRound: 1,
      isComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRounds,
      rules: {
        edition,
        customRules: {
          noRoundNumberBid
        }
      }
    };

    onStartGame(game);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 border border-purple-600 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-200">Setup New Game</h2>
      
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-900 border border-red-600 rounded-md">
          <ul className="list-disc list-inside text-red-200">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">Players</label>
          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                />
                {index >= 3 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="px-3 py-2 bg-purple-800 hover:bg-purple-700 border border-purple-600 rounded-md transition-colors text-purple-200 hover:text-white"
                    title="Remove player"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {playerNames.length < 6 && (
            <button
              onClick={addPlayer}
              className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded-md transition-colors"
            >
              + Add Player
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">Total Rounds</label>
          
          {/* Auto-calculated rounds display */}
          {!customRounds && (
            <div className="mb-3 p-3 bg-gray-800 border border-purple-600 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-purple-200">
                  {playerNames.length} players = {totalRounds} rounds
                </span>
                <button
                  type="button"
                  onClick={() => setCustomRounds(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm underline"
                >
                  Custom
                </button>
              </div>
              <p className="text-xs text-purple-400 mt-1">
                Official Wizard rules: 3p=20, 4p=15, 5p=12, 6p=10 rounds
              </p>
            </div>
          )}

          {/* Custom rounds input */}
          {customRounds && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(parseInt(e.target.value) || 10)}
                  min="1"
                  max="20"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomRounds(false);
                    setTotalRounds(getDefaultRounds(playerNames.length));
                  }}
                  className="px-3 py-2 bg-gray-700 border border-purple-600 text-purple-200 rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Auto
                </button>
              </div>
              <p className="text-sm text-purple-300">
                Custom number of rounds (1-20)
              </p>
            </div>
          )}
        </div>

        {/* Game Edition Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">Game Edition</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="25year"
                checked={edition === '25year'}
                onChange={(e) => setEdition(e.target.value as 'standard' | '25year')}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-purple-200">25 Year Edition (includes Bomb & 9¾ Special)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="standard"
                checked={edition === 'standard'}
                onChange={(e) => setEdition(e.target.value as 'standard' | '25year')}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-purple-200">Standard Edition (classic rules)</span>
            </label>
          </div>
        </div>

        {/* Custom Rules */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-200">Custom Rules</h3>
          
          {/* No Round Number Bid */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={noRoundNumberBid}
                onChange={(e) => setNoRoundNumberBid(e.target.checked)}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-purple-200">No round number bid (total bids cannot equal the current round number)</span>
            </label>
            <p className="text-sm text-purple-300 mt-1">
              Example: In round 1, total bids cannot be 1. In round 2, total bids cannot be 2, etc.
            </p>
          </div>
        </div>

        <button
          onClick={handleStartGame}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded-md font-semibold text-lg transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
