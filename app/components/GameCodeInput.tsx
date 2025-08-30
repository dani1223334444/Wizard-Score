'use client';

import { useState } from 'react';

interface GameCodeInputProps {
  onJoinGame: (gameCode: string) => void;
  onCancel: () => void;
}

export default function GameCodeInput({ onJoinGame, onCancel }: GameCodeInputProps) {
  const [gameCode, setGameCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCode.length === 6) {
      onJoinGame(gameCode.toUpperCase());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setGameCode(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-purple-700 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-100 mb-2">Join Live Game</h1>
          <p className="text-purple-300 text-sm">
            Enter the 6-character game code to watch live updates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="gameCode" className="block text-sm font-medium text-purple-200 mb-2">
              Game Code
            </label>
            <input
              type="text"
              id="gameCode"
              value={gameCode}
              onChange={handleInputChange}
              placeholder="ABC123"
              className="w-full px-4 py-3 bg-gray-700 border border-purple-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={6}
              autoComplete="off"
              autoFocus
            />
            <p className="text-purple-400 text-xs mt-2 text-center">
              {gameCode.length}/6 characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-700 border border-purple-600 text-purple-200 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={gameCode.length !== 6}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200"
            >
              Join Game
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-purple-400 text-sm">
            👀 You'll be able to watch the game live but can't make changes
          </p>
        </div>
      </div>
    </div>
  );
}
