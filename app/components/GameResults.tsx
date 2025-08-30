'use client';

import { useState } from 'react';
import { Game, Player, Round } from '../types/game';

interface GameResultsProps {
  game: Game;
  onNewGame: () => void;
  onViewHistory: () => void;
}

export default function GameResults({ game, onNewGame, onViewHistory }: GameResultsProps) {
  const [selectedView, setSelectedView] = useState<'scoreboard' | 'graph'>('scoreboard');

  // Calculate final scores
  const finalScores = game.players.map(player => ({
    ...player,
    finalScore: player.score + player.penalties.reduce((sum, penalty) => sum + penalty.points, 0)
  })).sort((a, b) => b.finalScore - a.finalScore);

  // Calculate score progression for graph
  const getScoreProgression = () => {
    const progression: { [playerId: string]: { name: string; scores: number[]; colors: string } } = {};
    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    
    game.players.forEach((player, index) => {
      progression[player.id] = {
        name: player.name,
        scores: [0], // Start with 0
        colors: colors[index % colors.length]
      };
    });

    // Add scores after each round
    let runningScores = game.players.map(p => 0);
    
    game.rounds.forEach((round, roundIndex) => {
      const newScores = game.players.map(player => {
        const roundPlayer = round.players.find(p => p.id === player.id);
        if (!roundPlayer) return runningScores[game.players.indexOf(player)];
        
        let roundScore = 0;
        if (roundPlayer.bid === roundPlayer.tricks) {
          roundScore = 20 + (roundPlayer.tricks * 10);
        } else {
          roundScore = -10 * Math.abs(roundPlayer.bid - roundPlayer.tricks);
        }
        
        // Add penalties for this round
        const roundPenalties = player.penalties.filter(p => p.roundNumber === round.roundNumber);
        const penaltyPoints = roundPenalties.reduce((sum, penalty) => sum + penalty.points, 0);
        
        return runningScores[game.players.indexOf(player)] + roundScore + penaltyPoints;
      });
      
      runningScores = newScores;
      game.players.forEach((player, index) => {
        progression[player.id].scores.push(runningScores[index]);
      });
    });

    return progression;
  };

  const scoreProgression = getScoreProgression();
  const maxScore = Math.max(...Object.values(scoreProgression).flatMap(p => p.scores));
  const minScore = Math.min(...Object.values(scoreProgression).flatMap(p => p.scores));
  const scoreRange = maxScore - minScore;

  const getPosition = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-100 mb-2">Game Complete!</h1>
          <p className="text-purple-300">{game.name}</p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 border border-purple-600 rounded-lg p-1 flex">
            <button
              onClick={() => setSelectedView('scoreboard')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedView === 'scoreboard'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-200 hover:text-white hover:bg-purple-600/20'
              }`}
            >
              🏆 Scoreboard
            </button>
            <button
              onClick={() => setSelectedView('graph')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedView === 'graph'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-200 hover:text-white hover:bg-purple-600/20'
              }`}
            >
              📈 Score Graph
            </button>
          </div>
        </div>

        {/* Scoreboard View */}
        {selectedView === 'scoreboard' && (
          <div className="space-y-4">
            {finalScores.map((player, index) => (
              <div
                key={player.id}
                className={`bg-gray-800 border rounded-lg p-6 ${
                  index === 0 ? 'border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20' :
                  index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-800/20 to-gray-700/20' :
                  index === 2 ? 'border-amber-600 bg-gradient-to-r from-amber-900/20 to-amber-800/20' :
                  'border-purple-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getPosition(index)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-purple-100">{player.name}</h3>
                      <p className="text-purple-400 text-sm">
                        {game.rounds.length} rounds • {player.penalties.length} penalties
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-100">{player.finalScore}</p>
                    <p className="text-purple-400 text-sm">points</p>
                  </div>
                </div>
                
                {/* Penalties */}
                {player.penalties.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-600">
                    <p className="text-purple-400 text-sm mb-2">Penalties:</p>
                    <div className="flex flex-wrap gap-2">
                      {player.penalties.map((penalty) => (
                        <span
                          key={penalty.id}
                          className="bg-red-900 text-red-200 text-xs px-2 py-1 rounded-full"
                        >
                          {penalty.description}: {penalty.points}pts
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Graph View */}
        {selectedView === 'graph' && (
          <div className="bg-gray-800 border border-purple-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-100 mb-6 text-center">Score Progression</h3>
            
            {/* Graph Container */}
            <div className="relative h-96 bg-gray-900 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-purple-400">
                <span>{maxScore}</span>
                <span>{Math.round((maxScore + minScore) / 2)}</span>
                <span>{minScore}</span>
              </div>
              
              {/* Graph lines */}
              <div className="ml-8 h-full relative">
                {Object.values(scoreProgression).map((player, playerIndex) => (
                  <div key={player.name} className="absolute inset-0">
                    <svg className="w-full h-full">
                      <polyline
                        points={player.scores.map((score, roundIndex) => {
                          const x = (roundIndex / (player.scores.length - 1)) * 100;
                          const y = 100 - ((score - minScore) / scoreRange) * 100;
                          return `${x}%,${y}%`;
                        }).join(' ')}
                        fill="none"
                        stroke={player.colors}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ))}
                
                {/* Round markers */}
                {Array.from({ length: game.rounds.length + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-purple-600/30"
                    style={{ left: `${(i / game.rounds.length) * 100}%` }}
                  />
                ))}
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-purple-400">
                <span>Start</span>
                {game.rounds.map((_, i) => (
                  <span key={i}>R{i + 1}</span>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              {Object.values(scoreProgression).map((player) => (
                <div key={player.name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-1 rounded"
                    style={{ backgroundColor: player.colors }}
                  />
                  <span className="text-purple-200 text-sm">{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onNewGame}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🎲 New Game
          </button>
          <button
            onClick={onViewHistory}
            className="px-6 py-3 bg-gray-700 border border-purple-600 hover:bg-gray-600 rounded-lg font-semibold text-purple-200 transition-colors"
          >
            📚 Game History
          </button>
        </div>
      </div>
    </div>
  );
}
