import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.startsWith('"use client";')) {
  code = '"use client";\n' + code;
  fs.writeFileSync('src/App.tsx', code);
}

// And fix page.tsx to ensure it just exports App
let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');
if (!pageCode.startsWith('"use client";')) {
  pageCode = '"use client";\n' + pageCode;
  fs.writeFileSync('src/app/page.tsx', pageCode);
}
