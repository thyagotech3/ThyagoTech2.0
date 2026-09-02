import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp
} from "firebase/firestore";
import { Product, BannerItem, StoreSettings, defaultStoreSettings, Sale, SaleItem } from "./types";
import { initialProducts } from "./initialProducts";
import { initialBanners } from "./initialBanners";
import { compressImage } from "./utils/imageCompressor";

// Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyDwzufmckYacw417OKGp-LfbYxLM6bVEAw",
  authDomain: "thyagotech.firebaseapp.com",
  projectId: "thyagotech",
  storageBucket: "thyagotech.firebasestorage.app",
  messagingSenderId: "667911601795",
  appId: "1:667911601795:web:187411aa4fb502771b65b6",
  measurementId: "G-388RSNEDQY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Sole authorized master administrator email (strictly enforced)
export const ADMIN_EMAIL = "thyago.tech3@gmail.com";
export const ADMIN_MASTER_PASS = "Th123@##";

// Custom auth listeners registry to handle both Firebase Auth and graceful local fallback
type AuthListener = (user: User | null) => void;
const authListeners: Set<AuthListener> = new Set();

// Mock User object structure when operating in direct secure fallback
function createAdminUserObject(): User {
  return {
    uid: "admin-thyago-master",
    email: ADMIN_EMAIL,
    displayName: "Thyago Tech (Admin)",
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "token",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => "admin-token",
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: "password"
  } as unknown as User;
}

/**
 * Universal auth state listener supporting Firebase Auth and local session
 */
export function onAuthStateChanged(authInstance: any, callback: (user: User | null) => void) {
  authListeners.add(callback);

  // Check if there is an active local admin session
  const storedSession = localStorage.getItem("thyago_tech_admin_session");
  if (storedSession === "true") {
    callback(createAdminUserObject());
  }

  // Subscribe to Firebase Auth
  const unsubscribeFirebase = firebaseOnAuthStateChanged(authInstance, (fbUser) => {
    if (fbUser) {
      callback(fbUser);
    } else {
      const isLocalAdmin = localStorage.getItem("thyago_tech_admin_session") === "true";
      if (!isLocalAdmin) {
        callback(null);
      }
    }
  });

  return () => {
    authListeners.delete(callback);
    unsubscribeFirebase();
  };
}

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
}

/**
 * Real-time listener for Products collection
 */
