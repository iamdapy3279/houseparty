import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix import
code = code.replace("import { gameRegistry } from './games';", "import { gameRegistry } from './games/registry';");

// Fix gameRegistry.get(...) to gameRegistry[...]
code = code.replace(/const game = gameRegistry\.get\((.*?)\);/g, "const game = gameRegistry[$1];");
code = code.replace(/const game = gameRegistry\[\(activeSession\.gameId\)\];/g, "const game = gameRegistry[activeSession.gameId];"); // Clean up just in case

// Fix catalog object to array for HostDashboard
// Currently, `catalog={catalog}` is passed. Where is `catalog` defined? 
code = code.replace(/const catalog = gameRegistry\.getAll\(\);/g, "const catalog = Object.values(gameRegistry).map(g => g.metadata);");

fs.writeFileSync('src/App.tsx', code);
