import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will just use string manipulation instead of fancy regex since it's failing
const startStr = "const handleJoinSession = (moniker: string, code: string) => {";
const endStr = "  // Handle Host Launching Next Game";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newBlock = `const handleJoinSession = async (moniker: string, roomCode: string) => {
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
  };

`;
  
  code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
  fs.writeFileSync('src/App.tsx', code);
}
