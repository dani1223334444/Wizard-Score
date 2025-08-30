export interface Player {
  id: string;
  name: string;
  score: number;
  tricks: number;
  bid: number;
  isDealer: boolean;
  penalties: Penalty[];
  penaltyMultiplier: number;
}

export interface Penalty {
  id: string;
  type: PenaltyType;
  description: string;
  points: number;
  roundNumber: number;
  timestamp: string;
}

export type PenaltyType = 
  | 'wrong_play' 
  | 'wrong_deal' 
  | 'wrong_bid' 
  | 'other_mistake';

export interface Round {
  roundNumber: number;
  cardsInHand: number;
  players: Player[];
  isComplete: boolean;
  trumpSuit?: 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'none';
  dealerIndex: number;
}

export interface GameRules {
  edition: 'standard' | '25year';
  customRules: {
    noRoundNumberBid: boolean; // If true, the total bids by all players cannot equal the current round number (e.g., in round 1, total bids cannot be 1)
  };
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  rounds: Round[];
  currentRound: number;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  totalRounds: number;
  rules: GameRules;
}

export interface GameSetupData {
  playerNames: string[];
  totalRounds: number;
  rules: GameRules;
}

export interface RoundResult {
  playerId: string;
  tricks: number;
  bid: number;
  score: number;
}
