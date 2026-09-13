import { NextResponse } from 'next/server';
import { rtdb } from '@/core/firebase';
import { ref, runTransaction } from 'firebase/database';

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: Request) {
  try {
    const { hostId } = await req.json();
    
    if (!hostId) {
      return NextResponse.json({ error: 'Missing hostId' }, { status: 400 });
    }

    let roomCode = '';
    let success = false;
    let attempts = 0;

    while (!success && attempts < 10) {
      const code = generateCode();
      const roomRef = ref(rtdb, `rooms/${code}`);
      
      const result = await runTransaction(roomRef, (currentData) => {
        const now = Date.now();
        // If room doesn't exist, or it expired, we can take it
        if (currentData === null || (currentData.expiresAt && currentData.expiresAt < now)) {
          return {
            roomCode: code,
            hostId,
            createdAt: now,
            expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
            status: 'WAITING'
          };
        }
        // Abort transaction if active room exists
        return undefined;
      });

      if (result.committed) {
        success = true;
        roomCode = code;
      }
      attempts++;
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to allocate room code. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, roomCode });
  } catch (err: any) {
    console.error('Room creation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
