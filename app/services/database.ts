import { createClient } from '@supabase/supabase-js';
import { Game, GameSetupData } from '../types/game';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database service interface
export interface DatabaseService {
  saveGame: (game: Game) => Promise<void>;
  loadGames: () => Promise<Game[]>;
  loadGame: (id: string) => Promise<Game | null>;
  updateGame: (game: Game) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  subscribeToGame: (gameId: string, callback: (game: Game) => void) => () => void;
  createGameCode: () => string;
}

// Supabase implementation
class SupabaseService implements DatabaseService {
  async saveGame(game: Game): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    console.log('Attempting to save game to Supabase:', game.id);
    const { error } = await supabase
      .from('games')
      .upsert({
        id: game.id,
        name: game.name,
        players: game.players,
        rounds: game.rounds,
        current_round: game.currentRound,
        total_rounds: game.totalRounds,
        is_complete: game.isComplete,
        rules: game.rules,
        game_code: game.gameCode,
        is_live: game.isLive,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Supabase save error:', error);
      throw error;
    }
    console.log('Game saved successfully to Supabase');
  }

  async loadGames(): Promise<Game[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    console.log('Attempting to load games from Supabase');
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase load error:', error);
      throw error;
    }
    console.log('Games loaded successfully from Supabase:', data?.length || 0);
    return data || [];
  }

  async loadGame(id: string): Promise<Game | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateGame(game: Game): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('games')
      .update(game)
      .eq('id', game.id);
    
    if (error) throw error;
  }

  async deleteGame(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  subscribeToGame(gameId: string, callback: (game: Game) => void): () => void {
    if (!supabase) throw new Error('Supabase not configured');
    
    const subscription = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'games',
          filter: `id=eq.${gameId}`
        }, 
        (payload) => {
          console.log('Real-time game update:', payload);
          if (payload.new) {
            callback(payload.new as Game);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }

  createGameCode(): string {
    // Generate a 6-character game code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Local storage fallback implementation
class LocalStorageService implements DatabaseService {
  private readonly STORAGE_KEY = 'wizard-score-games';

  async saveGame(game: Game): Promise<void> {
    const games = await this.loadGames();
    const existingIndex = games.findIndex(g => g.id === game.id);
    
    if (existingIndex >= 0) {
      games[existingIndex] = game;
    } else {
      games.push(game);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
  }

  async loadGames(): Promise<Game[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async loadGame(id: string): Promise<Game | null> {
    const games = await this.loadGames();
    return games.find(g => g.id === id) || null;
  }

  async updateGame(game: Game): Promise<void> {
    await this.saveGame(game);
  }

  async deleteGame(id: string): Promise<void> {
    const games = await this.loadGames();
    const filtered = games.filter(g => g.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  subscribeToGame(gameId: string, callback: (game: Game) => void): () => void {
    // Local storage doesn't support real-time, return empty unsubscribe function
    return () => {};
  }

  createGameCode(): string {
    // Generate a 6-character game code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export the appropriate service
export const databaseService: DatabaseService = supabase ? new SupabaseService() : new LocalStorageService();

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => !!supabase;
