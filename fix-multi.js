import fs from 'fs';
let code = fs.readFileSync('src/components/MultiDeviceTester.tsx', 'utf8');
code = code.replace(/import \{ logger \} from '\.\.\/core\/logger';/g, "");
fs.writeFileSync('src/components/MultiDeviceTester.tsx', code);
