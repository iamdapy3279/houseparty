import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/const host = \n    if \(host\) setHostAccount\(host\);/g, "");
fs.writeFileSync('src/App.tsx', code);
