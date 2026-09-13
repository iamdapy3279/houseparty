import { NextResponse } from 'next/server';
import { rtdb } from '@/core/firebase';
import { ref, get, update } from 'firebase/database';
import { gameRegistry } from '@/games/registry';

export async function POST(req: Request, { params }: { params: { roomCode: string } }) {
  try {
    const { roomCode } = params;
    const action = await req.json();

    const roomRef = ref(rtdb, `rooms/${roomCode}`);
    const snap = await get(roomRef);
    const room = snap.val();

    if (!room || !room.currentSessionId) return NextResponse.json({ error: 'Invalid room/session' }, { status: 400 });

    const session = room.sessions[room.currentSessionId];
    const game = gameRegistry[session.gameId];

    const context = {
      roomId: roomCode, sessionId: room.currentSessionId, gameId: session.gameId, gameVersion: session.gameVersion,
      players: Object.values(room.players || {}), state: session.state, currentTime: Date.now(), roundNumber: session.state.round
    };

    const result = await game.handlePlayerAction(context, action);

    if (result.accepted && result.stateChanges) {
      const updates: any = {
        [`sessions/${room.currentSessionId}/state`]: result.stateChanges
      };
      
      if (result.scoreChange) {
        const currentScore = room.players[action.playerId]?.score || 0;
        updates[`players/${action.playerId}/score`] = currentScore + result.scoreChange;
      }

      await update(roomRef, updates);
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
