import { NextResponse } from 'next/server';
import { rtdb } from '@/core/firebase';
import { ref, get, update } from 'firebase/database';
import { gameRegistry } from '@/games/registry';

export async function POST(req: Request, { params }: { params: { roomCode: string } }) {
  try {
    const { roomCode } = params;
    const { gameId } = await req.json();
    
    const game = gameRegistry[gameId];
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    const roomRef = ref(rtdb, `rooms/${roomCode}`);
    const snap = await get(roomRef);
    if (!snap.exists()) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    // Mock Context for Initialization
    const mockContext = {
      roomId: roomCode, sessionId: 'sess_' + Date.now(), gameId, gameVersion: '1.0.0',
      players: [], state: { phase: 'INIT', round: 0, data: {} }, currentTime: Date.now(), roundNumber: 0
    };
    const initialState = await game.start(mockContext);
    const sessionId = 'sess_' + Date.now();
    await update(roomRef, {
      status: 'ACTIVE',
      [`sessions/${sessionId}`]: {
        gameId,
        gameVersion: game.metadata.version,
        status: 'ACTIVE',
        state: initialState,
        startedAt: Date.now(),
        ...(initialState.roundEndsAt ? { roundEndsAt: initialState.roundEndsAt } : {})
      },
      currentSessionId: sessionId
    });
    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
