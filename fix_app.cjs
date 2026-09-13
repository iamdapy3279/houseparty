const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix handleJoinSession
code = code.replace(
  /const result = stateEngine\.joinRoom\(code, moniker\);\s*if \(\!result\.success \|\| \!result\.playerId\) \{/,
  `stateEngine.joinRoom(code, moniker).then(result => {\n    if (!result.success || !result.playerId) {`
);
code = code.replace(
  /setViewMode\('controller'\);\s*\};/g,
  `setViewMode('controller');\n    });\n  };`
);

// Fix createRoom 
code = code.replace(
  /setTimeout\(\(\) => \{\s*const result = stateEngine\.createRoom\(hostAccount\?\.id \|\| 'host_commander'\);([\s\S]*?)const newRoom = stateEngine\.getRoom\(code\);[\s\S]*?if \(vx\) \{ vx\.roomScore = 940; vx\.score = 150; \}\s*\}\s*setCurrentRoomCode\(code\);\s*setUserRole\('host'\);\s*setViewMode\('host'\);\s*\}, 600\);/m,
  `setTimeout(() => {
      stateEngine.createRoom(hostAccount?.id || 'host_commander').then(result => {
        setIsInitiating(false);
        if (!result.success || !result.roomCode) {
          setJoinError(result.error || 'Failed to dispatch chamber');
          return;
        }
        const code = result.roomCode;
        setCurrentRoomCode(code);
        setUserRole('host');
        setViewMode('host');
      });
    }, 600);`
);

// Fix processPayment
code = code.replace(/stateEngine\.processPayment[\s\S]*?setShowEntitlementsModal\(false\);/, 'setShowEntitlementsModal(false);');

fs.writeFileSync('src/App.tsx', code);
