'use client';

import { Game, Player, Round, Penalty } from '../types/game';

export function generateSampleGame(): Game {
  const players: Player[] = [
    {
      id: '1',
      name: 'Alice',
      score: 0,
      penalties: [
        { id: 'p1', roundNumber: 3, description: 'Wrong card played', points: -10 },
        { id: 'p2', roundNumber: 7, description: 'Dealt wrong', points: -20 }
      ]
    },
    {
      id: '2', 
      name: 'Bob',
      score: 0,
      penalties: [
        { id: 'p3', roundNumber: 5, description: 'Forgot to bid', points: -10 }
      ]
    },
    {
      id: '3',
      name: 'Charlie',
      score: 0,
      penalties: []
    },
    {
      id: '4',
      name: 'Diana',
      score: 0,
      penalties: [
        { id: 'p4', roundNumber: 2, description: 'Played out of turn', points: -10 },
        { id: 'p5', roundNumber: 6, description: 'Wrong suit', points: -20 },
        { id: 'p6', roundNumber: 9, description: 'Miscounted tricks', points: -40 }
      ]
    },
    {
      id: '5',
      name: 'Eve',
      score: 0,
      penalties: []
    },
    {
      id: '6',
      name: 'Frank',
      score: 0,
      penalties: [
        { id: 'p7', roundNumber: 4, description: 'Dropped cards', points: -10 }
      ]
    }
  ];

  // Generate 10 rounds of sample data
  const rounds: Round[] = [];
  let runningScores = [0, 0, 0, 0, 0, 0]; // Track running scores

  for (let roundNum = 1; roundNum <= 10; roundNum++) {
    const cardsInHand = roundNum <= 5 ? roundNum : 11 - roundNum;
    const dealerIndex = (roundNum - 1) % players.length;
    
    // Generate realistic bids and tricks
    const roundPlayers = players.map((player, index) => {
      let bid = Math.floor(Math.random() * (cardsInHand + 1));
      let tricks = bid;
      
      // Add some variation - sometimes miss, sometimes exceed
      const variation = Math.random();
      if (variation < 0.2) {
        tricks = Math.max(0, bid - 1); // Miss by 1
      } else if (variation < 0.3) {
        tricks = Math.min(cardsInHand, bid + 1); // Exceed by 1
      }
      
      // Calculate round score
      let roundScore = 0;
      if (bid === tricks) {
        roundScore = 20 + (tricks * 10);
      } else {
        roundScore = -10 * Math.abs(bid - tricks);
      }
      
      // Add penalties for this round
      const roundPenalties = player.penalties.filter(p => p.roundNumber === roundNum);
      const penaltyPoints = roundPenalties.reduce((sum, penalty) => sum + penalty.points, 0);
      
      runningScores[index] += roundScore + penaltyPoints;
      
      return {
        ...player,
        bid,
        tricks,
        isDealer: index === dealerIndex,
        score: runningScores[index]
      };
    });

    rounds.push({
      roundNumber: roundNum,
      cardsInHand,
      players: roundPlayers,
      isComplete: true,
      dealerIndex
    });
  }

  // Update final scores
  players.forEach((player, index) => {
    player.score = runningScores[index];
  });

  return {
    id: 'sample-game-' + Date.now(),
    name: 'Sample Game (Dev)',
    players,
    rounds,
    currentRound: 10,
    totalRounds: 10,
    isComplete: true,
    rules: {
      edition: '25year' as const,
      noRoundNumberBidding: true
    },
    createdAt: new Date().toISOString(),
    gameCode: 'SAMPLE',
    isLive: false
  };
}
