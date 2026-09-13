import { NextResponse } from 'next/server';
import { rtdb } from '@/core/firebase';
import { ref, remove } from 'firebase/database';

export async function POST(req: Request, { params }: { params: { roomCode: string } }) {
  const { roomCode } = params;
  const { playerId, connectionId } = await req.json();
  
  if (playerId && connectionId) {
    const connRef = ref(rtdb, `rooms/${roomCode}/players/${playerId}/connections/${connectionId}`);
    await remove(connRef);
  }
  
  return NextResponse.json({ success: true });
}
