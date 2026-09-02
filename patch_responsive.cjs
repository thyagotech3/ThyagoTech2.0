const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="absolute left-0 mt-1 w-full bg-\[#0b1620\]/g,
  '<div className="absolute left-0 mt-1 min-w-full w-max max-w-[180px] sm:max-w-[220px] bg-[#0b1620]'
);

code = code.replace(
  /<div className="absolute right-0 mt-1 w-full bg-\[#0b1620\]/g,
  '<div className="absolute right-0 mt-1 min-w-full w-max max-w-[180px] sm:max-w-[220px] bg-[#0b1620]'
);

fs.writeFileSync('src/App.tsx', code);
