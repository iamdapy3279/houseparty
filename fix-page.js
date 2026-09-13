import fs from 'fs';
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace(/import \{ App \} from "\.\.\/App";/, 'import App from "../App";');
fs.writeFileSync('src/app/page.tsx', page);
