'use client';

import { Game } from '../types/game';

interface GameHistoryProps {
  games: Game[];
  onLoadGame: (game: Game) => void;
  onDeleteGame: (gameId: string) => void;
}

export default function GameHistory({ games, onLoadGame, onDeleteGame }: GameHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWinner = (game: Game) => {
    if (!game.isComplete) return null;
    
    const winner = game.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
    
    return winner;
  };

  if (games.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-900 border border-purple-600 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-purple-200">No Games Yet</h2>
        <p className="text-purple-300 mb-6">
          Start your first Wizard game to see it appear here!
        </p>
        <div className="text-4xl">🎮</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-200">Game History</h2>
      
      <div className="grid gap-4">
        {games.map((game) => (
          <div key={game.id} className="bg-gray-900 border border-purple-600 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{game.name}</h3>
                  {game.isComplete ? (
                    <span className="inline-block bg-purple-600 text-purple-100 text-xs px-2 py-1 rounded-full">
                      Complete
                    </span>
                  ) : (
                    <span className="inline-block bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-purple-300 space-y-1">
                  <p>Players: {game.players.map(p => p.name).join(', ')}</p>
                  <p>Rounds: {game.currentRound - 1}/{game.totalRounds}</p>
                  <p>Created: {formatDate(game.createdAt)}</p>
                  {game.isComplete && (
                    <p className="font-semibold text-purple-200">
                      Winner: {getWinner(game)?.name} ({getWinner(game)?.score} points)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {!game.isComplete && (
                  <button
                    onClick={() => onLoadGame(game)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Continue
                  </button>
                )}
                <button
                  onClick={() => onDeleteGame(game.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Player Scores */}
            {game.isComplete && (
                              <div className="mt-4 pt-4 border-t border-purple-700">
                  <h4 className="font-medium mb-2 text-purple-200">Final Scores:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {game.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div key={player.id} className="text-sm">
                        <span className="font-medium">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`} {player.name}
                        </span>
                        <span className="block text-green-300">{player.score} pts</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
