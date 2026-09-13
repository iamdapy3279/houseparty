import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/onSuccess=\{name => \{/g, 'onSuccess={(name, uid) => {');
fs.writeFileSync('src/App.tsx', code);
