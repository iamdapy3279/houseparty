import { GameModule, GameContext, GameState, PlayerAction, GameActionResult, HostView, ControllerView, PlayerContext } from '@/core/types';
import { GoogleGenAI } from '@google/genai';

const TARGET_WORD = 'ATMOSPHERE';

// Cache for word distances to avoid repeating API calls for the same guesses
const distanceCache: Record<string, number> = {
  [TARGET_WORD]: 0
};

// Only initialize Gemini if API key is present (server-side only)
let ai: GoogleGenAI | null = null;
if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function getDistance(guess: string, target: string): Promise<number> {
  if (guess === target) return 0;
  if (distanceCache[guess] !== undefined) return distanceCache[guess];

  if (!ai) {
    // Fallback if no API key is provided
    const mockDistance = Math.floor(Math.random() * 1000) + 1;
    distanceCache[guess] = mockDistance;
    return mockDistance;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are playing a game like Contexto.
The secret word is "${target}".
The player guessed the word "${guess}".
Rank how similar in context and meaning the word "${guess}" is to "${target}".
Provide a single integer ranking from 1 to 100000, where 1 means it's extremely similar/synonymous, and 100000 means it's completely unrelated.
Only output the raw integer, nothing else.`,
    });
    
    const distanceStr = response.text?.trim();
    let distance = distanceStr ? parseInt(distanceStr, 10) : NaN;
    if (isNaN(distance) || distance <= 0) {
      distance = Math.floor(Math.random() * 1000) + 1;
    }
    
    distanceCache[guess] = distance;
    return distance;
  } catch (e) {
    console.error("Failed to get distance from Gemini", e);
    return Math.floor(Math.random() * 1000) + 1;
  }
}

export const ContextoGame: GameModule = {
  metadata: {
    id: 'contexto',
    name: 'Contexto',
    description: 'Find the secret word by its similarity to your guesses.',
    version: '1.0.0',
    minPlayers: 1,
    maxPlayers: 20,
    supportedControllerTypes: ['text_input'],
    active: true,
    freeTierAccess: true
  },
  
  async initialize(context: GameContext) {
    return { phase: 'WAITING', round: 0, data: {} };
  },
  
  async start(context: GameContext) {
    const roundEndsAt = Date.now() + 60000; // 60 seconds
    return {
      phase: 'PLAYING',
      round: 1,
      roundEndsAt, // Add timer
      data: {
        guesses: [],
        targetFound: false,
        winner: null
      }
    };
  },
  
  async handlePlayerAction(context, action) {
    if (action.type !== 'SUBMIT_GUESS') return { accepted: false, reason: 'Invalid action type' };
    const guess = (action.payload as any).guess?.toUpperCase();
    if (!guess) return { accepted: false, reason: 'Empty guess' };
    
    const state = context.state;
    const isMatch = guess === TARGET_WORD;
    
    const distance = await getDistance(guess, TARGET_WORD);
    
    const newGuesses = [...(state.data.guesses as any[] || []), { 
       playerId: action.playerId, 
       guess, 
       distance 
    }];
    
    newGuesses.sort((a, b) => a.distance - b.distance);
    
    return {
      accepted: true,
      stateChanges: {
        ...state,
        data: {
          ...state.data,
          guesses: newGuesses,
          targetFound: state.data.targetFound || isMatch,
          winner: isMatch ? action.playerId : state.data.winner
        }
      },
      scoreChange: isMatch ? 100 : 0
    };
  },
  
  async advance(context) {
    if (context.state.data.targetFound) {
      return { ...context.state, phase: 'FINISHED' };
    }
    return context.state;
  },
  
  getHostView(context) {
    const guesses = (context.state.data.guesses as any[] || []);
    return {
      type: 'LEADERBOARD',
      title: 'Contexto: Guess the Secret Word',
      timer: context.state.roundEndsAt ? { endsAt: context.state.roundEndsAt } : undefined,
      content: [
        { type: 'text', text: context.state.phase === 'FINISHED' ? `The word was ${TARGET_WORD}!` : 'Keep guessing...' },
        { type: 'list', items: guesses.slice(0, 5).map(g => `${g.guess} - Rank: ${g.distance}`) }
      ]
    };
  },
  
  getControllerView(context) {
    return {
      type: 'text_input',
      title: 'Enter your guess',
      components: [
        { type: 'input', id: 'guess_input', placeholder: 'Type a word...' },
        { type: 'submit_button', label: 'GUESS' }
      ],
      disabled: context.gameState.phase === 'FINISHED'
    };
  },
  
  calculateScore(context, action) {
    return (action.payload as any).guess?.toUpperCase() === TARGET_WORD ? 100 : 0;
  },
  
  async end(context) {
    return { winner: context.state.data.winner };
  }
};
