import fs from 'fs';
let code = fs.readFileSync('src/core/types.ts', 'utf8');

// Fix lastFeedback
code = code.replace(/lastFeedback\?\: \{ type\: string, message\: string \};/, "lastFeedback?: { type: string, text: string, rank?: number };");

// Fix activeEntitlements
code = code.replace(/activeEntitlements\?\: string\[\];/, "activeEntitlements?: { type: string, expiresAt: number }[];");

// Add OperationalLogEvent
code += `\nexport interface OperationalLogEvent { id: string; timestamp: number; type: string; details: any; }\n`;

fs.writeFileSync('src/core/types.ts', code);

// Fix MultiDeviceTester reference
let mdt = fs.readFileSync('src/components/MultiDeviceTester.tsx', 'utf8');
mdt = "import { OperationalLogEvent } from '../core/types';\n" + mdt;
fs.writeFileSync('src/components/MultiDeviceTester.tsx', mdt);

