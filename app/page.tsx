'use client';

import { useState, useEffect } from 'react';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameHistory from './components/GameHistory';
import GameCodeInput from './components/GameCodeInput';
import LiveGameViewer from './components/LiveGameViewer';
import { Game } from './types/game';
import { databaseService, isSupabaseAvailable } from './services/database';

export default function Home() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [view, setView] = useState<'setup' | 'game' | 'history' | 'join-game' | 'live-viewer'>('setup');
  const [liveGameCode, setLiveGameCode] = useState<string>('');
  const [liveGameError, setLiveGameError] = useState<string>('');

  // Load game history from database on component mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        const games = await databaseService.loadGames();
        setGameHistory(games);
      } catch (error) {
        console.error('Error loading games:', error);
        // Fallback to empty array
        setGameHistory([]);
      }
    };
    
    loadGames();
  }, []);

  // Save current game to database whenever it changes
  useEffect(() => {
    if (currentGame) {
      const saveCurrentGame = async () => {
        try {
          console.log('Saving current game to database:', currentGame.id);
          await databaseService.saveGame(currentGame);
        } catch (error) {
          console.error('Error saving current game:', error);
        }
      };
      
      saveCurrentGame();
    }
  }, [currentGame]);

  // Save game history to database whenever it changes
  useEffect(() => {
    if (gameHistory.length > 0) {
      const saveGames = async () => {
        try {
          // Save the most recent game (first in the array)
          await databaseService.saveGame(gameHistory[0]);
        } catch (error) {
          console.error('Error saving game:', error);
        }
      };
      
      saveGames();
    }
  }, [gameHistory]);

  const startNewGame = (game: Game) => {
    // Generate game code for live sync if Supabase is available
    if (isSupabaseAvailable()) {
      const gameCode = databaseService.createGameCode();
      game.gameCode = gameCode;
      game.isLive = true;
    }
    setCurrentGame(game);
    setView('game');
  };

  const endGame = (finalGame: Game) => {
    setGameHistory(prev => [finalGame, ...prev]);
    setCurrentGame(null);
    setView('setup');
  };

  const loadGame = (game: Game) => {
    setCurrentGame(game);
    setView('game');
  };

  const joinLiveGame = (gameCode: string) => {
    setLiveGameCode(gameCode);
    setView('live-viewer');
  };

  const handleLiveGameError = (error: string) => {
    setLiveGameError(error);
    setView('join-game');
  };

  const backToJoinGame = () => {
    setLiveGameError('');
    setView('join-game');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header and Navigation - Hidden during active gameplay */}
        {view !== 'game' && (
          <>
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2 text-purple-200">🧙‍♂️ Wizard Score</h1>
              <p className="text-purple-300">The ultimate Wizard card game scoring app</p>
                        <div className="mt-2">
            {isSupabaseAvailable() ? (
              <span className="inline-flex items-center gap-2 bg-green-900 border border-green-600 rounded-full px-3 py-1 text-sm text-green-200">
                ☁️ Cloud Sync Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-yellow-900 border border-yellow-600 rounded-full px-3 py-1 text-sm text-yellow-200">
                💾 Local Storage Only
              </span>
            )}
          </div>
          {/* Debug Info */}
          <div className="mt-4 text-xs text-gray-400">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
            </header>

            <nav className="flex justify-center mb-8">
              <div className="bg-gray-900 border border-purple-600 rounded-lg p-1">
                <button
                  onClick={() => setView('setup')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'setup' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-purple-200 hover:text-white hover:bg-purple-600/20'
                  }`}
                >
                  New Game
                </button>
                <button
                  onClick={() => setView('history')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'history' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-purple-200 hover:text-white hover:bg-purple-600/20'
                  }`}
                >
                  Game History
                </button>
                {isSupabaseAvailable() && (
                  <button
                    onClick={() => setView('join-game')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      view === 'join-game' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-purple-200 hover:text-white hover:bg-purple-600/20'
                    }`}
                  >
                    Join Live Game
                  </button>
                )}
              </div>
            </nav>
          </>
        )}

        <main>
          {view === 'setup' && (
            <GameSetup onStartGame={startNewGame} />
          )}
          
          {view === 'game' && currentGame && (
            <GameBoard 
              game={currentGame} 
              onGameUpdate={setCurrentGame}
              onEndGame={endGame}
            />
          )}
          
          {view === 'history' && (
            <GameHistory 
              games={gameHistory} 
              onLoadGame={loadGame}
              onDeleteGame={async (gameId: string) => {
                try {
                  await databaseService.deleteGame(gameId);
                  setGameHistory(prev => prev.filter(g => g.id !== gameId));
                } catch (error) {
                  console.error('Error deleting game:', error);
                }
              }}
            />
          )}

          {view === 'join-game' && (
            <GameCodeInput 
              onJoinGame={joinLiveGame}
              onCancel={() => setView('setup')}
            />
          )}

          {view === 'live-viewer' && (
            <LiveGameViewer 
              gameCode={liveGameCode}
              onError={handleLiveGameError}
            />
          )}
        </main>
      </div>
    </div>
  );
}
