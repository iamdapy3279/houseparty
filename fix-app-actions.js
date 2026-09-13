import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// handleStartGameSession
code = code.replace(/await stateEngine\.startSession\(currentRoomCode, gameId\);/g, 
`await fetch(\`/api/rooms/\${currentRoomCode}/sessions\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });`);

// handleAdvanceRound
code = code.replace(/await stateEngine\.advanceRound\(currentRoomCode\);/g,
`await fetch(\`/api/rooms/\${currentRoomCode}/advance\`, {
      method: 'POST'
    });`);

// handleSubmitPlayerAction
code = code.replace(/await stateEngine\.submitAction\(currentRoomCode, action\);/g,
`await fetch(\`/api/rooms/\${currentRoomCode}/actions\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });`);

// handleLeaveRoom disconnect
code = code.replace(/stateEngine\.disconnectConnection\(currentRoomCode, myPlayerId, 'conn_main'\);/g,
`fetch(\`/api/rooms/\${currentRoomCode}/disconnect\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId, connectionId: 'conn_main' })
      });`);

// handleAddSimulatedPlayer
code = code.replace(/stateEngine\.joinRoom\(currentRoomCode, nextName\);/g,
`const uid = 'sim_' + Math.random().toString(36).substring(2, 8);
    fetch(\`/api/rooms/\${currentRoomCode}/join\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nextName, uid, connectionId: 'conn_sim_' + uid })
    });`);

fs.writeFileSync('src/App.tsx', code);