export function subscribeToProducts(
  onProductsUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  const productsCol = collection(db, "products");

  return onSnapshot(
    productsCol,
    (snapshot) => {
      if (snapshot.empty) {
        // If the collection is empty in Firestore, seed with initialProducts
        seedInitialDataIfEmpty();
        onProductsUpdate(initialProducts);
        return;
      }

      const loadedProducts: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedProducts.push({
          id: docSnap.id,
          name: data.name || "",
          category: data.category || "Mouse",
          categories: data.categories || [data.category || "Mouse"],
          description: data.description || "",
          price: Number(data.price) || 0,
          originalPrice: Number(data.originalPrice) || 0,
          isPromoActive: !!data.isPromoActive,
          images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ["/src/assets/images/quantum_vector_mouse_1788183228777.jpg"],
          videos: Array.isArray(data.videos) ? data.videos : [],
          stock: Number(data.stock) || 0,
          showStock: data.showStock !== undefined ? !!data.showStock : true,
          colorStockControl: !!data.colorStockControl,
          colors: Array.isArray(data.colors)
            ? data.colors.map((c: any) => ({
                color: c.color || "",
                stock: Number(c.stock) || 0,
                colorHex: c.colorHex || undefined
              }))
            : [],
          isBestSeller: !!data.isBestSeller,
          specifications: Array.isArray(data.specifications) ? data.specifications : [],
          highlightPoints: Array.isArray(data.highlightPoints) ? data.highlightPoints : []
        });
      });

      // Sort by best seller / name
      loadedProducts.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      onProductsUpdate(loadedProducts);
    },
    (err) => {
      console.warn("Notice: Firestore offline or initial sync:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for Banners collection
 */
export function subscribeToBanners(
  onBannersUpdate: (banners: BannerItem[]) => void,
  onError?: (error: Error) => void
) {
  const bannersCol = collection(db, "banners");

  return onSnapshot(
    bannersCol,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialBannersIfEmpty();
        onBannersUpdate(initialBanners);
        return;
      }

      const loadedBanners: BannerItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedBanners.push({
          id: docSnap.id,
          src: data.src || "/src/assets/images/capinhas_peliculas_banner_1788199988487.jpg",
          alt: data.alt || "Banner Promocional",
          title: data.title || "",
          linkGroup: data.linkGroup,
          linkFilter: data.linkFilter,
          active: data.active !== undefined ? !!data.active : true,
          order: typeof data.order === "number" ? data.order : 999
        } as any);
      });

      loadedBanners.sort((a: any, b: any) => a.order - b.order);
      onBannersUpdate(loadedBanners);
    },
    (err) => {
      console.warn("Notice: Firestore banners offline or initial sync:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save single product to Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const docRef = doc(db, "products", product.id);

  // Safety compression for any large base64 image strings
  const processedImages: string[] = [];
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === "string" && img.startsWith("data:image/") && img.length > 200000) {
        try {
          const compressed = await compressImage(img, {
            maxWidth: 1000,
            maxHeight: 1000,
            quality: 0.80,
            mimeType: "image/jpeg"
          });
          processedImages.push(compressed);
        } catch {
          processedImages.push(img);
        }
      } else {
        processedImages.push(img);
      }
    }
  }

  const cleanProduct = {
    name: product.name,
    category: product.category,
    categories: product.categories || [product.category],
    description: product.description || "",
    price: Number(product.price),
    originalPrice: Number(product.originalPrice),
    isPromoActive: !!product.isPromoActive,
    images: processedImages.length > 0 ? processedImages : product.images || [],
    videos: product.videos || [],
    stock: Number(product.stock),
    showStock: !!product.showStock,
    colorStockControl: !!product.colorStockControl,
    colors: Array.isArray(product.colors)
      ? product.colors.map((c) => ({
          color: c.color,
          stock: Number(c.stock),
          colorHex: c.colorHex || null
        }))
      : [],
    isBestSeller: !!product.isBestSeller,
    specifications: product.specifications || [],
    highlightPoints: product.highlightPoints || [],
    updatedAt: serverTimestamp()
  };

  await setDoc(docRef, cleanProduct, { merge: true });
}

