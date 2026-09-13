import { NextResponse } from 'next/server';
import { rtdb } from '@/core/firebase';
import { ref, get, runTransaction } from 'firebase/database';

export async function POST(req: Request, { params }: { params: { roomCode: string } }) {
  try {
    const { roomCode } = params;
    const { name, uid, connectionId } = await req.json();
    
    if (!name || !uid || !connectionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const roomRef = ref(rtdb, `rooms/${roomCode}`);
    const roomSnap = await get(roomRef);
    const roomData = roomSnap.val();

    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (roomData.expiresAt && roomData.expiresAt < Date.now()) {
      return NextResponse.json({ error: 'Room has expired' }, { status: 410 });
    }

    // Use a transaction to safely add the player and enforce 20 player limit
    const playerRef = ref(rtdb, `rooms/${roomCode}/players`);
    const result = await runTransaction(playerRef, (players) => {
      if (!players) {
        players = {};
      }
      
      const playerCount = Object.keys(players).length;
      if (playerCount >= 20 && !players[uid]) {
        // Reject if full and it's a new player
        return; 
      }

      if (!players[uid]) {
        players[uid] = {
          name,
          score: 0,
          connections: {
            [connectionId]: { connectedAt: Date.now() }
          }
        };
      } else {
        // Player already exists, add connection
        if (!players[uid].connections) {
          players[uid].connections = {};
        }
        players[uid].connections[connectionId] = { connectedAt: Date.now() };
      }

      return players;
    });

    if (!result.committed) {
      return NextResponse.json({ error: 'Room is full (max 20 players)' }, { status: 403 });
    }

    return NextResponse.json({ success: true, playerId: uid });
  } catch (err: any) {
    console.error('Room join error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
