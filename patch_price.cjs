const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

code = code.replace(
  /          <\/div>\n          <p className="text-\[10px\] text-gray-400 mt-1 font-medium">\n            Em até 6x de \{formatPrice\(product\.price \/ 6\)\} sem juros\n          <\/p>\n        <\/div>/g,
  '          </div>\n        </div>'
);

fs.writeFileSync('src/components/ProductDetail.tsx', code);
