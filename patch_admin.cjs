const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add props to interface
code = code.replace(
  /onSaveBanners\?: \(updatedBanners: BannerItem\[\]\) => void;/,
  `onSaveBanners?: (updatedBanners: BannerItem[]) => void;\n  promoBannersList?: BannerItem[];\n  onSavePromoBanners?: (updatedBanners: BannerItem[]) => void;`
);

// 2. Add props to component signature
code = code.replace(
  /onSaveBanners,\s*storeSettings,\s*onSaveSettings,\s*onBack/,
  `onSaveBanners,\n  promoBannersList,\n  onSavePromoBanners,\n  storeSettings,\n  onSaveSettings,\n  onBack`
);

// 3. Update currentBanners definition
code = code.replace(
  /const currentBanners = bannerSubView === "topo"\s*\?\s*\(banners && banners\.length > 0 \? banners : initialBanners\)\s*:\s*\(storeSettings\?\.promoBanners \|\| \[\]\);/,
  `const currentBanners = bannerSubView === "topo"\n    ? (banners && banners.length > 0 ? banners : initialBanners)\n    : (promoBannersList || []);`
);

// 4. Update saveBannersList
code = code.replace(
  /if \(onSaveSettings\) \{\n\s*onSaveSettings\(\{\s*\.\.\.\(storeSettings \|\| defaultStoreSettings\),\s*promoBanners: updated\s*\}\);\n\s*\}/,
  `if (onSavePromoBanners) onSavePromoBanners(updated);`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
