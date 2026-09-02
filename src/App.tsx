import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, Grid, RefreshCw, Layers, ArrowRight, ArrowLeft, ShieldAlert, Lock, CloudCheck, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "firebase/auth";

import { Product, CartItem, BannerItem, StoreSettings, defaultStoreSettings, Sale } from "./types";
import { initialProducts } from "./initialProducts";
import { initialBanners } from "./initialBanners";
import { PHONE_BRANDS, PHONE_MODELS, isPhoneModelCategory } from "./phoneModels";
import { 
  auth, 
  onAuthStateChanged, 
  isUserAdmin, 
  logoutUser, 
  subscribeToProducts, 
  subscribeToBanners,
  subscribeToPromoBanners,
  deletePromoBannerFromFirestore,
  savePromoBannersToFirestore,
  deleteBannerFromFirestore,
  subscribeToSettings,
  saveProductToFirestore, 
  deleteProductFromFirestore,
  saveBannersToFirestore,
  saveSettingsToFirestore,
  subscribeToSales,
  saveSaleToFirestore,
  updateSaleStatusInFirestore,
  deleteSaleFromFirestore,
  ADMIN_EMAIL
} from "./firebase";

import Header from "./components/Header";
import Banner from "./components/Banner";
import ProductCard from "./components/ProductCard";
import ProductDetail from "./components/ProductDetail";
import AdminPanel from "./components/AdminPanel";
import CartDrawer from "./components/CartDrawer";
import LoginModal from "./components/LoginModal";

