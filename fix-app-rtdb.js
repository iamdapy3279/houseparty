import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace stateEngine imports
code = code.replace("import { stateEngine } from './core/state-store';", 
"import { ref, onValue, off, onDisconnect } from 'firebase/database';\nimport { rtdb, auth, signInAnonymously } from './core/firebase';\nimport { v4 as uuidv4 } from 'uuid';");

// Use standard API routes for Room Creation
code = code.replace("stateEngine.createRoom(hostAccount?.id || 'host_commander').then(result => {", 
`fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: hostAccount?.id || 'host_commander' })
      }).then(res => res.json()).then(result => {`);

// Rewrite join session logic
code = code.replace(/const handleJoinSession = \(moniker: string, roomCode: string\) => \{[\s\S]*?\}\);/m,
`const handleJoinSession = async (moniker: string, roomCode: string) => {
    setIsInitiating(true);
    setJoinError('');
    try {
      const code = roomCode.toUpperCase();
      // Anonymous Auth for guest
      const userCred = await signInAnonymously(auth);
      const uid = userCred.user.uid;
      const connectionId = 'conn_' + uuidv4();

      const res = await fetch(\`/api/rooms/\${code}/join\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: moniker, uid, connectionId })
      });
      const result = await res.json();
      
      if (!result.success) {
        setJoinError(result.error || 'Failed to enter chamber');
        setIsInitiating(false);
        return;
      }

      // Setup presence
      const myConnRef = ref(rtdb, \`rooms/\${code}/players/\${uid}/connections/\${connectionId}\`);
      onDisconnect(myConnRef).remove();

      setCurrentRoomCode(code);
      setViewMode('controller');
      setMyPlayerId(uid);
      setIsInitiating(false);
    } catch (e: any) {
      setJoinError(e.message || 'Network error');
      setIsInitiating(false);
    }
  };`);

// Remove old load host account
code = code.replace(/useEffect\(\(\) => \{\s*const host = stateEngine.getHostAccount\('host_commander'\);\s*if \(host\) \{\s*setHostAccount\(host\);\s*\}\s*\}, \[\]\);/g, 
"");

// Re-write RTDB Subscription
code = code.replace(/useEffect\(\(\) => \{\s*if \(!currentRoomCode\) return;\s*const unsubscribe = stateEngine.subscribe\(`rooms\/\$\{currentRoomCode\}`\, updatedRoom => \{\s*setRoom\(updatedRoom\);\s*\}\);\s*return \(\) => unsubscribe\(\);\s*\}, \[currentRoomCode\]\);/m,
`useEffect(() => {
    if (!currentRoomCode) return;
    const roomRef = ref(rtdb, \`rooms/\${currentRoomCode}\`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data as RoomRecord);
      } else {
        setRoom(null);
      }
    });
    return () => off(roomRef, 'value', unsubscribe);
  }, [currentRoomCode]);`);

fs.writeFileSync('src/App.tsx', code);
