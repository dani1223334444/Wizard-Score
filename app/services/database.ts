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
}

// Supabase implementation
class SupabaseService implements DatabaseService {
  async saveGame(game: Game): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('games')
      .insert([game]);
    
    if (error) throw error;
  }

  async loadGames(): Promise<Game[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
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
}

// Export the appropriate service
export const databaseService: DatabaseService = supabase ? new SupabaseService() : new LocalStorageService();

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => !!supabase;
