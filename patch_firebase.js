const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

// Insert subscribeToPromoBanners
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
          active: data.active !== undefined ? !!data.active : true
        });
      });

      // Sort by order attribute if needed, but since save loops and we can't guarantee order easily, 
      // let's rely on the order field or just keep it simple. Actually, top banners uses order?
      // Top banners doesn't have an order field, we just trust the loop. Wait, firestore doesn't guarantee order unless we use order or doc id. 
      // Let's add an order field!
      loadedBanners.sort((a, b) => {
        return ((a as any).order || 0) - ((b as any).order || 0);
      });

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

// We need to add `order` to saveBannersToFirestore as well! 
// Let's modify saveBannersToFirestore so it saves `order: i`
code = code.replace(
  /active: banner.active !== false,?\s*}/,
  'active: banner.active !== false,\n      order: i\n    }'
);

// And in subscribeToBanners, sort by order
code = code.replace(
  /onBannersUpdate\(loadedBanners\);/,
  `loadedBanners.sort((a, b) => ((a as any).order || 0) - ((b as any).order || 0));\n      onBannersUpdate(loadedBanners);`
);

fs.writeFileSync('src/firebase.ts', code);
