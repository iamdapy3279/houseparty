import fs from 'fs';
let code = fs.readFileSync('src/components/MultiDeviceTester.tsx', 'utf8');
code = code.replace(/\{log\.event\}/g, "{log.type}");
code = code.replace(/log\.detail/g, "log.details");
code = code.replace(/log\.result/g, "''");
fs.writeFileSync('src/components/MultiDeviceTester.tsx', code);
