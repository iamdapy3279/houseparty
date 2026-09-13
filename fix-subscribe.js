import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const unsubscribe = stateEngine\.subscribe\(`rooms\/\$\{currentRoomCode\}`\, updatedRoom => \{[\s\S]*?\}\);/m;

const replacement = `const roomRef = ref(rtdb, \`rooms/\${currentRoomCode}\`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
      } else {
        setRoom(null);
      }
    });`;

code = code.replace(regex, replacement);
// also replace the cleanup return: return () => unsubscribe(); -> return () => off(roomRef, 'value', unsubscribe);
code = code.replace(/return \(\) => unsubscribe\(\);/g, "return () => off(roomRef, 'value', unsubscribe);");

fs.writeFileSync('src/App.tsx', code);
