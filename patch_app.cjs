const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add promoBanners state
if (!code.includes('const [promoBanners, setPromoBanners]')) {
  code = code.replace(
    /const \[banners, setBanners\] = useState<BannerItem\[\]>\(\[\]\);/,
    `const [banners, setBanners] = useState<BannerItem[]>([]);\n  const [promoBanners, setPromoBanners] = useState<BannerItem[]>([]);`
  );
}

// 2. Add imports
code = code.replace(
  /import {\s*auth,\s*db,/,
  `import {\n  auth,\n  db,`
);

code = code.replace(
  /subscribeToBanners,\s*/,
  `subscribeToBanners,\n  subscribeToPromoBanners,\n  deletePromoBannerFromFirestore,\n  savePromoBannersToFirestore,\n  deleteBannerFromFirestore,\n  `
);

// 3. Add to useEffect for initial load
const promoBannersEffect = `
    const unsubscribePromoBanners = subscribeToPromoBanners((livePromoBanners) => {
      if (livePromoBanners && livePromoBanners.length > 0) {
        setPromoBanners(livePromoBanners);
        localStorage.setItem("thyago_tech_promo_banners", JSON.stringify(livePromoBanners));
      } else {
        setPromoBanners([]);
      }
    });
`;
code = code.replace(
  /const unsubscribeSettings = subscribeToSettings/,
  `${promoBannersEffect}\n    const unsubscribeSettings = subscribeToSettings`
);
code = code.replace(
  /unsubscribeBanners\(\);/,
  `unsubscribeBanners();\n      unsubscribePromoBanners();`
);

// Fallback load for promoBanners
const promoBannersFallback = `
    const savedPromoBanners = localStorage.getItem("thyago_tech_promo_banners");
    if (savedPromoBanners) {
      try {
        setPromoBanners(JSON.parse(savedPromoBanners));
      } catch (e) {}
    }
`;
code = code.replace(
  /const savedLocalSettings = localStorage.getItem\("thyago_tech_settings"\);/,
  `${promoBannersFallback}\n    const savedLocalSettings = localStorage.getItem("thyago_tech_settings");`
);

// 4. Update handleSaveBanners to handle deletions
const saveBannersFunction = `
  const handleSaveBanners = async (updatedBanners: BannerItem[]) => {
    const previousBanners = banners;
    setBanners(updatedBanners);
    localStorage.setItem("thyago_tech_banners", JSON.stringify(updatedBanners));

    try {
      const updatedIds = new Set(updatedBanners.map(b => b.id));
      const deletedBanners = previousBanners.filter(b => !updatedIds.has(b.id));
      for (const del of deletedBanners) {
        try { await deleteBannerFromFirestore(del.id); } catch (e) {}
      }

      await saveBannersToFirestore(updatedBanners);
      showToast("✓ Banners sincronizados no Firebase Cloud!");
    } catch (err) {
      console.warn("Error syncing banners to Firestore:", err);
    }
  };

  const handleSavePromoBanners = async (updatedBanners: BannerItem[]) => {
    const previousBanners = promoBanners;
    setPromoBanners(updatedBanners);
    localStorage.setItem("thyago_tech_promo_banners", JSON.stringify(updatedBanners));

    try {
      const updatedIds = new Set(updatedBanners.map(b => b.id));
      const deletedBanners = previousBanners.filter(b => !updatedIds.has(b.id));
      for (const del of deletedBanners) {
        try { await deletePromoBannerFromFirestore(del.id); } catch (e) {}
      }

      await savePromoBannersToFirestore(updatedBanners);
      showToast("✓ Banner 2 sincronizado no Firebase Cloud!");
    } catch (err) {
      console.warn("Error syncing promo banners to Firestore:", err);
    }
  };
`;
code = code.replace(
  /const handleSaveBanners = async \([\s\S]*?};\n/,
  saveBannersFunction
);

// 5. Pass to AdminPanel
code = code.replace(
  /banners={banners}\n\s*onSaveBanners={handleSaveBanners}\n\s*storeSettings={storeSettings}/,
  `banners={banners}\n                  onSaveBanners={handleSaveBanners}\n                  promoBannersList={promoBanners}\n                  onSavePromoBanners={handleSavePromoBanners}\n                  storeSettings={storeSettings}`
);

// 6. Update usage in App.tsx render
code = code.replace(
  /storeSettings\.promoBanners && storeSettings\.promoBanners\.length > 0\s*\?\s*storeSettings\.promoBanners/,
  `promoBanners && promoBanners.length > 0 ? promoBanners`
);

fs.writeFileSync('src/App.tsx', code);