/**
 * Delete product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
}

/**
 * Save all banners to Firestore
 */

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
    let imageSrc = banner.src;
    if (typeof imageSrc === "string" && imageSrc.startsWith("data:image/") && imageSrc.length > 200000) {
      try {
        imageSrc = await compressImage(imageSrc, {
          maxWidth: 1200,
          maxHeight: 600,
          quality: 0.80
        });
      } catch (e) {
        console.warn("Failed to compress promo banner image:", e);
      }
    }
    const docRef = doc(db, "promo_banners", banner.id);
    await setDoc(docRef, {
      src: imageSrc,
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

/**
 * Delete banner from Firestore
 */
export async function deleteBannerFromFirestore(bannerId: string): Promise<void> {
  const docRef = doc(db, "banners", bannerId);
  await deleteDoc(docRef);
}

export async function saveBannersToFirestore(banners: BannerItem[]): Promise<void> {
  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];
    const docRef = doc(db, "banners", banner.id);
    await setDoc(docRef, {
      src: banner.src,
      alt: banner.alt,
      title: banner.title || "",
      linkGroup: banner.linkGroup || null,
      linkFilter: banner.linkFilter || null,
      active: banner.active !== false,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
}

/**
 * Real-time listener for Store Settings
 */
export function subscribeToSettings(
  onSettingsUpdate: (settings: StoreSettings) => void,
  onError?: (error: Error) => void
) {
  const settingsDoc = doc(db, "settings", "general");

  return onSnapshot(
    settingsDoc,
    (docSnap) => {
      if (!docSnap.exists()) {
        onSettingsUpdate(defaultStoreSettings);
        return;
      }

      const data = docSnap.data();
      onSettingsUpdate({
        storeName: data.storeName || defaultStoreSettings.storeName,
        storeTagline: data.storeTagline !== undefined ? data.storeTagline : defaultStoreSettings.storeTagline,
        logoUrl: data.logoUrl || "",
        logoZoom: typeof data.logoZoom === "number" ? data.logoZoom : (defaultStoreSettings.logoZoom || 100),
        logoFit: data.logoFit === "contain" ? "contain" : "cover",
        whatsappNumber: data.whatsappNumber || defaultStoreSettings.whatsappNumber,
        businessHours: data.businessHours !== undefined ? data.businessHours : defaultStoreSettings.businessHours,
        instagramHandle: data.instagramHandle !== undefined ? data.instagramHandle : defaultStoreSettings.instagramHandle,
        pixKey: data.pixKey !== undefined ? data.pixKey : defaultStoreSettings.pixKey,
        deliveryInfo: data.deliveryInfo !== undefined ? data.deliveryInfo : defaultStoreSettings.deliveryInfo,
        address: data.address !== undefined ? data.address : defaultStoreSettings.address,
        promoBannerUrl: data.promoBannerUrl || "",
        promoBanners: data.promoBanners || []
      });
    },
    (err) => {
      console.warn("Notice: Firestore settings offline or initial sync:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save store settings to Firestore
 */
export async function saveSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const docRef = doc(db, "settings", "general");
  await setDoc(docRef, {
    storeName: settings.storeName || defaultStoreSettings.storeName,
    storeTagline: settings.storeTagline || "",
    logoUrl: settings.logoUrl || "",
    logoZoom: typeof settings.logoZoom === "number" ? settings.logoZoom : 100,
    logoFit: settings.logoFit || "cover",
    whatsappNumber: settings.whatsappNumber || defaultStoreSettings.whatsappNumber,
    businessHours: settings.businessHours || "",
    instagramHandle: settings.instagramHandle || "",
    pixKey: settings.pixKey || "",
    deliveryInfo: settings.deliveryInfo || "",
    address: settings.address || "",
    promoBannerUrl: settings.promoBannerUrl || "",
    promoBanners: settings.promoBanners || [],
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Seeds initial products to Firestore if collection is empty
 */
async function seedInitialDataIfEmpty() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    if (snapshot.empty) {
      console.log("Seeding Firestore with initial products...");
      for (const p of initialProducts) {
        await saveProductToFirestore(p);
      }
    }
  } catch (err) {
    console.warn("Notice: Firebase seeding info:", err);
  }
}

/**
 * Seeds initial banners to Firestore if collection is empty
 */
async function seedInitialBannersIfEmpty() {
  try {
    const snapshot = await getDocs(collection(db, "banners"));
    if (snapshot.empty) {
      console.log("Seeding Firestore with initial banners...");
      await saveBannersToFirestore(initialBanners);
    }
  } catch (err) {
    console.warn("Notice: Firebase banners seeding info:", err);
  }
}

/**
 * Authenticate with Email and Password
 * Handles Firebase Auth and graceful fallback for the Administrator
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim();
  const isAdminEmail = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    localStorage.removeItem("thyago_tech_admin_session");
    return userCredential.user;
  } catch (error: any) {
    // If account does not exist in Firebase, attempt registration
    if (
      (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") &&
      isAdminEmail
    ) {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        localStorage.removeItem("thyago_tech_admin_session");
        return createCred.user;
      } catch (createErr: any) {
        // Fall through to fallback handler below if email/password provider is not enabled yet
        if (createErr.code !== "auth/operation-not-allowed" && createErr.code !== "auth/configuration-not-found") {
          throw createErr;
        }
      }
    }

    // Graceful Admin Fallback if Email/Password provider isn't enabled yet in Firebase Console
    if (
      (error.code === "auth/operation-not-allowed" || 
       error.code === "auth/configuration-not-found" || 
       error.code === "auth/network-request-failed" ||
       error.code === "auth/invalid-credential" ||
       error.code === "auth/user-not-found") &&
      isAdminEmail &&
      pass === ADMIN_MASTER_PASS
    ) {
      localStorage.setItem("thyago_tech_admin_session", "true");
      const adminUser = createAdminUserObject();
      authListeners.forEach((listener) => listener(adminUser));
      return adminUser;
    }

    throw error;
  }
}

/**
 * Register new user with Email and Password
 */
export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    return userCredential.user;
  } catch (err: any) {
    if (err.code === "auth/operation-not-allowed" || err.code === "auth/configuration-not-found") {
      throw new Error("O provedor de Email/Senha precisa ser ativado no Firebase Console (Authentication > Sign-in method).");
    }
    throw err;
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem("thyago_tech_admin_session");
  try {
    await signOut(auth);
  } catch (e) {}
  authListeners.forEach((listener) => listener(null));
}


/**
 * Real-time listener for Sales collection
 */
export function subscribeToSales(
  onSalesUpdate: (sales: Sale[]) => void,
  onError?: (error: Error) => void
) {
  const salesCol = collection(db, "sales");
  return onSnapshot(
    salesCol,
    (snapshot) => {
      const loadedSales: Sale[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedSales.push({
          id: docSnap.id,
          clientName: data.clientName || "",
          clientPhone: data.clientPhone || "",
          consultantName: data.consultantName || "",
          deliveryType: data.deliveryType || "retirada",
          deliveryAddress: data.deliveryAddress || undefined,
          deliveryFee: Number(data.deliveryFee) || 0,
          pickupLocation: data.pickupLocation || "",
          deliveryDate: data.deliveryDate || new Date().toISOString().split("T")[0],
          preparationTime: data.preparationTime || "",
          estimatedDelivery: data.estimatedDelivery || "",
          items: Array.isArray(data.items) ? data.items : [],
          subtotal: Number(data.subtotal) || 0,
          discount: Number(data.discount) || 0,
          total: Number(data.total) || 0,
          paymentMethod: data.paymentMethod || "pix",
          paymentStatus: data.paymentStatus || "pago",
          dueDate: data.dueDate || undefined,
          notes: data.notes || "",
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || "concluida",
          orderStatus: data.orderStatus || (data.status === "cancelada" ? "cancelado" : data.paymentStatus === "pago" ? "preparando" : "aguardando_validacao"),
          orderStatusHistory: Array.isArray(data.orderStatusHistory) ? data.orderStatusHistory : []
        });
      });
      loadedSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSalesUpdate(loadedSales);
    },
    (err) => {
      console.warn("Notice: Firestore sales sync:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save single sale to Firestore
 */
export async function saveSaleToFirestore(sale: Sale): Promise<void> {
  const docRef = doc(db, "sales", sale.id);
  await setDoc(docRef, {
    clientName: sale.clientName,
    clientPhone: sale.clientPhone,
    consultantName: sale.consultantName || "",
    deliveryType: sale.deliveryType,
    deliveryAddress: sale.deliveryAddress || null,
    deliveryFee: Number(sale.deliveryFee) || 0,
    pickupLocation: sale.pickupLocation || "",
    deliveryDate: sale.deliveryDate,
    preparationTime: sale.preparationTime || "",
    estimatedDelivery: sale.estimatedDelivery || "",
    items: sale.items,
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount) || 0,
    total: Number(sale.total),
    paymentMethod: sale.paymentMethod,
    paymentStatus: sale.paymentStatus,
    dueDate: sale.dueDate || null,
    notes: sale.notes || "",
    createdAt: sale.createdAt || new Date().toISOString(),
    status: sale.status || "concluida",
    orderStatus: sale.orderStatus || "aguardando_validacao",
    orderStatusHistory: sale.orderStatusHistory || [],
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Update sale status / payment status / order status
 */
export async function updateSaleStatusInFirestore(
  saleId: string, 
  updates: { 
    paymentStatus?: "pago" | "na_entrega" | "a_prazo"; 
    status?: "concluida" | "cancelada";
    orderStatus?: "aguardando_validacao" | "preparando" | "entregue" | "cancelado";
    preparationTime?: string;
    consultantName?: string;
    notes?: string;
    orderStatusHistory?: { status: string; timestamp: string; note?: string }[];
  }
): Promise<void> {
  const docRef = doc(db, "sales", saleId);
  await setDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Delete sale from Firestore
 */
export async function deleteSaleFromFirestore(saleId: string): Promise<void> {
  const docRef = doc(db, "sales", saleId);
  await deleteDoc(docRef);
}
