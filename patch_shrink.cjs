const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Reduce max-widths by ~20%
code = code.replace(/max-w-\[180px\]/g, 'max-w-[145px]');
code = code.replace(/sm:max-w-\[220px\]/g, 'sm:max-w-[175px]');

// Also slightly reduce horizontal padding of the dropdown items to make the natural 'w-max' smaller
code = code.replace(/px-3 py-1\.5 text-\[11px\]/g, 'px-2 py-1.5 text-[11px]');

fs.writeFileSync('src/App.tsx', code);
