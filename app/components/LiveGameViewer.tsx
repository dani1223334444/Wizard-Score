'use client';

import { useState, useEffect } from 'react';
import { Game, Player, Round } from '../types/game';
import { databaseService, isSupabaseAvailable } from '../services/database';

interface LiveGameViewerProps {
  gameCode: string;
  onError: (error: string) => void;
}

export default function LiveGameViewer({ gameCode, onError }: LiveGameViewerProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadAndSubscribeToGame = async () => {
      try {
        console.log('Looking for game with code:', gameCode);
        console.log('Supabase available:', isSupabaseAvailable());
        
        // First, try to find the game by game code
        const games = await databaseService.loadGames();
        console.log('Loaded games:', games.length);
        console.log('All games:', games.map(g => ({ id: g.id, name: g.name, gameCode: g.gameCode })));
        
        const foundGame = games.find(g => g.gameCode === gameCode);
        console.log('Found game:', foundGame ? 'Yes' : 'No');
        console.log('Looking for code:', gameCode);
        console.log('Available codes:', games.map(g => g.gameCode).filter(Boolean));
        
        if (!foundGame) {
          console.log('Game not found for code:', gameCode);
          if (!isSupabaseAvailable()) {
            onError('Live sync requires Supabase connection. Please check your setup.');
          } else {
            onError(`Game not found. Please check the game code "${gameCode}".`);
          }
          setConnectionStatus('disconnected');
          return;
        }

        console.log('Setting up game:', foundGame.name);
        setGame(foundGame);
        setConnectionStatus('connected');
        setLastUpdate(new Date());

        // Set up real-time subscription (only works with Supabase)
        if (isSupabaseAvailable()) {
          unsubscribe = databaseService.subscribeToGame(foundGame.id, (updatedGame) => {
            console.log('Real-time update received:', updatedGame.name);
            setGame(updatedGame);
            setLastUpdate(new Date());
          });
        } else {
          console.log('Real-time updates not available - using local storage only');
        }p

      } catch (error) {
        console.error('Error loading live game:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onError(`Failed to connect to game: ${errorMessage}`);
        setConnectionStatus('disconnected');
      }
    };

    loadAndSubscribeToGame();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [gameCode, onError]);

  useEffect(() => {
    if (game) {
      // Find the current round
      const savedRound = game.rounds.find(round => round.roundNumber === game.currentRound);
      setCurrentRound(savedRound || null);
    }
  }, [game]);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-200">Connecting to game...</p>
          <p className="text-purple-400 text-sm mt-2">Game Code: {gameCode}</p>
        </div>
      </div>
    );
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Live';
      case 'connecting': return '🟡 Connecting...';
      case 'disconnected': return '🔴 Disconnected';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-100 mb-1">{game.name}</h1>
            <p className="text-purple-300 text-sm">Game Code: {gameCode}</p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </div>
            {lastUpdate && (
              <p className="text-purple-400 text-xs mt-1">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Current Round Info */}
        {currentRound && (
          <div className="bg-gray-800 border border-purple-700 rounded-lg p-4 mb-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-purple-100 mb-2">
                Round {currentRound.roundNumber}
              </h2>
              <p className="text-purple-300 text-sm mb-2">
                {currentRound.cardsInHand} cards in hand
              </p>
              {/* Show current dealer */}
              {(() => {
                const dealer = currentRound.players.find(p => p.isDealer);
                const dealerPlayer = game.players.find(p => p.id === dealer?.id);
                return dealerPlayer ? (
                  <p className="text-purple-400 text-sm">
                    🃏 Dealer: {dealerPlayer.name}
                  </p>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Players */}
        <div className="space-y-3">
          {game.players.map((player, index) => {
            const currentRoundPlayer = currentRound?.players.find(p => p.id === player.id);
            const totalScore = player.score + player.penalties.reduce((sum, penalty) => sum + penalty.points, 0);
            
            return (
              <div key={player.id} className="bg-gray-800 border border-purple-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  {/* Player Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-200">{player.name}</h3>
                      {currentRoundPlayer?.isDealer && (
                        <span className="bg-purple-600 text-purple-100 text-xs px-2 py-1 rounded-full">
                          Dealer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current Round Stats */}
                  {currentRoundPlayer && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-purple-400">Bid</p>
                        <p className="text-purple-200 font-bold">{currentRoundPlayer.bid}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-400">Tricks</p>
                        <p className="text-purple-200 font-bold">
                          {currentRoundPlayer.tricks}/{currentRoundPlayer.bid}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total Score */}
                  <div className="text-right">
                    <p className="text-purple-400 text-sm">Total Score</p>
                    <p className="text-purple-100 font-bold text-lg">{totalScore}</p>
                  </div>
                </div>

                {/* Penalties */}
                {player.penalties.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-600">
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
            );
          })}
        </div>

        {/* Game Progress */}
        <div className="mt-6 bg-gray-800 border border-purple-700 rounded-lg p-4">
          <h3 className="font-semibold text-purple-200 mb-3">Game Progress</h3>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: game.totalRounds }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 < game.currentRound
                    ? 'bg-purple-600' // Completed
                    : i + 1 === game.currentRound
                    ? 'bg-purple-400' // Current
                    : 'bg-gray-600' // Future
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-purple-400 text-sm">
          <p>👀 Live Viewer Mode - Updates automatically</p>
          <p className="mt-1">Only the game manager can make changes</p>
        </div>
      </div>
    </div>
  );
}
