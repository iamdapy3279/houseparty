/**
 * Generic Game Registry
 * Enforces pure modularity: the platform does not contain any game-specific logic or switches.
 * Any game can be registered, listed, and queried through this contract.
 */

import { GameModule, GameMetadata } from './types';

class GameRegistry {
  private games = new Map<string, GameModule>();

  public register(gameModule: GameModule): void {
    if (!gameModule.metadata || !gameModule.metadata.id) {
      throw new Error('Invalid GameModule: metadata.id is required');
    }
    this.games.set(gameModule.metadata.id, gameModule);
  }

  public get(gameId: string): GameModule | undefined {
    return this.games.get(gameId);
  }

  public has(gameId: string): boolean {
    return this.games.has(gameId);
  }

  public list(): GameMetadata[] {
    return Array.from(this.games.values()).map(g => g.metadata);
  }

  public getActiveGames(): GameMetadata[] {
    return this.list().filter(m => m.active);
  }
}

export const gameRegistry = new GameRegistry();
