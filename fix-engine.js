import fs from 'fs';
const file = 'src/core/engine.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  /export const stateEngine = new AtmosphereStateEngine\(\);/,
  `const globalForEngine = globalThis as unknown as { _stateEngine: AtmosphereStateEngine };\nexport const stateEngine = globalForEngine._stateEngine || new AtmosphereStateEngine();\nif (process.env.NODE_ENV !== "production") globalForEngine._stateEngine = stateEngine;`
);
fs.writeFileSync(file, code);
