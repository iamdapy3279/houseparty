import { GameModule } from '@/core/types';
import { ContextoGame } from './contexto';

export const gameRegistry: Record<string, GameModule> = {
  'contexto': ContextoGame
};
