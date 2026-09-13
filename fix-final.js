import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `const handleJoinSession = async (moniker: string, roomCode: string) => {
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
  };`;

const startIdx = code.indexOf("const handleJoinSession = (moniker: string, code: string) => {");
const endIdx = code.indexOf("  // Host Starts a Game");

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + replacement + "\n\n" + code.substring(endIdx);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success string replace");
} else {
  console.log("Could not find bounds", startIdx, endIdx);
}
