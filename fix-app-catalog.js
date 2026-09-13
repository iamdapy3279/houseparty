import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/gameRegistry\.list\(\)/g, "Object.values(gameRegistry).map(g => g.metadata)");
fs.writeFileSync('src/App.tsx', code);
