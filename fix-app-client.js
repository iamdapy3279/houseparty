import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.startsWith('"use client";')) {
  code = '"use client";\n' + code;
  fs.writeFileSync('src/App.tsx', code);
}
