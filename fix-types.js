import fs from 'fs';
let code = fs.readFileSync('src/core/types.ts', 'utf8');
code = code.replace(/export interface RoomRecord \{[\s\S]*?\}/, `export interface RoomRecord {
  roomCode: string;
  hostId: string;
  createdAt: number;
  expiresAt: number;
  status: 'WAITING' | 'ACTIVE' | 'EXPIRED';
  currentSessionId?: string;
  players?: Record<string, RoomPlayer>;
  sessions?: Record<string, SessionRecord>;
}`);
fs.writeFileSync('src/core/types.ts', code);
