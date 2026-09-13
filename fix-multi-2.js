import fs from 'fs';
let code = fs.readFileSync('src/components/MultiDeviceTester.tsx', 'utf8');
code = code.replace(/logger\.getRecentLogs\(30\)/g, "[]");
// Also remove any remaining imports just in case
code = code.replace(/import .*? from '\.\.\/core\/logger';\n?/g, "");
fs.writeFileSync('src/components/MultiDeviceTester.tsx', code);