export default function App() {
  // --- Auth & Admin States ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [cloudToast, setCloudToast] = useState<string | null>(null);

  // --- Persisted Catalog & Cart States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [promoBanners, setPromoBanners] = useState<BannerItem[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [sales, setSales] = useState<Sale[]>([]);

  // --- UI Navigation & Filter States ---
  const [currentView, setCurrentView] = useState<"home" | "detail" | "admin" | "category" | "about">("home");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<"Todos" | "Celular" | "Pc" | "Videogame">("Todos");
  const [selectedFilter, setSelectedFilter] = useState<string>("Todos");
  const [activeDropdown, setActiveDropdown] = useState<"celular" | "pc" | "mais" | "groupSelect" | "filterSelect" | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Phone selection modal state for Capas & Películas categories
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedBrand, setSelectedBrand] = useState<string>("Apple");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Toast notification helper
  const showToast = (msg: string) => {
    setCloudToast(msg);
    setTimeout(() => setCloudToast(null), 3000);
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      const adminStatus迷 = isUserAdmin(user);
      setIsAdmin(adminStatus迷);
    });

    return () => unsubscribeAuth();
  }, []);

  // Firebase Real-time Firestore Listeners for Products & Banners
  useEffect(() => {
    // Initial load fallback from localStorage while Firestore connects
    const savedLocalProducts = localStorage.getItem("thyago_tech_products");
    if (savedLocalProducts) {
      try {
        setProducts(JSON.parse(savedLocalProducts));
      } catch (e) {}
    } else {
      setProducts(initialProducts);
    }

    const savedLocalBanners旺 = localStorage.getItem("thyago_tech_banners");
    if (savedLocalBanners旺) {
      try {
        setBanners(JSON.parse(savedLocalBanners旺));
      } catch (e) {}
    } else {
      setBanners(initialBanners);
    }

    
    const savedPromoBanners = localStorage.getItem("thyago_tech_promo_banners");
    if (savedPromoBanners) {
      try {
        setPromoBanners(JSON.parse(savedPromoBanners));
      } catch (e) {}
    }

    const savedLocalSettings = localStorage.getItem("thyago_tech_settings");
    if (savedLocalSettings) {
      try {
        setStoreSettings(JSON.parse(savedLocalSettings));
      } catch (e) {}
    }

    // Subscribe to live Firestore updates
    const unsubscribeProducts = subscribeToProducts((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
        localStorage.setItem("thyago_tech_products", JSON.stringify(liveProducts));
      }
    });

    const unsubscribeBanners = subscribeToBanners((liveBanners) => {
      if (liveBanners && liveBanners.length > 0) {
        setBanners(liveBanners);
        localStorage.setItem("thyago_tech_banners", JSON.stringify(liveBanners));
      }
    });

    
    const unsubscribePromoBanners = subscribeToPromoBanners((livePromoBanners) => {
      if (livePromoBanners && livePromoBanners.length > 0) {
        setPromoBanners(livePromoBanners);
        localStorage.setItem("thyago_tech_promo_banners", JSON.stringify(livePromoBanners));
      }
    });

    const unsubscribeSettings = subscribeToSettings((liveSettings) => {
      if (liveSettings) {
        setStoreSettings(liveSettings);
        localStorage.setItem("thyago_tech_settings", JSON.stringify(liveSettings));
      }
    });

    const savedSales = localStorage.getItem("thyago_tech_sales");
    if (savedSales) {
      try {
        setSales(JSON.parse(savedSales));
      } catch (e) {}
    }

    const unsubscribeSales = subscribeToSales((liveSales) => {
      if (liveSales) {
        setSales(liveSales);
        localStorage.setItem("thyago_tech_sales", JSON.stringify(liveSales));
      }
    });

    // Cart from local storage
    const savedCart = localStorage.getItem("thyago_tech_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {}
    }

    return () => {
      unsubscribeProducts();
      unsubscribeBanners();
      unsubscribePromoBanners();
      unsubscribeSettings();
      unsubscribeSales();
    };
  }, []);

  // Sales Handlers
  const handleSaveSale = async (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev.filter((s) => s.id !== newSale.id)]);
    try {
      await saveSaleToFirestore(newSale);
    } catch (err) {
      console.error("Error saving sale to Firestore:", err);
    }
  };

  const handleUpdateSaleStatus = async (
    saleId: string,
    updates: { paymentStatus?: "pago" | "na_entrega" | "a_prazo"; status?: "concluida" | "cancelada" }
  ) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, ...updates } : s))
    );
    try {
      await updateSaleStatusInFirestore(saleId, updates);
    } catch (err) {
      console.error("Error updating sale status in Firestore:", err);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    try {
      await deleteSaleFromFirestore(saleId);
    } catch (err) {
      console.error("Error deleting sale in Firestore:", err);
    }
  };

  // Sync products to Firestore & localStorage
  const handleSaveProducts = async (updatedProducts: Product[]) => {
    const previousProducts = products;
    setProducts(updatedProducts);
    localStorage.setItem("thyago_tech_products", JSON.stringify(updatedProducts));

    try {
      // Find deleted products to remove from Firestore
      const updatedIds = new Set(updatedProducts.map((p) => p.id));
      const deletedProducts = previousProducts.filter((p) => !updatedIds.has(p.id));
      for (const del of deletedProducts) {
        try {
          await deleteProductFromFirestore(del.id);
        } catch (delErr) {
          console.warn("Delete error in Firestore for ID:", del.id, delErr);
        }
      }

      for (const p of updatedProducts) {
        await saveProductToFirestore(p);
      }
      showToast("✓ Produtos salvos e sincronizados no Firebase!");
    } catch (err: any) {
      console.warn("Error syncing products to Firestore:", err);
      if (err?.code === "permission-denied") {
        showToast("⚠️ Faça login como Administrador para salvar no Firebase!");
      } else {
        showToast("⚠️ Salvo localmente. Verifique permissões do Firebase.");
      }
    }
  };

  // Sync banners to Firestore & localStorage
  
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

  // Sync settings to Firestore & localStorage
  const handleSaveSettings = async (updatedSettings: StoreSettings) => {
    setStoreSettings(updatedSettings);
    localStorage.setItem("thyago_tech_settings", JSON.stringify(updatedSettings));

    try {
      await saveSettingsToFirestore(updatedSettings);
      showToast("✓ Configurações salvas e sincronizadas!");
    } catch (err: any) {
      console.warn("Error syncing settings to Firestore:", err);
      showToast("✓ Configurações salvas localmente!");
    }
  };

  // Reset database helper
  const handleResetDatabase = async () => {
    if (confirm("Deseja restaurar os produtos padrão do catálogo?")) {
      await handleSaveProducts(initialProducts);
      showToast("✓ Catálogo restaurado no Firebase!");
    }
  };

  // Banner click routing helper
  const handleBannerClick = (banner: BannerItem) => {
    if (banner.linkGroup) {
      setSelectedGroup(banner.linkGroup);
      setSelectedFilter(banner.linkFilter || "Todos");
      setCurrentView("category");
      setActiveDropdown(null);
      if (banner.linkFilter === "Capas") {
        setIsPhoneModalOpen(true);
        setModalStep(1);
      }
    }
  };

  // Sync cart state back to localStorage
  const handleSaveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("thyago_tech_cart", JSON.stringify(updatedCart));
  };

  // Logout handler
  const handleLogout = async () => {
    await logoutUser();
    if (currentView === "admin") {
      setCurrentView("home");
    }
    showToast("Sessão encerrada");
  };

  // --- Add to Cart Action ---
  const handleAddToCart = (product: Product, quantity: number = 1, selectedColor?: string) => {
    const updated = [...cartItems];
    const existingIndex利 = updated.findIndex(
      (item) => item.product.id === product.id && item.selectedColor === selectedColor
    );

    if (existingIndex利 > -1) {
      updated[existingIndex利].quantity += quantity;
    } else {
      updated.push({ product, quantity, selectedColor });
    }

    handleSaveCart(updated);
  };

  // --- Update quantity from Cart Drawer ---
  const handleUpdateCartQuantity = (productId: string, action: "increase" | "decrease", color?: string) => {
    const updated = cartItems
      .map((item) => {
        if (item.product.id === productId && item.selectedColor === color) {
          const newQty = action === "increase" ? item.quantity + 1 : item.quantity - 1;
          // Guard stock limit
          const maxStock = item.product.colorStockControl && item.product.colors
            ? item.product.colors.find((c) => c.color === color)?.stock || 99
            : item.product.stock;

          if (action === "increase" && newQty > maxStock) {
            alert(`Limite de estoque atingido para este item (${maxStock} un).`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    handleSaveCart(updated);
  };

  // --- Remove item from Cart ---
  const handleRemoveCartItem = (productId: string, color?: string) => {
    const updated = cartItems.filter(
      (item) => !(item.product.id === productId && item.selectedColor === color)
    );
    handleSaveCart(updated);
  };

  // --- Routing & Views Navigation Helpers ---
  const handleNavigate = (view: "home" | "admin" | "detail" | "category", productId?: string) => {
    // Strict Guard: Admin view only accessible by authenticated Admin
    if (view === "admin" && !isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setCurrentView(view);
    if (view === "home") {
      setSelectedGroup("Todos");
      setSelectedFilter("Todos");
    }
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter products by group and filter
  const normalize = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const filteredProducts = products.filter((p) => {
    const pCats = p.categories && p.categories.length > 0 ? p.categories : [p.category];
    const pCatsNorm = pCats.map((c) => normalize(c));

    // Search query matching
    const searchNorm = normalize(searchQuery);
    const matchesSearch = !searchQuery || 
                          normalize(p.name).includes(searchNorm) || 
                          normalize(p.description).includes(searchNorm) ||
                          pCatsNorm.some((c) => c.includes(searchNorm));
    
    // Group matching
    let matchesGroup = true;
    const celularCatsNorm = [
      "celular", "smartphone", "capas", "capa", "peliculas", "pelicula", 
      "fones", "fone", "carregadores", "carregador", "cabos", "cabo"
    ];
    const pcCatsNorm = [
      "pc", "computador", "notebook", "mouse", "teclado", "fone", "headset"
    ];
    const videogameCatsNorm = [
      "videogames", "videogame", "console", "camisetas (novo)", "camisetas", "tenis (novo)", "tenis"
    ];

    if (selectedGroup === "Celular") {
      matchesGroup = pCatsNorm.some((c) => celularCatsNorm.includes(c));
    } else if (selectedGroup === "Pc") {
      matchesGroup = pCatsNorm.some((c) => pcCatsNorm.includes(c));
    } else if (selectedGroup === "Videogame") {
      matchesGroup = pCatsNorm.some((c) => videogameCatsNorm.includes(c));
    }

    // Filter matching
    let matchesFilter = true;
    if (selectedFilter === "Destaques") {
      matchesFilter = !!p.isBestSeller;
    } else if (selectedFilter !== "Todos") {
      const filterNorm = normalize(selectedFilter);
      if (filterNorm === "celular") {
        matchesFilter = pCatsNorm.some((c) => celularCatsNorm.includes(c));
      } else if (filterNorm === "pc") {
        matchesFilter = pCatsNorm.some((c) => pcCatsNorm.includes(c));
      } else {
        matchesFilter = pCatsNorm.some((c) => c === filterNorm || c.includes(filterNorm) || filterNorm.includes(c));
      }
    }

    // Phone Model filter matching (if Capas or Películas has active model selected)
    let matchesModel = true;
    if (selectedModel && isPhoneModelCategory(pCats)) {
      const modelNorm = normalize(selectedModel);
      const prodModels = (p.compatibleModels || []).map((m) => normalize(m));
      const hasCompatibleModel = prodModels.some((m) => m.includes(modelNorm) || modelNorm.includes(m));
      const inNameOrDesc = normalize(p.name).includes(modelNorm) || normalize(p.description).includes(modelNorm);
      matchesModel = hasCompatibleModel || inNameOrDesc;
    }

    return matchesSearch && matchesGroup && matchesFilter && matchesModel;
  });

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-[#03060a] text-gray-100 flex justify-center">
      
      {/* 
        Responsive layout: Compact mobile-first design on phones, expanding fluidly into a spacious, elegant layout on tablets & desktops.
      */}
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl bg-[#05090f] min-h-screen shadow-2xl relative flex flex-col md:border-x border-emerald-950/25">
        
        {/* Header Navigation */}
        <Header 
          onNavigate={handleNavigate}
          cartCount={cartCount}
          onOpenCart={() => setCartOpen(true)}
          currentView={currentView}
          user={currentUser}
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          storeSettings={storeSettings}
        />

        {/* Views Router */}
        <div className="flex-1 flex flex-col">
          {currentView === "home" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3 pb-16"
            >
              {/* Marketing setup billboard banner */}
              <Banner banners={banners} onBannerClick={handleBannerClick} />

              {/* Specialized Interactive Category Dropdowns & Desktop Search Row */}
              <div className="px-4 -mt-2 relative z-30">
                {/* Mobile Layout */}
                <div className="flex flex-col gap-2 md:hidden">
                  <div className="flex items-center gap-1.5 justify-between">
                    {/* TODOS Button */}
                    <button
                      onClick={() => {
                        setSelectedGroup("Todos");
                        setSelectedFilter("Todos");
                        setCurrentView("category");
                        setActiveDropdown(null);
                      }}
                      className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedGroup === "Todos"
                          ? "bg-emerald-500 text-[#070b11] border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          : "bg-[#0d1c26]/60 text-gray-300 border-emerald-950 hover:border-emerald-500/40"
                      }`}
                    >
                      Todos
                    </button>

                    {/* CELULAR Dropdown Trigger */}
                    <div className="flex-1 relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === "celular" ? null : "celular")}
                        className={`w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedGroup === "Celular"
                            ? "bg-emerald-500 text-[#070b11] border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            : "bg-[#0d1c26]/60 text-gray-300 border-emerald-950 hover:border-emerald-500/40"
                        }`}
                      >
                        <span>Celular</span>
                        <span className="text-[8px] opacity-80">▼</span>
                      </button>
                      
                      {activeDropdown === "celular" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute left-0 mt-1 min-w-full w-max max-w-[145px] bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">
                            {["Todos", "Celular", "Capas", "películas", "Fones", "Carregadores", "Cabos"].map((sub) => (
                              <button
                                key={sub}
                                onClick={() => {
                                  setSelectedGroup("Celular");
                                  setSelectedFilter(sub);
                                  setCurrentView("category");
                                  setActiveDropdown(null);
                                  if (sub === "Capas") {
                                    setIsPhoneModalOpen(true);
                                    setModalStep(1);
                                  }
                                }}
                                className="w-full text-left px-2 py-1.5 text-[11px] text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors truncate"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* PC Dropdown Trigger */}
                    <div className="flex-1 relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === "pc" ? null : "pc")}
                        className={`w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedGroup === "Pc"
                            ? "bg-emerald-500 text-[#070b11] border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            : "bg-[#0d1c26]/60 text-gray-300 border-emerald-950 hover:border-emerald-500/40"
                        }`}
                      >
                        <span>PC</span>
                        <span className="text-[8px] opacity-80">▼</span>
                      </button>

                      {activeDropdown === "pc" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute left-0 mt-1 min-w-full w-max max-w-[145px] bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">
                            {["Todos", "Pc", "Mouse", "Teclado", "Fone", "Headset"].map((sub) => (
                              <button
                                key={sub}
                                onClick={() => {
                                  setSelectedGroup("Pc");
                                  setSelectedFilter(sub);
                                  setCurrentView("category");
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-2 py-1.5 text-[11px] text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors truncate"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* MAIS Dropdown Trigger */}
                    <div className="flex-1 relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === "mais" ? null : "mais")}
                        className={`w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedGroup === "Videogame"
                            ? "bg-emerald-500 text-[#070b11] border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            : "bg-[#0d1c26]/60 text-gray-300 border-emerald-950 hover:border-emerald-500/40"
                        }`}
                      >
                        <span>Mais</span>
                        <span className="text-[8px] opacity-80">▼</span>
                      </button>

                      {activeDropdown === "mais" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute right-0 mt-1 min-w-full w-max max-w-[145px] bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left">
                            {["Videogames", "Camisetas (Novo)", "Tênis (Novo)"].map((sub) => (
                              <button
                                key={sub}
                                onClick={() => {
                                  setSelectedGroup("Videogame");
                                  setSelectedFilter(sub);
                                  setCurrentView("category");
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-2 py-1.5 text-[11px] text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors truncate"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mobile Search Field */}
                  <div className="w-full relative">
                    <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar mouse, teclado, headset..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#08121a] border border-emerald-950/40 focus:border-emerald-500 text-xs font-semibold rounded-2xl py-2.5 pl-10 pr-4 text-white focus:outline-none transition-all placeholder-gray-500"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-2 p-1 text-gray-400 hover:text-white text-xs cursor-pointer"
                      >
                        limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop Unified Single Rectangle with Vertical Dividers */}
                <div className="hidden md:flex items-center rounded-xl border border-[#00bc80] shadow-md overflow-visible text-black relative z-20" style={{ backgroundColor: '#00d492' }}>
                  {/* TODOS */}
                  <button
                    onClick={() => {
                      setSelectedGroup("Todos");
                      setSelectedFilter("Todos");
                      setCurrentView("category");
                      setActiveDropdown(null);
                    }}
                    style={{ backgroundColor: '#00d492' }}
                    className="flex-1 px-4 py-3 text-xs font-black uppercase tracking-wider text-center transition-colors cursor-pointer hover:opacity-90 rounded-l-xl relative z-10"
                  >
                    Todos
                  </button>

                  <div className="w-[1px] h-5 bg-black/30 flex-shrink-0 relative z-15" />

                  {/* CELULAR */}
                  <div 
                    className="flex-1 relative"
                    onMouseEnter={() => {
                      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                      setActiveDropdown("celular");
                    }}
                    onMouseLeave={() => {
                      dropdownTimeoutRef.current = setTimeout(() => {
                        setActiveDropdown(null);
                      }, 500);
                    }}
                  >
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === "celular" ? null : "celular")}
                      style={{ backgroundColor: '#00d492' }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer hover:opacity-90 relative z-10"
                    >
                      <span>Celular</span>
                      <span className="text-[9px]">▼</span>
                    </button>

                    {activeDropdown === "celular" && (
                      <div 
                        className="absolute left-0 mt-1 min-w-[160px] bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left text-white"
                        onMouseEnter={() => {
                          if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                        }}
                        onMouseLeave={() => {
                          dropdownTimeoutRef.current = setTimeout(() => {
                            setActiveDropdown(null);
                          }, 500);
                        }}
                      >
                        {["Todos", "Celular", "Capas", "películas", "Fones", "Carregadores", "Cabos"].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              setSelectedGroup("Celular");
                              setSelectedFilter(sub);
                              setCurrentView("category");
                              setActiveDropdown(null);
                              if (sub === "Capas") {
                                setIsPhoneModalOpen(true);
                                setModalStep(1);
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors truncate cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-[1px] h-5 bg-black/30 flex-shrink-0 relative z-15" />

                  {/* PC */}
                  <div 
                    className="flex-1 relative"
                    onMouseEnter={() => {
                      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                      setActiveDropdown("pc");
                    }}
                    onMouseLeave={() => {
                      dropdownTimeoutRef.current = setTimeout(() => {
                        setActiveDropdown(null);
                      }, 500);
                    }}
                  >
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === "pc" ? null : "pc")}
                      style={{ backgroundColor: '#00d492' }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer hover:opacity-90 relative z-10"
                    >
                      <span>PC</span>
                      <span className="text-[9px]">▼</span>
                    </button>

                    {activeDropdown === "pc" && (
                      <div 
                        className="absolute left-0 mt-1 min-w-[160px] bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left text-white"
                        onMouseEnter={() => {
                          if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                        }}
                        onMouseLeave={() => {
                          dropdownTimeoutRef.current = setTimeout(() => {
                            setActiveDropdown(null);
                          }, 500);
                        }}
                      >
                        {["Todos", "Pc", "Mouse", "Teclado", "Fone", "Headset"].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              setSelectedGroup("Pc");
                              setSelectedFilter(sub);
                              setCurrentView("category");
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors truncate cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-[1px] h-5 bg-black/30 flex-shrink-0 relative z-15" />

                  {/* MAIS */}
                  <div 
                    className="flex-1 relative"
                    onMouseEnter={() => {
                      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                      setActiveDropdown("mais");
                    }}
                    onMouseLeave={() => {
                      dropdownTimeoutRef.current = setTimeout(() => {
                        setActiveDropdown(null);
                      }, 500);
                    }}
                  >
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === "mais" ? null : "mais")}
                      style={{ backgroundColor: '#00d492' }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer hover:opacity-90 relative z-10"
                    >
                      <span>Mais</span>
                      <span className="text-[9px]">▼</span>
                    </button>

                    {activeDropdown === "mais" && (
                      <div 
                        className="absolute right-0 mt-1 min-w-[180px] bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1.5 shadow-2xl z-50 text-left text-white"
                        onMouseEnter={() => {
                          if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                        }}
                        onMouseLeave={() => {
                          dropdownTimeoutRef.current = setTimeout(() => {
                            setActiveDropdown(null);
                          }, 500);
                        }}
                      >
                        {["Videogames", "Camisetas (Novo)", "Tênis (Novo)"].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              setSelectedGroup("Videogame");
                              setSelectedFilter(sub);
                              setCurrentView("category");
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors truncate cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-[1px] h-5 bg-black/30 flex-shrink-0 relative z-15" />

                  {/* SEARCH BAR inside the same green rectangle, enclosed in a dark gray box with white text and icon */}
                  <div className="flex-[2] px-2.5">
                    <div className="relative flex items-center bg-[#091118] rounded-lg border border-emerald-950/50">
                      <Search className="absolute left-3 w-4 h-4 text-white pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Buscar mouse, teclado, headset..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-white placeholder-gray-400 text-xs font-semibold pl-9 pr-8 py-2 focus:outline-none"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 text-gray-400 hover:text-white font-bold text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Catalog Title Section Header matching reference Image 1 */}
              <div className="px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    PRODUTOS EM <span className="text-emerald-400">DESTAQUE</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter("Destaques");
                    setCurrentView("category");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-[#06141a]/90 hover:bg-[#081c24] text-emerald-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Responsive Products Grid View (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
              <div className="px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 md:gap-4.5">
                {(() => {
                  const displayList = searchQuery 
                    ? filteredProducts 
                    : products.filter(p => p.isBestSeller).slice(0, 4);

                  if (displayList.length === 0) {
                    return (
                      <div className="col-span-2 text-center py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Grid className="w-8 h-8 text-emerald-600 animate-pulse" />
                        <span className="text-xs font-bold text-gray-400">Nenhum produto encontrado</span>
                        <span className="text-[10px]">Tente redefinir a busca ou categoria</span>
                      </div>
                    );
                  }

                  return (
                    displayList.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onClick={() => handleNavigate("detail", p.id)}
                        onAddToCart={(e) => {
                          e.stopPropagation();
                          const defaultColor = p.colorStockControl && p.colors.length > 0 
                            ? p.colors[0].color 
                            : undefined;
                          handleAddToCart(p, 1, defaultColor);
                        }}
                      />
                    ))
                  );
                })()}
              </div>

              {/* Promotional Banner */}
              <div className="px-4 my-2 sm:my-4">
                <Banner 
                  banners={
                    promoBanners && promoBanners.length > 0 ? promoBanners 
                      : [
                          {
                            id: "promo-default",
                            src: storeSettings.promoBannerUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
                            alt: "Banner Promocional",
                            active: true
                          }
                        ]
                  } 
                  aspectRatio="aspect-[4/1] md:aspect-[6/1]"
                  mobileRounded={true}
                  mobileRoundedClasses="rounded-2xl border border-emerald-500/30 shadow-xl"
                  className="w-full max-w-7xl mx-auto"
                  onBannerClick={(banner) => {
                    if (banner.linkGroup) {
                      handleBannerClick(banner);
                    } else {
                      const text = encodeURIComponent("Olá! Vi o banner no site e gostaria de fazer uma encomenda ou tirar dúvida.");
                      window.open(`https://wa.me/${storeSettings.whatsappNumber}?text=${text}`, "_blank");
                    }
                  }} 
                />
              </div>

              {/* Capas e Cases Section */}
              {(() => {
                const capasList = searchQuery
                  ? filteredProducts.filter(p => {
                      const pCats = p.categories && p.categories.length > 0 ? p.categories : [p.category];
                      return pCats.some(c => ["capas", "capa"].includes(c.toLowerCase()));
                    })
                  : products.filter(p => {
                      const pCats = p.categories && p.categories.length > 0 ? p.categories : [p.category];
                      return pCats.some(c => ["capas", "capa"].includes(c.toLowerCase()));
                    }).slice(0, 4);

                if (capasList.length === 0) return null;

                return (
                  <div className="mt-1 sm:mt-4 flex flex-col gap-3">
                    <div className="px-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          CAPAS E <span className="text-emerald-400">CASES</span>
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGroup("Celular");
                          setSelectedFilter("Capas");
                          setCurrentView("category");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-[#06141a]/90 hover:bg-[#081c24] text-emerald-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <span>Ver todos</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 md:gap-4.5">
                      {capasList.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onClick={() => handleNavigate("detail", p.id)}
                          onAddToCart={(e) => {
                            e.stopPropagation();
                            const defaultColor = p.colorStockControl && p.colors.length > 0 
                              ? p.colors[0].color 
                              : undefined;
                            handleAddToCart(p, 1, defaultColor);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Database reset helper to quickly reset catalog */}
              <div className="px-4 mt-4 flex justify-center">
                <button
                  onClick={handleResetDatabase}
                  className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar produtos padrão do catálogo</span>
                </button>
              </div>
            </motion.div>
          )}

          {currentView === "category" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3 pb-16"
            >
              {/* Realtime Interactive Search Field */}
              <div className="px-4 mt-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar nesta categoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#08121a] border border-emerald-950/40 focus:border-emerald-500 text-xs font-semibold rounded-2xl py-3 pl-10 pr-4 text-white focus:outline-none transition-all placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-2.5 p-1 text-gray-400 hover:text-white text-xs"
                    >
                      limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Group Selector Row */}
              <div className="px-4 flex items-center justify-between relative z-30">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                  <div className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-wider">
                    <span>PRODUTO:</span>
                    
                    {/* Interactive Group Dropdown Box */}
                    <div className="relative inline-block">
                      {selectedGroup !== "Todos" ? (
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === "groupSelect" ? null : "groupSelect")}
                          className="flex items-center gap-1.5 bg-emerald-500 text-[#070b11] px-2.5 py-1 rounded-md text-[11px] font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.25)] border border-emerald-400 uppercase tracking-normal cursor-pointer"
                        >
                          <span>{selectedGroup}</span>
                          <span className="text-[8px] font-bold">▼</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === "groupSelect" ? null : "groupSelect")}
                          className="flex items-center gap-1.5 bg-[#050910] text-white border border-emerald-500 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-normal cursor-pointer"
                        >
                          <span>Todos</span>
                          <span className="text-[8px] font-bold text-emerald-400">▼</span>
                        </button>
                      )}

                      {activeDropdown === "groupSelect" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute left-0 mt-1 w-32 bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1 shadow-2xl z-50 text-left">
                            {[
                              { label: "TODOS", value: "Todos" },
                              { label: "CELULAR", value: "Celular" },
                              { label: "PC", value: "Pc" },
                              { label: "VIDEOGAME", value: "Videogame" }
                            ].map((groupItem) => (
                              <button
                                key={groupItem.value}
                                onClick={() => {
                                  setSelectedGroup(groupItem.value as any);
                                  setSelectedFilter("Todos");
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors uppercase"
                              >
                                {groupItem.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate("home")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              </div>

              {/* Smaller Filters Button & Selected Filter Boxes Row */}
              <div className="px-4 flex flex-col gap-2 relative z-20">
                
                {/* Row 1: Filtros Button & Selected Filter Category Box on the same line */}
                <div className="flex items-center gap-2">
                  {/* Smaller Filters Button */}
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === "filterSelect" ? null : "filterSelect")}
                      className="h-6 inline-flex items-center justify-center gap-1 bg-[#091620] hover:bg-[#0d1f2e] border border-emerald-500/20 text-gray-300 text-[10px] font-bold px-2.5 rounded-md transition-all cursor-pointer shadow-sm"
                    >
                      <span>Filtros</span>
                      <span className="text-[7px] text-emerald-400 ml-1">▼</span>
                    </button>

                    {activeDropdown === "filterSelect" && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                        <div className="absolute left-0 top-full mt-1 w-40 bg-[#0b1620] border border-emerald-500/30 rounded-xl py-1 shadow-2xl z-50 text-left max-h-48 overflow-y-auto scrollbar-none">
                          {(selectedGroup === "Celular"
                            ? ["Todos", "Celular", "Capas", "películas", "Fones", "Carregadores", "Cabos"]
                            : selectedGroup === "Pc"
                            ? ["Todos", "Pc", "Mouse", "Teclado", "Fone", "Headset"]
                            : selectedGroup === "Videogame"
                            ? ["Todos", "Videogames", "Camisetas (Novo)", "Tênis (Novo)"]
                            : ["Todos", "Celular", "Pc", "Capas", "películas", "Fones", "Carregadores", "Cabos", "Mouse", "Teclado", "Fone", "Headset", "Videogames", "Camisetas (Novo)", "Tênis (Novo)"]
                          ).map((f) => (
                            <button
                              key={f}
                              onClick={() => {
                                setSelectedFilter(f);
                                setActiveDropdown(null);
                                if (f === "Capas") {
                                  setIsPhoneModalOpen(true);
                                  setModalStep(1);
                                }
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-emerald-500 hover:text-black font-semibold transition-colors"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Selected Filter Category Box */}
                  {selectedFilter !== "Todos" && (
                    <div className="h-6 inline-flex items-center justify-center gap-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 rounded-md whitespace-nowrap shadow-sm">
                      <span>{selectedFilter}</span>
                      <button
                        onClick={() => setSelectedFilter("Todos")}
                        className="hover:text-white font-black ml-1 text-xs cursor-pointer flex items-center justify-center leading-none"
                        aria-label="Remover filtro"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Button to the right of Capas & Películas category */}
                  {isPhoneModelCategory([selectedFilter]) && (
                    <button
                      onClick={() => {
                        setIsPhoneModalOpen(true);
                        setModalStep(1);
                      }}
                      className="h-6 inline-flex items-center justify-center bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold px-2.5 rounded-md cursor-pointer whitespace-nowrap transition-all shadow-sm"
                    >
                      {selectedBrand && selectedModel ? "Mudar Modelo" : "Escolher Modelo"}
                    </button>
                  )}
                </div>

                {/* Row 2: Selected models tags on the line below */}
                {isPhoneModelCategory([selectedFilter]) && (selectedBrand || selectedModel) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedBrand && (
                      <div className="h-6 inline-flex items-center justify-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 rounded-md whitespace-nowrap shadow-sm">
                        <span>📱 {selectedBrand}</span>
                        <button
                          onClick={() => setSelectedBrand("")}
                          className="hover:text-white font-black ml-1 text-xs cursor-pointer leading-none"
                          aria-label="Remover marca"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {selectedModel && (
                      <div className="h-6 inline-flex items-center justify-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 rounded-md whitespace-nowrap shadow-sm">
                        <span>{selectedModel}</span>
                        <button
                          onClick={() => setSelectedModel("")}
                          className="hover:text-white font-black ml-1 text-xs cursor-pointer leading-none"
                          aria-label="Remover modelo"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Responsive Products Grid View (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
              <div className="px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 md:gap-4.5 mt-1 relative z-10">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-2 text-center py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Grid className="w-8 h-8 text-emerald-600 animate-pulse" />
                    <span className="text-xs font-bold text-gray-400">Nenhum produto encontrado</span>
                    <span className="text-[10px]">Não há produtos com os filtros selecionados</span>
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={() => handleNavigate("detail", p.id)}
                      onAddToCart={(e) => {
                        e.stopPropagation();
                        const defaultColor = p.colorStockControl && p.colors.length > 0 
                          ? p.colors[0].color 
                          : undefined;
                        handleAddToCart(p, 1, defaultColor);
                      }}
                    />
                  ))
                )}
              </div>

              {/* Back to home page helper */}
              <div className="px-4 mt-6 flex justify-center">
                <button
                  onClick={() => handleNavigate("home")}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline transition-all cursor-pointer"
                >
                  ← Voltar para a Página Inicial
                </button>
              </div>
            </motion.div>
          )}

          {currentView === "about" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 max-w-2xl mx-auto flex flex-col gap-6 w-full"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-950/40">
                <button
                  onClick={() => handleNavigate("home")}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  ← Voltar para a Loja
                </button>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Sobre Nós</span>
              </div>

              <div className="bg-[#0b1622] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="5" width="14" height="14" rx="2" />
                      <path d="M9 9h6v6H9z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">{storeSettings.storeName || "Thyago Tech"}</h1>
                    <p className="text-xs sm:text-sm text-emerald-400 font-semibold mt-1">{storeSettings.storeTagline || "Sua loja de tecnologia e acessórios"}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-300 leading-relaxed text-left border-t border-b border-emerald-950/40 py-6">
                  <p>
                    Seja bem-vindo(a) à <strong className="text-white">{storeSettings.storeName || "Thyago Tech"}</strong>! Somos especialistas em trazer o melhor em tecnologia, acessórios para celular, capas, películas, periféricos gamer, eletrônicos e novidades para o seu dia a dia.
                  </p>
                  <p className="font-bold text-emerald-300 bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30">
                    📍 Atendemos toda a Região Metropolitana do Recife e enviamos para todo o Brasil com rapidez e segurança!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <a
                    href="https://instagram.com/Thyago.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <span>📷 Siga no Instagram: @Thyago.tech</span>
                  </a>

                  <button
                    onClick={() => {
                      const phone = storeSettings.whatsappNumber || "5581997073882";
                      window.open(`https://wa.me/${phone}?text=Olá! Vim pelo site e gostaria de tirar algumas dúvidas.`, "_blank");
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg transition-colors cursor-pointer"
                  >
                    <span>💬 Falar no WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === "detail" && selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProductDetail
                product={selectedProduct}
                allProducts={products}
                onBack={() => handleNavigate("home")}
                onNavigateToProduct={(id) => handleNavigate("detail", id)}
                onNavigateToCategory={({ group, filter, model }) => {
                  if (group) setSelectedGroup(group);
                  if (filter) setSelectedFilter(filter);
                  if (model) setSelectedModel(model);
                  handleNavigate("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onAddToCart={(prod, qty, col) => handleAddToCart(prod, qty, col)}
                storeSettings={storeSettings}
              />
            </motion.div>
          )}

          {currentView === "admin" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isAdmin ? (
                <AdminPanel
                  products={products}
                  onSaveProducts={handleSaveProducts}
                  sales={sales}
                  onSaveSale={handleSaveSale}
                  onUpdateSaleStatus={handleUpdateSaleStatus}
                  onDeleteSale={handleDeleteSale}
                  banners={banners}
                  onSaveBanners={handleSaveBanners}
                  promoBannersList={promoBanners}
                  onSavePromoBanners={handleSavePromoBanners}
                  storeSettings={storeSettings}
                  onSaveSettings={handleSaveSettings}
                  onBack={() => handleNavigate("home")}
                />
              ) : (
                <div className="p-6 my-8 text-center flex flex-col items-center justify-center gap-4 bg-[#07111c] border border-emerald-950/60 rounded-3xl mx-4 shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.2)]">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Acesso Restrito ao Administrador</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                      O Painel de Administração e a edição deste catálogo são exclusivos para a conta do proprietário <strong className="text-emerald-400 font-bold">{ADMIN_EMAIL}</strong>.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Fazer Login como Administrador</span>
                    </button>
                    <button
                      onClick={() => handleNavigate("home")}
                      className="w-full py-2.5 bg-[#0b1622] hover:bg-[#0f1f2e] text-gray-300 font-bold text-xs rounded-xl border border-emerald-950/60 transition-colors cursor-pointer"
                    >
                      ← Voltar para a Loja
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Global Cart Slide-Over Drawer */}
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          storeSettings={storeSettings}
        />

        {/* Global Phone Brand & Model Selection Modal for Capas */}
        {isPhoneModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#07111b] border border-emerald-500/40 rounded-2xl w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                    Passo {modalStep} de 2
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    {modalStep === 1 ? "Escolha a Marca do Celular" : `Escolha o Modelo (${selectedBrand})`}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="text-gray-400 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modalStep === 1 ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {PHONE_BRANDS.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedBrand === brand
                            ? "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20"
                            : "bg-[#0b1620] text-gray-200 border-emerald-950 hover:border-emerald-500/40"
                        }`}
                      >
                        <span>{brand}</span>
                        {selectedBrand === brand && <span>✓</span>}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={!selectedBrand}
                      onClick={() => setModalStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Avançar ➔
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {(PHONE_MODELS[selectedBrand] || []).map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedModel === model
                            ? "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20"
                            : "bg-[#0b1620] text-gray-200 border-emerald-950 hover:border-emerald-500/40"
                        }`}
                      >
                        <span>{model}</span>
                        {selectedModel === model && <span>✓</span>}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2 rounded-xl bg-[#0b1620] border border-emerald-950 text-gray-300 text-xs font-bold hover:text-white cursor-pointer"
                    >
                      ← Voltar
                    </button>
                    <button
                      disabled={!selectedModel}
                      onClick={() => setIsPhoneModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Concluir ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Login / Register Auth Modal */}
        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={(email) => {
            showToast(`✓ Bem-vindo, ${email}!`);
            if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
              setCurrentView("admin");
            }
          }}
        />

        {/* Floating Real-time Cloud Sync Toast */}
        <AnimatePresence>
          {cloudToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 z-50 left-1/2 -translate-x-1/2 bg-[#061520] border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-full shadow-[0_4px_25px_rgba(0,225,129,0.3)] flex items-center gap-2 text-xs font-bold pointer-events-none backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>{cloudToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Floating Indicator bar mimicking simulated OS handle bar (Mobile only) */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 h-4 bg-[#05090f] flex items-center justify-center pointer-events-none z-40 border-t border-emerald-950/10">
          <div className="w-24 h-1 bg-gray-700/60 rounded-full" />
        </div>

      </div>
    </div>
  );
}
