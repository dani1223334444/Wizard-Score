'use client';

import { useState, useEffect } from 'react';
import { Game, Player, Round, Penalty } from '../types/game';
import PenaltyPanel from './PenaltyPanel';
import PenaltyModal from './PenaltyModal';
import { databaseService } from '../services/database';

interface GameBoardProps {
  game: Game;
  onGameUpdate: (game: Game) => void;
  onEndGame: (game: Game) => void;
}

export default function GameBoard({ game, onGameUpdate, onEndGame }: GameBoardProps) {
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [biddingPhase, setBiddingPhase] = useState(true);
  const [roundComplete, setRoundComplete] = useState(false);
  const [penaltyModal, setPenaltyModal] = useState<{
    isOpen: boolean;
    playerId: string;
    playerName: string;
  }>({ isOpen: false, playerId: '', playerName: '' });

  const [nineThreeQuarterModal, setNineThreeQuarterModal] = useState<{
    isOpen: boolean;
    playerId: string;
    playerName: string;
  }>({ isOpen: false, playerId: '', playerName: '' });

  const [bombPlayed, setBombPlayed] = useState(false);
  const [cloudUsed, setCloudUsed] = useState(false);
  const [gameProgressOpen, setGameProgressOpen] = useState(false);

  const openPenaltyModal = (playerId: string, playerName: string) => {
    setPenaltyModal({ isOpen: true, playerId, playerName });
  };

  const openNineThreeQuarterModal = (playerId: string) => {
    const player = game.players.find(p => p.id === playerId);
    if (player) {
      setNineThreeQuarterModal({ isOpen: true, playerId, playerName: player.name });
    }
  };

  const closePenaltyModal = () => {
    setPenaltyModal({ isOpen: false, playerId: '', playerName: '' });
  };

  const closeNineThreeQuarterModal = () => {
    setNineThreeQuarterModal({ isOpen: false, playerId: '', playerName: '' });
  };

  const toggleBomb = () => {
    setBombPlayed(!bombPlayed);
  };

  const toggleGameProgress = () => {
    setGameProgressOpen(!gameProgressOpen);
  };

  const handleAddPenalty = (penaltyData: Omit<Penalty, 'id' | 'timestamp'>) => {
    const penalty: Penalty = {
      id: Date.now().toString(),
      ...penaltyData,
      timestamp: new Date().toISOString()
    };

    // Add penalty to player and increase their penalty multiplier
    const updatedGame = {
      ...game,
      players: game.players.map(player =>
        player.id === penaltyModal.playerId 
          ? { 
              ...player, 
              penalties: [...player.penalties, penalty],
              penaltyMultiplier: player.penaltyMultiplier + 1
            }
          : player
      ),
      updatedAt: new Date().toISOString()
    };
    onGameUpdate(updatedGame);
  };

  const handleNineThreeQuarterAdjustment = (increase: boolean) => {
    const playerId = nineThreeQuarterModal.playerId;
    if (!playerId || !currentRound) return;

    const player = currentRound.players.find(p => p.id === playerId);
    if (!player) return;

    const currentBid = player.bid || 0;
    let newBid: number;

    if (increase) {
      // Normal max bid (bomb only voids one trick, doesn't affect bidding)
      newBid = Math.min(currentRound.cardsInHand, currentBid + 1);
    } else {
      newBid = Math.max(0, currentBid - 1);
    }

    updatePlayerBid(playerId, newBid);
    setCloudUsed(true); // Mark cloud as used for this round
    closeNineThreeQuarterModal();
  };



  useEffect(() => {
    initializeCurrentRound();
  }, [game.currentRound, game.players]);

  const initializeCurrentRound = () => {
    // Check if we have a saved round for the current round number
    const savedRound = game.rounds.find(round => round.roundNumber === game.currentRound);
    
    if (savedRound) {
      // Load the saved round data
      setCurrentRound(savedRound);
      // Determine phase based on whether bids are set
      const hasBids = savedRound.players.some(player => player.bid >= 0);
      setBiddingPhase(!hasBids);
      setRoundComplete(savedRound.isComplete);
    } else {
      // Create a new round
      const cardsInHand = game.currentRound <= game.totalRounds / 2 
        ? game.currentRound 
        : game.totalRounds - game.currentRound + 1;

      const newRound: Round = {
        roundNumber: game.currentRound,
        cardsInHand,
        players: game.players.map((player, index) => ({
          ...player,
          tricks: 0,
          bid: 0,
          isDealer: index === (game.currentRound - 1) % game.players.length
        })),
        isComplete: false,
        dealerIndex: (game.currentRound - 1) % game.players.length
      };

      setCurrentRound(newRound);
      setBiddingPhase(true);
      setRoundComplete(false);
    }
    
    // Only reset bomb and cloud for 25 Year Edition
    if (game.rules?.edition === '25year') {
      setBombPlayed(false);
      setCloudUsed(false);
    }
  };

  const updatePlayerBid = (playerId: string, bid: number) => {
    if (!currentRound) return;

    const updatedRound = {
      ...currentRound,
      players: currentRound.players.map(player =>
        player.id === playerId ? { ...player, bid } : player
      )
    };

    setCurrentRound(updatedRound);
  };

  const updatePlayerTricks = (playerId: string, tricks: number) => {
    if (!currentRound) return;

    const updatedRound = {
      ...currentRound,
      players: currentRound.players.map(player =>
        player.id === playerId ? { ...player, tricks } : player
      )
    };

    setCurrentRound(updatedRound);
  };

  const completeBidding = () => {
    if (!currentRound) return;
    
    const allBidsPlaced = currentRound.players.every(player => player.bid >= 0);
    if (!allBidsPlaced) return;

    setBiddingPhase(false);
  };

  const completeRound = () => {
    if (!currentRound) return;

    // Calculate scores for this round
    const updatedPlayers = currentRound.players.map(player => {
      let roundScore = 0;
      
      if (player.bid === player.tricks) {
        // Correct bid: 20 points + 10 points per trick
        roundScore = 20 + (player.tricks * 10);
      } else {
        // Incorrect bid: -10 points per trick difference
        roundScore = -10 * Math.abs(player.bid - player.tricks);
      }

      // Add penalty points for this round
      const roundPenalties = player.penalties.filter(p => p.roundNumber === currentRound.roundNumber);
      const penaltyPoints = roundPenalties.reduce((sum, penalty) => sum + penalty.points, 0);

      return {
        ...player,
        score: player.score + roundScore + penaltyPoints
      };
    });

    // Update game with new round results
    const updatedGame = {
      ...game,
      players: updatedPlayers,
      rounds: [...game.rounds, { ...currentRound, isComplete: true }],
      currentRound: game.currentRound + 1,
      updatedAt: new Date().toISOString()
    };

    // Check if game is complete
    if (game.currentRound >= game.totalRounds) {
      updatedGame.isComplete = true;
      onEndGame(updatedGame);
    } else {
      onGameUpdate(updatedGame);
    }
  };

  const canCompleteBidding = currentRound?.players.every(player => player.bid >= 0) && 
    (() => {
      if (!currentRound) return false;
      
      // Check if total bids violates the no round number bid rule
      if (game.rules?.customRules?.noRoundNumberBid) {
        const totalBids = currentRound.players.reduce((sum, player) => sum + (player.bid || 0), 0);
        if (totalBids === currentRound.roundNumber) {
          return false; // Cannot complete bidding when total bids equals round number
        }
      }
      
      return true;
    })();
  const canCompleteRound = currentRound?.players.every(player => player.tricks >= 0) && 
    (() => {
      if (!currentRound) return false;
      const totalTricksEntered = currentRound.players.reduce((sum, player) => sum + (player.tricks || 0), 0);
      
      // When bomb is played (25 Year Edition only), one trick is voided
      const expectedTotal = (game.rules?.edition === '25year' && bombPlayed) ? currentRound.cardsInHand - 1 : currentRound.cardsInHand;
      
      // Check if total tricks equals expected total
      return totalTricksEntered === expectedTotal;
    })();

  if (!currentRound) {
    return <div>Loading round...</div>;
  }

           return (
           <div className="max-w-4xl mx-auto space-y-1 bg-gray-950 min-h-screen p-2">
                {/* Game Header - Clean & Modern */}
         <div className="text-center py-3">
           <h2 className="text-2xl font-extrabold text-purple-100 mb-1 tracking-wide">
             Round {currentRound.roundNumber}
           </h2>
           <p className="text-sm text-purple-300 font-medium tracking-wide">
             {biddingPhase ? 'Bidding Phase' : 'Tricks Phase'}
           </p>
           {/* Game Code for Live Sync */}
           {game.gameCode && (
             <div className="mt-3 p-2 bg-gray-800 border border-purple-600 rounded-lg">
               <p className="text-purple-400 text-xs mb-1">Share this code for live viewing:</p>
               <p className="text-purple-100 font-mono text-lg tracking-widest">{game.gameCode}</p>
               <p className="text-purple-400 text-xs mt-1">👀 Others can watch live but can&apos;t make changes</p>
             </div>
           )}
         </div>

         {/* Bomb Toggle - Only in tricks phase */}
         {!biddingPhase && game.rules?.edition === '25year' && (
           <div className="flex justify-center items-center gap-2 mb-2">
             <span className="text-sm text-purple-200">💣 Bomb</span>
             <button
               onClick={toggleBomb}
               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                 bombPlayed ? 'bg-purple-600' : 'bg-gray-600'
               }`}
               title="Toggle if bomb card was played this round"
             >
               <span
                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                   bombPlayed ? 'translate-x-6' : 'translate-x-1'
                 }`}
               />
             </button>
           </div>
         )}

                                                        {/* Players - Perfectly Compact Design */}
                                    <div className="space-y-2">
           {currentRound.players.map((player, index) => (
                                                       <div key={player.id} className="bg-gray-800 border border-purple-700 rounded-lg p-3">
               {/* Everything in one line */}
               <div className="flex items-center justify-between gap-3">
                 {/* Left: Name + Dealer */}
                 <div className="flex items-center gap-2 min-w-0 flex-1">
                   <h3 className="font-semibold text-base text-purple-200 truncate">{player.name}</h3>
                   {player.isDealer && (
                     <span className="bg-purple-600 text-purple-100 text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                       D
                     </span>
                   )}
                 </div>
                 
                 {/* Center: Bid Controls */}
                 {biddingPhase ? (
                   <div className="flex items-center gap-1">
                     <button
                       onClick={() => updatePlayerBid(player.id, Math.max(0, (player.bid || 0) - 1))}
                       className="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
                     >
                       -
                     </button>
                     <span className="w-10 h-8 bg-gray-700 border border-purple-600 rounded flex items-center justify-center text-sm font-bold text-white">
                       {player.bid >= 0 ? player.bid : 0}
                     </span>
                     <button
                       onClick={() => updatePlayerBid(player.id, Math.min(currentRound.cardsInHand, (player.bid || 0) + 1))}
                       className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
                     >
                       +
                     </button>
                   </div>
                 ) : (
                   <div className="flex items-center gap-1">
                     <button
                       onClick={() => updatePlayerTricks(player.id, Math.max(0, (player.tricks || 0) - 1))}
                       className="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
                     >
                       -
                     </button>
                     <span className="w-10 h-8 bg-gray-700 border border-purple-600 rounded flex items-center justify-center text-sm font-bold text-white">
                       {player.tricks >= 0 ? player.tricks : 0}/{player.bid >= 0 ? player.bid : 0}
                     </span>
                     <button
                       onClick={() => updatePlayerTricks(player.id, Math.min(currentRound.cardsInHand, (player.tricks || 0) + 1))}
                       className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
                     >
                       +
                     </button>
                     {/* 9¾ Special Function - Tiny cloud button */}
                     {game.rules?.edition === '25year' && !cloudUsed && (
                       <button
                         onClick={() => openNineThreeQuarterModal(player.id)}
                         className="w-6 h-6 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white text-xs transition-colors ml-1"
                         title="9¾ Special: Adjust bid by ±1"
                       >
                         ☁️
                       </button>
                     )}
                   </div>
                 )}
                 
                 {/* Right: Score + Penalty */}
                 <div className="flex items-center gap-2 flex-shrink-0 min-w-[80px] justify-end">
                   <span className="text-base font-bold text-purple-100 min-w-[30px] text-right">
                     {player.score + player.penalties.reduce((sum, penalty) => sum + penalty.points, 0)}
                   </span>
                   <button
                     onClick={() => openPenaltyModal(player.id, player.name)}
                     className="text-red-300 hover:text-red-100 text-sm transition-colors w-5 h-5 flex items-center justify-center"
                     title="Add penalty"
                   >
                     ⚠️
                   </button>
                 </div>
               </div>
             </div>
           ))}
         </div>





                           {/* Game Controls - Ultra Compact */}
                <div className="flex justify-center">
           {biddingPhase ? (
             <button
               onClick={completeBidding}
               disabled={!canCompleteBidding}
               className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg"
             >
               Complete Bidding
             </button>
           ) : (
             <button
               onClick={completeRound}
               disabled={!canCompleteRound}
               className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg"
             >
               Complete Round
             </button>
           )}
         </div>

                   {/* Rule Violation Warning */}
          {biddingPhase && currentRound && game.rules?.customRules?.noRoundNumberBid && (() => {
            const totalBids = currentRound.players.reduce((sum, player) => sum + (player.bid || 0), 0);
            if (totalBids === currentRound.roundNumber) {
              return (
                <div className="text-center">
                  <div className="inline-block bg-red-900 border border-red-600 rounded-lg px-4 py-2">
                    <p className="text-red-200 text-sm">
                      ⚠️ Cannot complete bidding: Total bids ({totalBids}) equals round number ({currentRound.roundNumber})
                    </p>
                    <p className="text-red-300 text-xs mt-1">
                      Adjust bids so total ≠ {currentRound.roundNumber}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

             

                                                                                                               {/* Game Progress - Collapsible */}
          <div className="bg-gray-900 border border-purple-700 rounded-lg">
            <button
              onClick={toggleGameProgress}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-semibold text-purple-200">Game History</h3>
              <span className="text-purple-400 text-lg">
                {gameProgressOpen ? '▼' : '▶'}
              </span>
            </button>
            
            {gameProgressOpen && (
              <div className="p-4 pt-0 border-t border-purple-700">
                <div className="flex gap-2 flex-wrap mb-4">
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
                
                {/* Round History */}
                {game.rounds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3 text-purple-300">Round History</h4>
                    <div className="space-y-3">
                      {game.rounds.map((round) => (
                        <div key={round.roundNumber} className="bg-gray-800 border border-purple-600 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-purple-200">Round {round.roundNumber}</h5>
                            <span className="text-xs text-purple-400">{round.cardsInHand} cards</span>
                          </div>
                          
                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {round.players.map((player) => {
                              const playerData = game.players.find(p => p.id === player.id);
                              const roundPenalties = playerData?.penalties.filter(p => p.roundNumber === round.roundNumber) || [];
                              const penaltyPoints = roundPenalties.reduce((sum, penalty) => sum + penalty.points, 0);
                              
                              return (
                                <div key={player.id} className="bg-gray-700 border border-purple-500 rounded p-2 text-sm">
                                  <div className="font-medium text-purple-200 mb-1">{playerData?.name}</div>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div>
                                      <span className="text-purple-400">Bid:</span>
                                      <span className="ml-1 text-purple-200">{player.bid}</span>
                                    </div>
                                    <div>
                                      <span className="text-purple-400">Tricks:</span>
                                      <span className="ml-1 text-purple-200">{player.tricks}</span>
                                    </div>
                                  </div>
                                  {penaltyPoints !== 0 && (
                                    <div className="text-red-300 text-xs mt-1">
                                      Penalties: {penaltyPoints} pts
                                    </div>
                                  )}
                                  {player.isDealer && (
                                    <span className="inline-block bg-purple-600 text-purple-100 text-xs w-4 h-4 rounded-full flex items-center justify-center mt-1">
                                      D
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

                               {/* Penalty Modal */}
         <PenaltyModal
           isOpen={penaltyModal.isOpen}
           onClose={closePenaltyModal}
           onSubmit={handleAddPenalty}
           playerName={penaltyModal.playerName}
           currentRound={game.currentRound}
           penaltyMultiplier={game.players.find(p => p.id === penaltyModal.playerId)?.penaltyMultiplier || 1}
         />

                   {/* 9¾ Special Modal - 25 Year Edition Only */}
          {game.rules?.edition === '25year' && nineThreeQuarterModal.isOpen && (
                       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-purple-600 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-center text-purple-200">
                  ☁️ 9¾ Special for {nineThreeQuarterModal.playerName}
                </h3>
                <p className="text-sm text-purple-300 mb-6 text-center">
                  Adjust bid by ±1
                </p>
                               <div className="flex gap-3 justify-center mb-4">
                  <button
                    onClick={() => handleNineThreeQuarterAdjustment(false)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Decrease (-1)
                  </button>
                  <button
                    onClick={() => handleNineThreeQuarterAdjustment(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Increase (+1)
                  </button>
                </div>
                <button
                  onClick={closeNineThreeQuarterModal}
                  className="w-full px-4 py-2 bg-gray-800 border border-purple-600 hover:bg-gray-700 rounded-lg font-semibold text-purple-200 transition-all duration-200"
                >
                  Cancel
                </button>
             </div>
           </div>
         )}
      </div>
    );
  }
