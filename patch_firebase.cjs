const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const subscribeCode = `
/**
 * Real-time listener for Promo Banners collection
 */
export function subscribeToPromoBanners(
  onPromoBannersUpdate: (banners: BannerItem[]) => void,
  onError?: (error: Error) => void
) {
  const bannersCol = collection(db, "promo_banners");

  return onSnapshot(
    bannersCol,
    (snapshot) => {
      const loadedBanners: BannerItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedBanners.push({
          id: docSnap.id,
          src: data.src || "",
          alt: data.alt || "Banner Promocional",
          title: data.title || "",
          linkGroup: data.linkGroup,
          linkFilter: data.linkFilter,
          active: data.active !== undefined ? !!data.active : true,
          order: typeof data.order === 'number' ? data.order : 999
        } as any);
      });

      loadedBanners.sort((a: any, b: any) => a.order - b.order);
      onPromoBannersUpdate(loadedBanners);
    },
    (err) => {
      console.warn("Notice: Firestore promo banners offline or initial sync:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save all promo banners to Firestore
 */
export async function savePromoBannersToFirestore(banners: BannerItem[]): Promise<void> {
  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];
    const docRef = doc(db, "promo_banners", banner.id);
    await setDoc(docRef, {
      src: banner.src,
      alt: banner.alt,
      title: banner.title || "",
      linkGroup: banner.linkGroup || null,
      linkFilter: banner.linkFilter || null,
      active: banner.active !== false,
      order: i
    }, { merge: true });
  }
}

/**
 * Delete promo banner from Firestore
 */
export async function deletePromoBannerFromFirestore(bannerId: string): Promise<void> {
  const docRef = doc(db, "promo_banners", bannerId);
  await deleteDoc(docRef);
}
`;

code = code.replace(
  /export async function saveBannersToFirestore/,
  subscribeCode + '\nexport async function saveBannersToFirestore'
);

// Add order to loadedBanners in subscribeToBanners
code = code.replace(
  /active: data.active !== undefined \? !!data.active : true\s*}\);/g,
  'active: data.active !== undefined ? !!data.active : true,\n          order: typeof data.order === "number" ? data.order : 999\n        } as any);'
);

code = code.replace(
  /onBannersUpdate\(loadedBanners\);/,
  `loadedBanners.sort((a: any, b: any) => a.order - b.order);\n      onBannersUpdate(loadedBanners);`
);

// Add order to saveBannersToFirestore
code = code.replace(
  /active: banner.active !== false\s*}, { merge: true }\);/g,
  'active: banner.active !== false,\n      order: i\n    }, { merge: true });'
);

fs.writeFileSync('src/firebase.ts', code);
