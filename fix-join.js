import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The original rewrite regex for `handleJoinSession` might have failed because I didn't match the whole old function correctly. 
// I will use regex to find the entire `const handleJoinSession = (moniker: string, code: string) => { ... };` block.
code = code.replace(/const handleJoinSession = \(moniker: string, code: string\) => \{[\s\S]*?setCurrentRoomCode\(code\);\s*\}\);\s*\};/, 
`const handleJoinSession = async (moniker: string, roomCode: string) => {
    setIsInitiating(true);
    setJoinError('');
    try {
      const code = roomCode.toUpperCase();
      const userCred = await signInAnonymously(auth);
      const uid = userCred.user.uid;
      const connectionId = 'conn_' + uid;

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

fs.writeFileSync('src/App.tsx', code);
