import fs from 'fs';
let code = `
"use client";
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App').then(mod => mod.default), { ssr: false });

export default function Home() {
  return <App />;
}
`;
fs.writeFileSync('src/app/page.tsx', code);
