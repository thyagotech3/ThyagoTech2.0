const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Celular dropdown
code = code.replace(
  /<div className="absolute left-0 mt-1 w-max bg-\[#0b1620\] border border-emerald-500\/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">/,
  '<div className="absolute left-0 mt-1 w-full bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">'
);

// PC dropdown
code = code.replace(
  /<div className="absolute left-1\/2 -translate-x-1\/2 mt-1 w-max bg-\[#0b1620\] border border-emerald-500\/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">/,
  '<div className="absolute left-0 mt-1 w-full bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">'
);

// Mais dropdown
code = code.replace(
  /<div className="absolute right-0 mt-1 w-max bg-\[#0b1620\] border border-emerald-500\/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">/,
  '<div className="absolute right-0 mt-1 w-full bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">'
);

// Replace whitespace-nowrap with truncate in the dropdown buttons
code = code.replace(
  /className="w-full text-left px-3\.5 py-1\.5 text-\[11px\] text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors whitespace-nowrap"/g,
  'className="w-full text-left px-3 py-1.5 text-[11px] text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors truncate"'
);

fs.writeFileSync('src/App.tsx', code);
