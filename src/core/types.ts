export interface GameMetadata {
  category?: string;
  id: string;
  name: string;
  description: string;
  version: string;
  icon?: string;
  thumbnail?: string;
  minPlayers: number;
  maxPlayers: number;
  supportedControllerTypes: string[];
  active: boolean;
  freeTierAccess: boolean;
}

export interface GameContext {
  roomId: string;
  sessionId: string;
  gameId: string;
  gameVersion: string;
  players: any[];
  state: GameState;
  currentTime: number;
  roundNumber: number;
  roundEndsAt?: number;
}

export interface PlayerContext {
  roomId: string;
  sessionId: string;
  playerId: string;
  playerName: string;
  score: number;
  gameState: GameState;
}

export interface PlayerAction {
  actionId: string;
  playerId: string;
  type: string;
  payload: unknown;
  clientTimestamp: number;
}

export interface GameActionResult {
  accepted: boolean;
  reason?: string;
  stateChanges?: Partial<GameState>;
  scoreChange?: number;
  events?: any[];
}

export interface GameState {
  phase: string;
  round: number;
  data: Record<string, unknown>;
  roundEndsAt?: number;
}

export interface HostView {
  subtitle?: string;
  type: string;
  title?: string;
  content: any[];
  timer?: { endsAt: number };
}

export interface ControllerView {
  timer?: { endsAt: number };
  prompt?: string;
  submitted?: boolean;
  lastFeedback?: { type: string, text: string, rank?: number };
  type: string;
  title?: string;
  components: any[];
  disabled?: boolean;
}

export interface GameModule {
  metadata: GameMetadata;
  initialize(context: GameContext): Promise<GameState>;
  start(context: GameContext): Promise<GameState>;
  handlePlayerAction(context: GameContext, action: PlayerAction): Promise<GameActionResult>;
  advance(context: GameContext): Promise<GameState>;
  getHostView(context: GameContext): HostView;
  getControllerView(context: PlayerContext): ControllerView;
  calculateScore(context: GameContext, action: PlayerAction): any;
  end(context: GameContext): Promise<any>;
}

export interface RoomRecord {
  roomCode: string;
  hostId: string;
  createdAt: number;
  expiresAt: number;
  status: 'WAITING' | 'ACTIVE' | 'EXPIRED';
  currentSessionId?: string;
  players?: Record<string, RoomPlayer>;
  sessions?: Record<string, SessionRecord>;
}

export interface HostAccount {
  id?: string;
  tier?: string;
  activeEntitlements?: { type: string, expiresAt: number }[];
  createdRoomsToday?: number;
  uid: string;
  name: string;
  isPatron?: boolean;
}

export interface RoomPlayer {
  playerId: string;
  name: string;
  score: number;
  roomScore?: number;
  connections?: Record<string, { connectedAt: number }>;
}

export interface SessionRecord {
  sessionId?: string;
  round?: number;
  roundEndsAt?: number;
  gameId: string;
  gameVersion: string;
  status: string;
  state: GameState;
  startedAt: number;
}

export type HostComponent = { type: string; [key: string]: any; };

export interface OperationalLogEvent { id: string; timestamp: number; type: string; details: any; }
