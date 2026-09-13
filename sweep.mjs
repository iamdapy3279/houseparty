const DB_URL = "https://fountain-forest-pub-default-rtdb.asia-southeast1.firebasedatabase.app/rooms.json";

setInterval(async () => {
  try {
    const res = await fetch(DB_URL);
    if (!res.ok) return;
    const rooms = await res.json();
    if (!rooms) return;
    
    const now = Date.now();
    for (const [roomCode, room] of Object.entries(rooms)) {
      if (room.status === 'ACTIVE' && room.currentSessionId) {
         const session = room.sessions?.[room.currentSessionId];
         if (session && session.roundEndsAt && session.roundEndsAt <= now && session.state?.phase === 'PLAYING') {
            console.log(`Advancing room ${roomCode} (Timer expired)`);
            await fetch(`http://localhost:3000/api/rooms/${roomCode}/advance`, { method: 'POST' }).catch(console.error);
         }
      }
    }
  } catch (e) {
    console.error("Sweep error", e.message);
  }
}, 5000);

console.log("Timer sweep service started.");
