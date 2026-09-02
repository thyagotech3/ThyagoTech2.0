const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('export async function deleteBannerFromFirestore')) {
  code = code.replace(
    /export async function saveBannersToFirestore/,
    `/**\n * Delete banner from Firestore\n */\nexport async function deleteBannerFromFirestore(bannerId: string): Promise<void> {\n  const docRef = doc(db, "banners", bannerId);\n  await deleteDoc(docRef);\n}\n\nexport async function saveBannersToFirestore`
  );
  fs.writeFileSync('src/firebase.ts', code);
}
