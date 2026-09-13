const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("import {\nimport { HostSalonLanding", "import { HostSalonLanding");
fs.writeFileSync('src/App.tsx', code);
