import fs from 'fs';
let code = fs.readFileSync('src/core/types.ts', 'utf8');
code = code.replace(/export interface ControllerView \{/, `export interface ControllerView {
  timer?: { endsAt: number };`);
fs.writeFileSync('src/core/types.ts', code);
