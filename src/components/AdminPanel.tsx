import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Trash2, Edit2, Check, X, ArrowLeft, 
  ToggleLeft, ToggleRight, Save, Image as ImageIcon, 
  Tag, List, FileText, Info, Package, AlertCircle,
  Upload, ArrowUp, ArrowDown, Layers, Eye, Sparkles,
  HelpCircle, RefreshCw, Smartphone, Monitor, Gamepad2,
  AlertTriangle, Video, Film, Play, ChevronLeft, ChevronRight,
  Palette, Settings, ShoppingBag, SlidersHorizontal, Clock, Phone,
  MapPin, CreditCard, Instagram, Store, RotateCcw, CheckCircle2, Link as LinkIcon,
  ZoomIn, ZoomOut, Maximize2, Lock, Unlock, Search, Star
} from "lucide-react";
import { Product, ColorStock, Specification, HighlightPoint, BannerItem, StoreSettings, defaultStoreSettings } from "../types";
import { initialBanners } from "../initialBanners";
import { compressImage } from "../utils/imageCompressor";
import { PHONE_BRANDS, PHONE_MODELS, PhoneBrand, isPhoneModelCategory } from "../phoneModels";

export const PRESET_VARIATION_COLORS = [
  { name: "Sem cor (Padrão Verde)", hex: "", preview: "#00e181" },
  { name: "Preto", hex: "#121212", preview: "#121212" },
  { name: "Branco", hex: "#FFFFFF", preview: "#FFFFFF" },
  { name: "Cinza Grafite", hex: "#374151", preview: "#374151" },
  { name: "Prata / Cinza Claro", hex: "#9CA3AF", preview: "#9CA3AF" },
  { name: "Dourado / Gold", hex: "#EAB308", preview: "#EAB308" },
  { name: "Vermelho", hex: "#EF4444", preview: "#EF4444" },
  { name: "Azul Royal", hex: "#2563EB", preview: "#2563EB" },
  { name: "Azul Marinho", hex: "#1E3A8A", preview: "#1E3A8A" },
  { name: "Verde Neon", hex: "#10B981", preview: "#10B981" },
  { name: "Verde Militar", hex: "#064E3B", preview: "#064E3B" },
  { name: "Roxo / Púrpura", hex: "#8B5CF6", preview: "#8B5CF6" },
  { name: "Rosa / Pink", hex: "#EC4899", preview: "#EC4899" },
  { name: "Rose Gold", hex: "#B76E79", preview: "#B76E79" },
  { name: "Laranja", hex: "#F97316", preview: "#F97316" },
  { name: "Amarelo", hex: "#FACC15", preview: "#FACC15" },
  { name: "Ciano / Turquesa", hex: "#06B6D4", preview: "#06B6D4" },
  { name: "Marrom", hex: "#78350F", preview: "#78350F" }
];

export type AdminPageView = "menu" | "products" | "banners" | "orders" | "settings";

interface AdminPanelProps {
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  banners?: BannerItem[];
  onSaveBanners?: (updatedBanners: BannerItem[]) => void;
  storeSettings?: StoreSettings;
  onSaveSettings?: (updatedSettings: StoreSettings) => void;
  onBack: () => void;
}

export default function AdminPanel({ 
  products, 
  onSaveProducts, 
  banners = initialBanners, 
  onSaveBanners, 
  storeSettings,
  onSaveSettings,
  onBack 
}: AdminPanelProps) {
  // Admin Navigation View: "menu" | "products" | "banners" | "orders" | "settings"
  const [adminView, setAdminView] = useState<AdminPageView>("menu");

  // Settings State
  const [storeName, setStoreName] = useState(storeSettings?.storeName || defaultStoreSettings.storeName);
  const [storeTagline, setStoreTagline] = useState(storeSettings?.storeTagline || defaultStoreSettings.storeTagline || "");
  const [logoUrl, setLogoUrl] = useState(storeSettings?.logoUrl || "");
  const [logoZoom, setLogoZoom] = useState<number>(storeSettings?.logoZoom ?? 100);
  const [logoFit, setLogoFit] = useState<"cover" | "contain">(storeSettings?.logoFit ?? "cover");
  const [whatsappNumber, setWhatsappNumber] = useState(storeSettings?.whatsappNumber || defaultStoreSettings.whatsappNumber);
  const [businessHours, setBusinessHours] = useState(storeSettings?.businessHours || defaultStoreSettings.businessHours || "");
  const [instagramHandle, setInstagramHandle] = useState(storeSettings?.instagramHandle || defaultStoreSettings.instagramHandle || "");
  const [pixKey, setPixKey] = useState(storeSettings?.pixKey || defaultStoreSettings.pixKey || "");
  const [deliveryInfo, setDeliveryInfo] = useState(storeSettings?.deliveryInfo || defaultStoreSettings.deliveryInfo || "");
  const [address, setAddress] = useState(storeSettings?.address || defaultStoreSettings.address || "");
  const [logoLoading, setLogoLoading] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [customLogoUrlInput, setCustomLogoUrlInput] = useState("");
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [promoBannerUrl, setPromoBannerUrl] = useState(storeSettings?.promoBannerUrl || "");
  const [promoBannerLoading, setPromoBannerLoading] = useState(false);
  const [isPromoUrlInputOpen, setIsPromoUrlInputOpen] = useState(false);
  const [customPromoUrlInput, setCustomPromoUrlInput] = useState("");
  const promoBannerFileInputRef = useRef<HTMLInputElement>(null);

  // Sync settings when prop updates
  React.useEffect(() => {
    if (storeSettings) {
      setStoreName(storeSettings.storeName || defaultStoreSettings.storeName);
      setStoreTagline(storeSettings.storeTagline !== undefined ? storeSettings.storeTagline : (defaultStoreSettings.storeTagline || ""));
      setLogoUrl(storeSettings.logoUrl || "");
      setLogoZoom(typeof storeSettings.logoZoom === "number" ? storeSettings.logoZoom : (defaultStoreSettings.logoZoom ?? 100));
      setLogoFit(storeSettings.logoFit === "contain" ? "contain" : "cover");
      setWhatsappNumber(storeSettings.whatsappNumber || defaultStoreSettings.whatsappNumber);
      setBusinessHours(storeSettings.businessHours !== undefined ? storeSettings.businessHours : (defaultStoreSettings.businessHours || ""));
      setInstagramHandle(storeSettings.instagramHandle !== undefined ? storeSettings.instagramHandle : (defaultStoreSettings.instagramHandle || ""));
      setPixKey(storeSettings.pixKey !== undefined ? storeSettings.pixKey : (defaultStoreSettings.pixKey || ""));
      setDeliveryInfo(storeSettings.deliveryInfo !== undefined ? storeSettings.deliveryInfo : (defaultStoreSettings.deliveryInfo || ""));
      setAddress(storeSettings.address !== undefined ? storeSettings.address : (defaultStoreSettings.address || ""));
      setPromoBannerUrl(storeSettings.promoBannerUrl || "");
    }
  }, [storeSettings]);

  // Confirmation Modal State (replaces unreliable window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "banner" | "product" | "reset-banners";
    itemId?: string;
    itemTitle?: string;
    itemImage?: string;
  }>({
    isOpen: false,
    type: "banner"
  });

  // -------------------------------------------------------------
  // --- PRODUCTS MANAGEMENT STATE ---
  // -------------------------------------------------------------
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Product Form Fields State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>(["Mouse"]);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [isPromoActive, setIsPromoActive] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageInput, setNewImageInput] = useState("");
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideoInput, setNewVideoInput] = useState("");
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isUploadingVideos, setIsUploadingVideos] = useState(false);
  const productPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const productVideoInputRef = useRef<HTMLInputElement | null>(null);
  const [stock, setStock] = useState(10);
  const [showStock, setShowStock] = useState(true);
  const [colorStockControl, setColorStockControl] = useState(false);
  const [colors, setColors] = useState<ColorStock[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorQty, setNewColorQty] = useState(5);
  const [newColorHex, setNewColorHex] = useState("");
  const [colorPickerModal, setColorPickerModal] = useState<{
    isOpen: boolean;
    target: "new" | number;
    currentColorHex: string;
    variationName?: string;
  } | null>(null);
  const [customHexInput, setCustomHexInput] = useState("");
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Specifications state
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Highlight points state
  const [highlightPoints, setHighlightPoints] = useState<HighlightPoint[]>([]);
  const [newHighlightIcon, setNewHighlightIcon] = useState("Target");
  const [newHighlightTitle, setNewHighlightTitle] = useState("");
  const [newHighlightDesc, setNewHighlightDesc] = useState("");

  // Compatible models state (unlocked for Capas & Películas, max 5 models)
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalBrand, setModelModalBrand] = useState<PhoneBrand>("Apple");
  const [modelModalStep, setModelModalStep] = useState<1 | 2>(1);
  const [modelSearchQuery, setModelSearchQuery] = useState("");

  // Helper boolean to check if current selected categories allow phone model selection
  const isModelSelectionEnabled = isPhoneModelCategory(categories);

  // -------------------------------------------------------------
  // --- BANNERS MANAGEMENT STATE ---
  // -------------------------------------------------------------
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);
  const [bannerSubView, setBannerSubView] = useState<"topo" | "banner2">("topo");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerAlt, setBannerAlt] = useState("");
  const [bannerSrc, setBannerSrc] = useState("");
  const [bannerLinkGroup, setBannerLinkGroup] = useState<"Todos" | "Celular" | "Pc" | "Videogame">("Celular");
  const [bannerLinkFilter, setBannerLinkFilter] = useState("Capas");
  const [bannerActive, setBannerActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Current banners list safe reference
  const currentBanners = bannerSubView === "topo" 
    ? (banners && banners.length > 0 ? banners : initialBanners)
    : (storeSettings?.promoBanners || []);

  const saveBannersList = (updated: BannerItem[]) => {
    if (bannerSubView === "topo") {
      if (onSaveBanners) onSaveBanners(updated);
    } else {
      if (onSaveSettings) {
        onSaveSettings({ 
          ...(storeSettings || defaultStoreSettings), 
          promoBanners: updated 
        });
      }
    }
  };

  // Populate form with product to edit
  const startEditing = (p: Product) => {
    setEditingProduct(p);
    setIsCreatingNew(false);
    setName(p.name);
    setDescription(p.description);
    setCategories(p.categories && p.categories.length > 0 ? p.categories : [p.category]);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setIsPromoActive(p.isPromoActive);
    setImages([...p.images]);
    setVideos([...(p.videos || [])]);
    setStock(p.stock);
    setShowStock(p.showStock !== undefined ? !!p.showStock : true);
    setColorStockControl(p.colorStockControl);
    setColors([...(p.colors || [])]);
    setSpecifications([...(p.specifications || [])]);
    setHighlightPoints([...(p.highlightPoints || [])]);
    setCompatibleModels(p.compatibleModels ? [...p.compatibleModels] : []);
    setIsBestSeller(p.isBestSeller || false);
  };

  // Prepare form for a brand new product
  const startCreating = () => {
    setEditingProduct(null);
    setIsCreatingNew(true);
    setName("");
    setDescription("");
    setCategories(["Mouse"]);
    setPrice(39.99);
    setOriginalPrice(49.99);
    setIsPromoActive(false);
    setImages(["/src/assets/images/quantum_vector_mouse_1788183228777.jpg"]);
    setVideos([]);
    setStock(10);
    setShowStock(true);
    setColorStockControl(false);
    setColors([]);
    setSpecifications([
      { key: "Conexão", value: "USB Plug & Play" },
      { key: "Iluminação", value: "RGB Chroma" }
    ]);
    setHighlightPoints([
      { icon: "Sparkles", title: "Alta qualidade", desc: "Acabamento premium gamer" }
    ]);
    setCompatibleModels([]);
    setIsBestSeller(false);
  };

  const cancelForm = () => {
    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  const handleDeleteProductClick = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      type: "product",
      itemId: product.id,
      itemTitle: product.name,
      itemImage: product.images?.[0]
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Por favor, preencha o nome do produto.");
      return;
    }

    const finalStock = colorStockControl
      ? colors.reduce((acc, curr) => acc + curr.stock, 0)
      : stock;

    const primaryCat = categories[0] || "Mouse";
    const newOrUpdatedProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      description,
      category: primaryCat,
      categories,
      price: Number(price),
      originalPrice: Number(originalPrice),
      isPromoActive,
      images: images.length > 0 ? images : ["/src/assets/images/quantum_vector_mouse_1788183228777.jpg"],
      videos: videos.length > 0 ? videos : undefined,
      stock: finalStock,
      showStock,
      colorStockControl,
      colors,
      specifications,
      highlightPoints,
      compatibleModels: isModelSelectionEnabled ? compatibleModels : (editingProduct?.compatibleModels || []),
      isBestSeller
    };

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct.id ? newOrUpdatedProduct : p));
    } else {
      updatedList = [newOrUpdatedProduct, ...products];
    }

    onSaveProducts(updatedList);
    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  // --- Photo Upload & Gallery Management Handlers ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);
    const fileList = Array.from(files) as File[];
    const newLoadedImages: string[] = [];

    for (const file of fileList) {
      try {
        const compressed = await compressImage(file, {
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.82,
          mimeType: "image/jpeg"
        });
        newLoadedImages.push(compressed);
      } catch (err) {
        console.warn("Error optimizing photo:", err);
      }
    }

    if (newLoadedImages.length > 0) {
      setImages((prev) => [...prev, ...newLoadedImages]);
    }
    setIsUploadingPhotos(false);
    if (productPhotoInputRef.current) {
      productPhotoInputRef.current.value = "";
    }
  };

  const handleAddImage = () => {
    if (newImageInput.trim()) {
      setImages([...images, newImageInput.trim()]);
      setNewImageInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index > 0) {
      const updated = [...images];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      setImages(updated);
    } else if (direction === "right" && index < images.length - 1) {
      const updated = [...images];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      setImages(updated);
    }
  };

  // --- Video Upload & Video Gallery Handlers ---
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingVideos(true);
    const fileList = Array.from(files) as File[];
    let loadedCount = 0;
    const newLoadedVideos: string[] = [];

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newLoadedVideos.push(event.target.result as string);
        }
        loadedCount++;
        if (loadedCount === fileList.length) {
          setVideos((prev) => [...prev, ...newLoadedVideos]);
          setIsUploadingVideos(false);
          if (productVideoInputRef.current) {
            productVideoInputRef.current.value = "";
          }
        }
      };
      reader.onerror = () => {
        loadedCount++;
        if (loadedCount === fileList.length) {
          setIsUploadingVideos(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddVideo = () => {
    if (newVideoInput.trim()) {
      setVideos([...videos, newVideoInput.trim()]);
      setNewVideoInput("");
    }
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, idx) => idx !== index));
  };

  const handleMoveVideo = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index > 0) {
      const updated = [...videos];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      setVideos(updated);
    } else if (direction === "right" && index < videos.length - 1) {
      const updated = [...videos];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      setVideos(updated);
    }
  };

  const handleAddColor = () => {
    if (newColorName.trim()) {
      setColors([
        ...colors,
        {
          color: newColorName.trim(),
          stock: Number(newColorQty),
          colorHex: newColorHex.trim() ? newColorHex.trim() : undefined
        }
      ]);
      setNewColorName("");
      setNewColorQty(5);
      setNewColorHex("");
    }
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, idx) => idx !== index));
  };

  const openColorPickerFor = (target: "new" | number, currentHex: string = "", name: string = "") => {
    setCustomHexInput(currentHex || "");
    setColorPickerModal({
      isOpen: true,
      target,
      currentColorHex: currentHex,
      variationName: name
    });
  };

  const handleSelectVariationColor = (hex: string, colorName?: string) => {
    if (!colorPickerModal) return;
    const cleanHex = hex.trim();
    if (colorPickerModal.target === "new") {
      setNewColorHex(cleanHex);
      if (!newColorName.trim() && colorName && cleanHex !== "") {
        setNewColorName(colorName);
      }
    } else if (typeof colorPickerModal.target === "number") {
      const targetIdx = colorPickerModal.target;
      setColors(
        colors.map((item, i) =>
          i === targetIdx ? { ...item, colorHex: cleanHex ? cleanHex : undefined } : item
        )
      );
    }
    setColorPickerModal(null);
  };

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecifications([...specifications, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, idx) => idx !== index));
  };

  const handleAddHighlight = () => {
    if (newHighlightTitle.trim()) {
      setHighlightPoints([
        ...highlightPoints,
        { icon: newHighlightIcon, title: newHighlightTitle.trim(), desc: newHighlightDesc.trim() }
      ]);
      setNewHighlightTitle("");
      setNewHighlightDesc("");
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlightPoints(highlightPoints.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // --- BANNER ACTIONS & HANDLERS ---
  // -------------------------------------------------------------
  const startCreatingBanner = () => {
    setEditingBanner(null);
    setIsCreatingBanner(true);
    setBannerTitle("");
    setBannerAlt("");
    setBannerSrc("/src/assets/images/capinhas_peliculas_banner_1788199988487.jpg");
    setBannerLinkGroup("Celular");
    setBannerLinkFilter("Capas");
    setBannerActive(true);
  };

  const startEditingBanner = (banner: BannerItem) => {
    setEditingBanner(banner);
    setIsCreatingBanner(false);
    setBannerTitle(banner.title || "");
    setBannerAlt(banner.alt || "");
    setBannerSrc(banner.src || "");
    setBannerLinkGroup(banner.linkGroup || "Celular");
    setBannerLinkFilter(banner.linkFilter || "Capas");
    setBannerActive(banner.active !== false);
  };

  const cancelBannerForm = () => {
    setEditingBanner(null);
    setIsCreatingBanner(false);
  };

  // Handle local image file upload with instant optimized preview
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecione um arquivo de imagem válido (JPG, PNG ou WEBP).");
        return;
      }
      try {
        const compressed = await compressImage(file, {
          maxWidth: 1400,
          maxHeight: 700,
          quality: 0.85,
          mimeType: "image/jpeg"
        });
        setBannerSrc(compressed);
        if (!bannerTitle) {
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          setBannerTitle(fileNameWithoutExt);
          setBannerAlt(fileNameWithoutExt);
        }
      } catch (err) {
        console.warn("Error compressing banner:", err);
      }
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerSrc.trim()) {
      alert("Por favor insira a imagem do banner ou selecione um arquivo.");
      return;
    }

    const titleValue = bannerTitle.trim() || bannerAlt.trim() || "Banner Carrossel";
    const altValue = bannerAlt.trim() || titleValue;

    const newOrUpdatedBanner: BannerItem = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      src: bannerSrc.trim(),
      alt: altValue,
      title: titleValue,
      linkGroup: bannerLinkGroup,
      linkFilter: bannerLinkFilter,
      active: bannerActive
    };

    let updatedList: BannerItem[];
    if (editingBanner) {
      updatedList = currentBanners.map((b) => (b.id === editingBanner.id ? newOrUpdatedBanner : b));
    } else {
      updatedList = [newOrUpdatedBanner, ...currentBanners];
    }

    saveBannersList(updatedList);
    setEditingBanner(null);
    setIsCreatingBanner(false);
  };

  const handleDeleteBannerClick = (banner: BannerItem) => {
    setConfirmModal({
      isOpen: true,
      type: "banner",
      itemId: banner.id,
      itemTitle: banner.title || banner.alt || "Banner Promocional",
      itemImage: banner.src
    });
  };

  const handleResetBannersClick = () => {
    setConfirmModal({
      isOpen: true,
      type: "reset-banners",
      itemTitle: "Restaurar Banners Padrão"
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "banner" && confirmModal.itemId) {
      const updated = currentBanners.filter((b) => b.id !== confirmModal.itemId);
      saveBannersList(updated);
    } else if (confirmModal.type === "product" && confirmModal.itemId) {
      const updated = products.filter((p) => p.id !== confirmModal.itemId);
      onSaveProducts(updated);
    } else if (confirmModal.type === "reset-banners") {
      saveBannersList(initialBanners);
    }
    setConfirmModal({ isOpen: false, type: "banner" });
  };

  const handleToggleBannerActive = (id: string) => {
    const updated = currentBanners.map((b) => {
      if (b.id === id) {
        return { ...b, active: b.active === false ? true : false };
      }
      return b;
    });
    saveBannersList(updated);
  };

  const handleMoveBanner = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBanners.length) return;

    const updated = [...currentBanners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    saveBannersList(updated);
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const getPageTitle = () => {
    switch (adminView) {
      case "products":
        return "Editar Produtos";
      case "banners":
        return "Editar Banners";
      case "orders":
        return "Pedidos";
      case "settings":
        return "Configurações";
      default:
        return "Painel Administrativo";
    }
  };

  const handleTopBack = () => {
    if (adminView === "menu") {
      onBack();
    } else {
      if (adminView === "products" && (editingProduct || isCreatingNew)) {
        cancelForm();
        return;
      }
      if (adminView === "banners" && (editingBanner || isCreatingBanner)) {
        cancelBannerForm();
        return;
      }
      setAdminView("menu");
    }
  };

  return (
    <div className="min-h-screen bg-[#05090f] pb-16 text-gray-100">
      {/* Top Header bar */}
      <div className="px-4 py-3 bg-[#070c14] border-b border-emerald-950/20 flex items-center justify-between sticky top-[61px] z-20">
        <button 
          onClick={handleTopBack}
          className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{adminView === "menu" ? "Voltar à vitrine" : "Voltar"}</span>
        </button>

        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
          {getPageTitle()}
        </span>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 flex flex-col gap-4">
        
        {/* ============================================================== */}
        {/* ==================== MAIN MENU VIEW ========================== */}
        {/* ============================================================== */}
        {adminView === "menu" && (
          <div className="flex flex-col gap-3">
            <div className="pb-1">
              <h2 className="text-lg font-black text-white">Menu do Administrador</h2>
              <p className="text-[11px] text-gray-400">Selecione uma categoria para gerenciar</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Option 1: Editar Produtos */}
              <button
                id="btn-menu-products"
                onClick={() => setAdminView("products")}
                className="w-full text-left bg-[#08121a] hover:bg-[#0c1c2a] border border-emerald-950/70 hover:border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Editar Produtos
                      </h3>
                      <span className="text-[9px] font-extrabold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                        {products.length} itens
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      Estoque, fotos, preços e variações
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* Option 2: Editar Banners */}
              <button
                id="btn-menu-banners"
                onClick={() => setAdminView("banners")}
                className="w-full text-left bg-[#08121a] hover:bg-[#0c1c2a] border border-emerald-950/70 hover:border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Editar Banners
                      </h3>
                      <span className="text-[9px] font-extrabold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded-md">
                        {currentBanners.length} banners
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      Carrossel promocional da tela inicial
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* Option 3: Pedidos */}
              <button
                id="btn-menu-orders"
                onClick={() => setAdminView("orders")}
                className="w-full text-left bg-[#08121a] hover:bg-[#0c1c2a] border border-emerald-950/70 hover:border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-black transition-all">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        Pedidos
                      </h3>
                      <span className="text-[9px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded">
                        Sem função por enquanto
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      Histórico e controle de vendas
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* Option 4: Configurações */}
              <button
                id="btn-menu-settings"
                onClick={() => setAdminView("settings")}
                className="w-full text-left bg-[#08121a] hover:bg-[#0c1c2a] border border-emerald-950/70 hover:border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-purple-500 group-hover:text-black transition-all">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        Configurações
                      </h3>
                      <span className="text-[9px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Ativo
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      Logo, dados da loja, WhatsApp e horários
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ==================== ORDERS SECTION ========================== */}
        {/* ============================================================== */}
        {adminView === "orders" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Pedidos</h2>
                <p className="text-[10px] text-gray-400">Controle e acompanhamento de vendas</p>
              </div>
              <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-lg">
                Sem função por enquanto
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#08121a] border border-emerald-950/70 flex flex-col items-center justify-center text-center gap-3 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-white">Central de Pedidos e Vendas</h3>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Este módulo está em preparação. Em breve você poderá gerenciar todas as mensagens de vendas do WhatsApp, aprovar pagamentos PIX/Cartão e dar baixa automática no estoque por aqui.
              </p>
              <button
                onClick={() => setAdminView("menu")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer shadow-md"
              >
                Voltar ao Menu Principal
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* =================== SETTINGS SECTION ========================= */}
        {/* ============================================================== */}
        {adminView === "settings" && (
          <div className="flex flex-col gap-5 pb-8">
            {/* Top Title & Save Button Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Configurações da Loja</span>
                </h2>
                <p className="text-[10px] text-gray-400">Personalize a identidade, logo, WhatsApp e informações da loja</p>
              </div>
              <button
                id="btn-save-settings-top"
                onClick={() => {
                  const updated: StoreSettings = {
                    storeName: storeName.trim() || defaultStoreSettings.storeName,
                    storeTagline: storeTagline.trim(),
                    logoUrl: logoUrl.trim(),
                    logoZoom: logoZoom,
                    logoFit: logoFit,
                    whatsappNumber: whatsappNumber.trim() || defaultStoreSettings.whatsappNumber,
                    businessHours: businessHours.trim(),
                    instagramHandle: instagramHandle.trim(),
                    pixKey: pixKey.trim(),
                    deliveryInfo: deliveryInfo.trim(),
                    address: address.trim()
                  };
                  if (onSaveSettings) onSaveSettings(updated);
                  setSettingsSavedToast(true);
                  setTimeout(() => setSettingsSavedToast(false), 3000);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
              {settingsSavedToast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Configurações salvas e sincronizadas com sucesso!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. SEÇÃO DE LOGO */}
            <div className="p-4 rounded-2xl bg-[#08121a] border border-emerald-950/80 flex flex-col gap-4 shadow-md">
              <div className="flex items-center justify-between border-b border-emerald-950/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Logo da Loja</h3>
                    <p className="text-[10px] text-gray-400">Esta imagem preenche a moldura no topo e cabeçalho do site</p>
                  </div>
                </div>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                  >
                    Remover Logo
                  </button>
                )}
              </div>

              {/* Upload Dropzone & Actions */}
              <div className="flex flex-col gap-3">
                <input 
                  type="file" 
                  ref={logoFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 10 * 1024 * 1024) {
                      alert("A imagem selecionada é muito grande. Escolha uma foto de até 10MB.");
                      return;
                    }

                    setLogoLoading(true);
                    try {
                      const compressed = await compressImage(file, {
                        maxWidth: 600,
                        maxHeight: 600,
                        quality: 0.92,
                        mimeType: "image/webp"
                      });
                      setLogoUrl(compressed);
                    } catch (err) {
                      console.error("Erro ao processar imagem da logo:", err);
                      const reader = new FileReader();
                      reader.onload = (loadEvt) => {
                        if (loadEvt.target?.result) {
                          setLogoUrl(loadEvt.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    } finally {
                      setLogoLoading(false);
                      if (logoFileInputRef.current) {
                        logoFileInputRef.current.value = "";
                      }
                    }
                  }}
                  className="hidden" 
                />

                <div 
                  onClick={() => logoFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
                    logoUrl 
                      ? "border-emerald-500/40 bg-emerald-950/15 hover:bg-emerald-950/25" 
                      : "border-gray-800 hover:border-emerald-500/50 bg-[#060e15] hover:bg-[#091520]"
                  }`}
                >
                  {logoLoading ? (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                      <span className="text-xs text-gray-300 font-bold">Otimizando e preparando imagem...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {logoUrl ? "Clique para carregar outra imagem da Logo" : "Clique ou arraste a imagem da sua Logo"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Formatos: PNG, JPG, WEBP ou SVG (A imagem preenche toda a moldura automaticamente)
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Option to insert direct image URL */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{isUrlInputOpen ? "Ocultar campo de link URL" : "Ou inserir link direto da imagem (URL)"}</span>
                  </button>
                </div>

                {isUrlInputOpen && (
                  <div className="flex items-center gap-2 bg-[#060e15] p-2 rounded-xl border border-emerald-950">
                    <input
                      type="url"
                      value={customLogoUrlInput}
                      onChange={(e) => setCustomLogoUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/minha-logo.png"
                      className="flex-1 bg-transparent px-2 text-xs text-white placeholder:text-gray-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customLogoUrlInput.trim()) {
                          setLogoUrl(customLogoUrlInput.trim());
                          setCustomLogoUrlInput("");
                          setIsUrlInputOpen(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                )}

                {/* CONTROLES DE ZOOM E ENQUADRAMENTO */}
                {logoUrl && (
                  <div className="mt-1 bg-[#060f18] rounded-xl border border-emerald-900/40 p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <ZoomIn className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Ajuste de Zoom na Moldura</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs">
                        {logoZoom}% {logoZoom === 100 ? "(Padrão)" : ""}
                      </span>
                    </div>

                    {/* Zoom Range Slider */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setLogoZoom((prev) => Math.max(50, prev - 10))}
                        title="Diminuir Zoom"
                        className="w-8 h-8 rounded-lg bg-[#091825] hover:bg-[#0e2437] border border-emerald-950 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <div className="flex-1 flex flex-col gap-1">
                        <input
                          type="range"
                          min={50}
                          max={250}
                          step={5}
                          value={logoZoom}
                          onChange={(e) => setLogoZoom(Number(e.target.value))}
                          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-medium">
                          <span>50% (Distante)</span>
                          <span>100% (Original)</span>
                          <span>250% (Aproximado)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLogoZoom((prev) => Math.min(250, prev + 10))}
                        title="Aumentar Zoom"
                        className="w-8 h-8 rounded-lg bg-[#091825] hover:bg-[#0e2437] border border-emerald-950 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Zoom Presets Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-gray-400 font-bold mr-1">Atalhos rápidos:</span>
                      {[75, 100, 125, 150, 175, 200].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setLogoZoom(preset)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            logoZoom === preset
                              ? "bg-emerald-500 text-black shadow-sm font-black"
                              : "bg-[#0a1826] hover:bg-[#102436] text-gray-300 border border-emerald-950/70"
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>

                    {/* Preenchimento / Enquadramento Toggle */}
                    <div className="pt-2 border-t border-emerald-950/60 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Modo de Enquadramento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLogoFit("cover")}
                          className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center text-center gap-1 transition-all cursor-pointer border ${
                            logoFit === "cover"
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                              : "bg-[#0a1826] border-emerald-950 text-gray-400 hover:text-gray-300 hover:bg-[#0e2437]"
                          }`}
                        >
                          <span className="text-[11px] font-extrabold">Preencher Toda a Moldura</span>
                          <span className="text-[9px] text-gray-400 font-normal">Preenche 100% da moldura quadrada</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLogoFit("contain")}
                          className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center text-center gap-1 transition-all cursor-pointer border ${
                            logoFit === "contain"
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                              : "bg-[#0a1826] border-emerald-950 text-gray-400 hover:text-gray-300 hover:bg-[#0e2437]"
                          }`}
                        >
                          <span className="text-[11px] font-extrabold">Ajustar Imagem Inteira</span>
                          <span className="text-[9px] text-gray-400 font-normal">Encaixa a imagem com margens</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Preview Cards */}
                <div className="mt-2 bg-[#060c13] rounded-xl border border-emerald-950/70 p-3.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      Pré-visualização da Moldura e do Topo
                    </span>
                    <span className="text-[9px] text-emerald-400/80 font-semibold">Atualização em tempo real</span>
                  </div>

                  {/* Dual Preview: Magnified Frame + Simulated Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* 1. Magnified Frame Showcase */}
                    <div className="sm:col-span-5 bg-[#08131d] border border-emerald-900/50 rounded-xl p-3 flex items-center gap-3">
                      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#091522] border border-emerald-500/50 ring-2 ring-emerald-400/20 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)] flex-shrink-0">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt="Logo preview" 
                            referrerPolicy="no-referrer"
                            style={{
                              transform: `scale(${logoZoom / 100})`,
                              transformOrigin: "center center"
                            }}
                            className={`w-full h-full transition-transform duration-200 ${
                              logoFit === "contain" ? "object-contain p-1.5" : "object-cover"
                            }`}
                          />
                        ) : (
                          <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="5" y="5" width="14" height="14" rx="2" />
                            <path d="M9 9h6v6H9z" />
                            <path d="M9 1h1v4H9zM14 1h1v4h-1zM9 19h1v4H9zM14 19h1v4h-1zM1 9h4v1H1zM1 14h4v1H1zM19 9h4v1h-4zM19 14h4v1h-4z" />
                          </svg>
                        )}
                        <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-inset ring-white/10" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-extrabold text-white block">Moldura Estilizada</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">Preenchimento total & acabamento luminoso</span>
                        {logoUrl && (
                          <span className="text-[9px] text-emerald-400 font-bold block mt-1">Zoom: {logoZoom}%</span>
                        )}
                      </div>
                    </div>

                    {/* 2. Simulated Navbar Header */}
                    <div className="sm:col-span-7 bg-[#070b11] border border-emerald-950/60 rounded-xl px-3.5 py-3 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-2.5 max-w-[85%]">
                        {logoUrl ? (
                          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#091522] border border-emerald-500/40 ring-1 ring-emerald-400/20 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.25)] flex-shrink-0">
                            <img 
                              src={logoUrl} 
                              alt="Logo preview" 
                              referrerPolicy="no-referrer"
                              style={{
                                transform: `scale(${logoZoom / 100})`,
                                transformOrigin: "center center"
                              }}
                              className={`w-full h-full transition-transform duration-200 ${
                                logoFit === "contain" ? "object-contain p-1" : "object-cover"
                              }`}
                            />
                            <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-inset ring-white/10" />
                          </div>
                        ) : (
                          <div className="relative flex items-center justify-center w-10 h-10 border border-emerald-400 rounded-xl bg-[#091522] shadow-[0_0_12px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/20 flex-shrink-0">
                            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="5" y="5" width="14" height="14" rx="2" />
                              <path d="M9 9h6v6H9z" />
                              <path d="M9 1h1v4H9zM14 1h1v4h-1zM9 19h1v4H9zM14 19h1v4h-1zM1 9h4v1H1zM1 14h4v1H1zM19 9h4v1h-4zM19 14h4v1h-4z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 truncate font-extrabold text-sm tracking-wider text-white uppercase">
                            <span>{storeName || "Thyago Tech"}</span>
                          </div>
                          {storeTagline && (
                            <p className="text-[8px] text-gray-400 font-medium truncate -mt-0.5">{storeTagline}</p>
                          )}
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-[#0a141d] border border-emerald-950 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DADOS BÁSICOS DA LOJA */}
            <div className="p-4 rounded-2xl bg-[#08121a] border border-emerald-950/80 flex flex-col gap-3.5 shadow-md">
              <div className="flex items-center gap-2.5 border-b border-emerald-950/50 pb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Identidade da Loja</h3>
                  <p className="text-[10px] text-gray-400">Nome e slogan que aparecem em todo o catálogo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">Nome da Loja</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Thyago Tech"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">Slogan / Subtítulo</label>
                  <input
                    type="text"
                    value={storeTagline}
                    onChange={(e) => setStoreTagline(e.target.value)}
                    placeholder="Ex: Tecnologia & Acessórios"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. ATENDIMENTO E WHATSAPP */}
            <div className="p-4 rounded-2xl bg-[#08121a] border border-emerald-950/80 flex flex-col gap-3.5 shadow-md">
              <div className="flex items-center gap-2.5 border-b border-emerald-950/50 pb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Atendimento & WhatsApp</h3>
                  <p className="text-[10px] text-gray-400">Número que recebe todos os pedidos gerados no carrinho</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">
                    WhatsApp para Pedidos (com DDD)
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Ex: (81) 99707-3882 ou 5581997073882"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <p className="text-[9px] text-gray-500 mt-1">
                    Os botões "Comprar pelo WhatsApp" e finalização de carrinho abrirão a conversa direta para este número.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">Horário de Atendimento</label>
                  <input
                    type="text"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="Ex: Seg à Sáb: 08h às 18h"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 4. PAGAMENTO & DADOS COMPLEMENTARES */}
            <div className="p-4 rounded-2xl bg-[#08121a] border border-emerald-950/80 flex flex-col gap-3.5 shadow-md">
              <div className="flex items-center gap-2.5 border-b border-emerald-950/50 pb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pagamento & Redes Sociais</h3>
                  <p className="text-[10px] text-gray-400">Chave PIX e dados de contato para facilitar o checkout</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">Chave PIX da Loja</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Ex: 81997073882 ou seu CNPJ/Email"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">Instagram da Loja</label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="Ex: @thyagotech"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">Cidade / Localização</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Recife - PE"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 mb-1 block">Informações de Entrega</label>
                  <input
                    type="text"
                    value={deliveryInfo}
                    onChange={(e) => setDeliveryInfo(e.target.value)}
                    placeholder="Ex: Entregas rápidas via Motoboy ou Correios"
                    className="w-full bg-[#060e15] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Deseja restaurar as configurações padrão da loja?")) {
                    setStoreName(defaultStoreSettings.storeName);
                    setStoreTagline(defaultStoreSettings.storeTagline || "");
                    setLogoUrl(defaultStoreSettings.logoUrl || "");
                    setLogoZoom(defaultStoreSettings.logoZoom ?? 100);
                    setLogoFit(defaultStoreSettings.logoFit ?? "cover");
                    setWhatsappNumber(defaultStoreSettings.whatsappNumber);
                    setBusinessHours(defaultStoreSettings.businessHours || "");
                    setInstagramHandle(defaultStoreSettings.instagramHandle || "");
                    setPixKey(defaultStoreSettings.pixKey || "");
                    setDeliveryInfo(defaultStoreSettings.deliveryInfo || "");
                    setAddress(defaultStoreSettings.address || "");
                    
                    if (onSaveSettings) {
                      onSaveSettings(defaultStoreSettings);
                    }
                    setSettingsSavedToast(true);
                    setTimeout(() => setSettingsSavedToast(false), 3000);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setAdminView("menu")}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#091522] hover:bg-[#0e2135] text-gray-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-emerald-950/70"
                >
                  Voltar ao Menu
                </button>

                <button
                  type="button"
                  id="btn-save-settings-bottom"
                  onClick={() => {
                    const updated: StoreSettings = {
                      storeName: storeName.trim() || defaultStoreSettings.storeName,
                      storeTagline: storeTagline.trim(),
                      logoUrl: logoUrl.trim(),
                      logoZoom: logoZoom,
                      logoFit: logoFit,
                      whatsappNumber: whatsappNumber.trim() || defaultStoreSettings.whatsappNumber,
                      businessHours: businessHours.trim(),
                      instagramHandle: instagramHandle.trim(),
                      pixKey: pixKey.trim(),
                      deliveryInfo: deliveryInfo.trim(),
                      address: address.trim(),
                      promoBannerUrl: promoBannerUrl.trim()
                    };
                    if (onSaveSettings) onSaveSettings(updated);
                    setSettingsSavedToast(true);
                    setTimeout(() => setSettingsSavedToast(false), 3000);
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ==================== BANNERS SECTION ========================= */}
        {/* ============================================================== */}
        {adminView === "banners" && (
          <>
            {/* Banner Sub-view Switcher (Banner Topo vs Banner 2) */}
            {!editingBanner && !isCreatingBanner && (
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#050e16] rounded-2xl border border-emerald-950/80 mb-4">
                <button
                  type="button"
                  onClick={() => setBannerSubView("topo")}
                  className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bannerSubView === "topo"
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                      : "text-gray-400 hover:text-white hover:bg-emerald-950/40"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Banner Topo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBannerSubView("banner2")}
                  className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bannerSubView === "banner2"
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                      : "text-gray-400 hover:text-white hover:bg-emerald-950/40"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Banner 2</span>
                </button>
              </div>
            )}

            {/* Banner Main View Header */}
            {!editingBanner && !isCreatingBanner && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">
                    {bannerSubView === "topo" ? "Carrossel de Banners (Topo)" : "Carrossel Promocional (Banner 2)"}
                  </h2>
                  <p className="text-[10px] text-gray-400">Personalize os banners da tela inicial</p>
                </div>
                <button
                  id="admin-create-banner-btn"
                  onClick={startCreatingBanner}
                  className="flex items-center gap-1.5 bg-[#00e181] hover:bg-[#00c570] text-[#050c12] text-xs font-black px-3 py-2.5 rounded-xl shadow-[0_3px_10px_rgba(0,225,129,0.25)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Banner</span>
                </button>
              </div>
            )}

            {/* Informational Guidance Box: Ideal Resolution & Aspect Ratio */}
            {!editingBanner && !isCreatingBanner && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#061c28] to-[#040f17] border border-emerald-500/30 shadow-lg flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                    Guia de Proporção & Resolução Ideal
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#050e16]/80 p-2.5 rounded-xl border border-emerald-950/60 flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Proporção Recomendada</span>
                    <span className="text-sm font-black text-emerald-400">
                      {bannerSubView === "topo" ? "3 : 1 (Panorâmica)" : "6 : 1 (Faixa Larga)"}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {bannerSubView === "topo" ? "Largura 3× a altura da arte" : "Largura 6× a altura da arte"}
                    </span>
                  </div>

                  <div className="bg-[#050e16]/80 p-2.5 rounded-xl border border-emerald-950/60 flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Resolução Ideal</span>
                    <span className="text-sm font-black text-emerald-400">
                      {bannerSubView === "topo" ? "1200 × 400 px" : "1200 × 200 px"}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {bannerSubView === "topo" ? "Mínimo: 900 × 300 px" : "Mínimo: 900 × 150 px"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#040c14] p-2 rounded-xl border border-emerald-950/40 text-[10px] text-gray-300 flex items-start gap-1.5 leading-tight">
                  <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Dica de Designer:</strong> Formatos aceitos: <strong>PNG, JPG ou WEBP</strong>. Mantenha os textos e logotipos a pelo menos <strong>30px das bordas</strong> para perfeito enquadramento tanto em computadores quanto em celulares.
                  </span>
                </div>
              </div>
            )}

            {/* BANNERS LISTING */}
            {!editingBanner && !isCreatingBanner && (
              <div className="flex flex-col gap-3">
                {currentBanners.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-emerald-500" />
                    <span className="text-xs font-bold text-white">Nenhum banner cadastrado</span>
                    <span className="text-[10px] text-gray-500">Clique em "Novo Banner" para adicionar seu primeiro banner</span>
                  </div>
                ) : (
                  currentBanners.map((banner, index) => (
                    <div 
                      key={banner.id || index}
                      className={`rounded-xl border bg-[#08121a] p-3 flex flex-col gap-2.5 transition-all ${
                        banner.active !== false
                          ? "border-emerald-950/60 hover:border-emerald-500/30"
                          : "border-gray-800/40 opacity-60"
                      }`}
                    >
                      {/* Banner Preview Thumbnail with adaptive aspect ratio */}
                      <div className={`relative ${bannerSubView === "topo" ? "aspect-[3/1]" : "aspect-[4/1] md:aspect-[6/1]"} w-full rounded-lg overflow-hidden bg-black border border-emerald-950/50`}>
                        <img 
                          src={banner.src} 
                          alt={banner.alt || banner.title} 
                          className="w-full h-full object-cover scale-[1.03]"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 border border-emerald-900/40">
                          Ordem #{index + 1}
                        </div>
                        {banner.active === false && (
                          <div className="absolute top-1.5 right-1.5 bg-rose-950/90 text-rose-300 text-[9px] font-extrabold px-2 py-0.5 rounded border border-rose-800">
                            Pausado
                          </div>
                        )}
                      </div>

                      {/* Banner Details & Action Controls */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">
                            {banner.title || banner.alt || `Banner #${index + 1}`}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-gray-400">
                            <span className="text-emerald-400 font-semibold">Destino:</span>
                            <span>{banner.linkGroup || "Geral"} {banner.linkFilter ? `• ${banner.linkFilter}` : ""}</span>
                          </div>
                        </div>

                        {/* Actions (Reorder, Toggle, Edit, Delete) */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Move Up */}
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveBanner(index, "up")}
                            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-emerald-400 hover:border-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Subir ordem"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            disabled={index === currentBanners.length - 1}
                            onClick={() => handleMoveBanner(index, "down")}
                            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-emerald-400 hover:border-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Descer ordem"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleBannerActive(banner.id)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              banner.active !== false
                                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:bg-emerald-950"
                                : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"
                            }`}
                            title={banner.active !== false ? "Pausar exibição" : "Ativar exibição"}
                          >
                            {banner.active !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => startEditingBanner(banner)}
                            className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteBannerClick(banner)}
                            className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Reset Default Banners Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleResetBannersClick}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restaurar banners padrão do carrossel</span>
                  </button>
                </div>
              </div>
            )}

            {/* CREATE / EDIT BANNER FORM */}
            {(isCreatingBanner || editingBanner) && (
              <form onSubmit={handleSaveBanner} className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{editingBanner ? "Editar Banner" : "Adicionar Novo Banner ao Carrossel"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={cancelBannerForm}
                    className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    ✕ Cancelar
                  </button>
                </div>

                {/* LIVE PREVIEW BOX */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Prévia em Tempo Real (Proporção {bannerSubView === "topo" ? "3:1" : "Adaptável Mobile"})</span>
                    <span className="text-emerald-400 text-[9px] font-normal">Exibição no carrossel</span>
                  </span>

                  <div className={`relative ${bannerSubView === "topo" ? "aspect-[3/1]" : "aspect-[4/1] md:aspect-[6/1]"} w-full rounded-xl overflow-hidden bg-[#04080e] border-2 border-emerald-500/40 shadow-inner flex items-center justify-center`}>
                    {bannerSrc ? (
                      <img 
                        src={bannerSrc} 
                        alt="Prévia do Banner" 
                        className="w-full h-full object-cover select-none scale-[1.03]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 gap-1">
                        <ImageIcon className="w-8 h-8 text-emerald-500/40" />
                        <span className="text-[10px]">Insira uma imagem abaixo para visualizar</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* IMAGE SOURCE CHOOSER (FILE UPLOAD OR URL) */}
                <div className="flex flex-col gap-2 p-3 bg-[#08121a] border border-emerald-950 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    Imagem do Banner
                  </span>

                  {/* Upload file directly from device */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-[#0b1b29] hover:bg-[#0f2538] border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Selecionar Arquivo do Dispositivo (PNG, JPG, WEBP)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 my-0.5">
                    <div className="flex-1 h-px bg-emerald-950/60" />
                    <span className="text-[9px] text-gray-500 uppercase">ou cole uma URL</span>
                    <div className="flex-1 h-px bg-emerald-950/60" />
                  </div>

                  {/* URL Text Input */}
                  <input
                    type="text"
                    placeholder="https://... ou caminho da imagem (/src/assets/images/...)"
                    value={bannerSrc}
                    onChange={(e) => setBannerSrc(e.target.value)}
                    className="w-full bg-[#050c12] border border-emerald-950 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* BANNER TITLE & ALT TEXT */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    Título / Descrição do Banner
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Proteção Completa: Capinhas e Películas"
                    value={bannerTitle}
                    onChange={(e) => {
                      setBannerTitle(e.target.value);
                      if (!bannerAlt) setBannerAlt(e.target.value);
                    }}
                    className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* DESTINATION CATEGORY ON CLICK */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                      Grupo ao Clicar
                    </label>
                    <select
                      value={bannerLinkGroup}
                      onChange={(e) => setBannerLinkGroup(e.target.value as any)}
                      className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Todos">Todos os Produtos</option>
                      <option value="Celular">Celular</option>
                      <option value="Pc">PC Gamer</option>
                      <option value="Videogame">Videogame / Outros</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                      Filtro Específico
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Capas, Películas, Mouse..."
                      value={bannerLinkFilter}
                      onChange={(e) => setBannerLinkFilter(e.target.value)}
                      className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* ACTIVE TOGGLE */}
                <div className="flex items-center justify-between p-3 bg-[#08121a] border border-emerald-950 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Banner Ativo no Carrossel</span>
                    <span className="text-[9px] text-gray-400">Exibir este banner no carrossel da tela inicial</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerActive(!bannerActive)}
                    className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {bannerActive ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                  </button>
                </div>

                {/* FORM ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={cancelBannerForm}
                    className="w-full bg-[#0c1f2e]/50 border border-emerald-950 text-emerald-400 hover:text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#00e181] hover:bg-[#00c570] text-black font-black text-xs py-3 rounded-xl shadow-[0_3px_15px_rgba(0,225,129,0.2)] transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Banner</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* ==================== PRODUCTS SECTION ======================== */}
        {/* ============================================================== */}
        {adminView === "products" && (
          <>
            {/* Products Main View Header */}
            {!editingProduct && !isCreatingNew && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Editar Produtos</h2>
                  <p className="text-[10px] text-gray-400">Gerencie todos os seus produtos cadastrados</p>
                </div>
                <button
                  id="admin-create-btn"
                  onClick={startCreating}
                  className="flex items-center gap-1.5 bg-[#00e181] hover:bg-[#00c570] text-[#050c12] text-xs font-black px-3 py-2.5 rounded-xl shadow-[0_3px_10px_rgba(0,225,129,0.25)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>
            )}

            {/* ---------------- PRODUCT LISTING VIEW ---------------- */}
            {!editingProduct && !isCreatingNew && (
              <div className="flex flex-col gap-3">
                {products.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-emerald-500" />
                    <span className="text-xs font-bold text-white">Sem produtos cadastrados</span>
                    <span className="text-[10px] text-gray-500">Clique em "Novo Produto" para iniciar</span>
                  </div>
                ) : (
                  products.map((p) => (
                    <div 
                      key={p.id}
                      className="rounded-xl border border-emerald-950/40 bg-[#08121a] p-3 flex gap-3 items-center justify-between hover:border-emerald-500/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                          <p className="text-[9px] text-emerald-400 font-semibold">{p.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-extrabold text-emerald-400">{formatPrice(p.price)}</span>
                            <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-900/30 px-1 rounded">
                              {p.colorStockControl 
                                ? `Estoque: ${p.colors.reduce((a,c)=>a+c.stock,0)} (Por Cor)`
                                : `Estoque: ${p.stock}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                       <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedList = products.map((item) =>
                              item.id === p.id ? { ...item, isBestSeller: !item.isBestSeller } : item
                            );
                            onSaveProducts(updatedList);
                          }}
                          className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                            p.isBestSeller
                              ? "bg-amber-950/40 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                              : "bg-emerald-950/30 border-emerald-900/30 text-gray-500 hover:text-amber-300"
                          }`}
                          title={p.isBestSeller ? "Remover dos destaques (Estrela marcada)" : "Marcar como produto em destaque (Estrela)"}
                        >
                          <Star className={`w-4 h-4 ${p.isBestSeller ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                        <button
                          id={`edit-p-${p.id}`}
                          onClick={() => startEditing(p)}
                          className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`del-p-${p.id}`}
                          onClick={() => handleDeleteProductClick(p)}
                          className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ---------------- EDIT / CREATE FORM ---------------- */}
            {(editingProduct || isCreatingNew) && (
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
                  <h3 className="text-sm font-bold text-white">
                    {editingProduct ? "Editar Produto" : "Criar Novo Produto"}
                  </h3>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    ✕ Cancelar
                  </button>
                </div>

                {/* BASIC INFO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Quantum Vector Mouse"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    Descrição Detalhada
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escreva sobre a qualidade, materiais e diferenciais..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* CATEGORIES SELECTION */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                      Categorias Associadas
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {categories.length} selecionada(s)
                    </span>
                  </div>

                  {/* Active Selected Tags */}
                  <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 bg-[#050c12] border border-emerald-950/60 rounded-xl">
                    {categories.length === 0 ? (
                      <span className="text-[10px] text-gray-500 italic">Nenhuma categoria selecionada. Clique abaixo para escolher.</span>
                    ) : (
                      categories.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {c}
                          <button
                            type="button"
                            onClick={() => setCategories(categories.filter((cat) => cat !== c))}
                            className="hover:opacity-75 cursor-pointer ml-0.5"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Category Buttons Grouped */}
                  <div className="flex flex-col gap-2 pt-1">
                    {/* Dispositivos Principais */}
                    <div>
                      <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
                        Dispositivos Principais:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {[
                          { id: "Celular", label: "📱 Celular" },
                          { id: "Pc", label: "💻 PC" },
                          { id: "Videogames", label: "🎮 Videogames" }
                        ].map((cat) => {
                          const isSelected = categories.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setCategories(categories.filter((c) => c !== cat.id));
                                } else {
                                  setCategories([...categories, cat.id]);
                                }
                              }}
                              className={`p-2 rounded-xl border text-center font-black transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                  : "bg-[#08121a] text-gray-300 border-emerald-950 hover:border-emerald-700"
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Acessórios Celular */}
                    <div>
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                        Acessórios de Celular:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {["Capas", "películas", "Carregadores", "Cabos", "Fones"].map((cat) => {
                          const isSelected = categories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setCategories(categories.filter((c) => c !== cat));
                                } else {
                                  setCategories([...categories, cat]);
                                }
                              }}
                              className={`p-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-500 font-black"
                                  : "bg-[#08121a] text-gray-400 border-emerald-950 hover:border-emerald-800"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Acessórios PC & Gamer */}
                    <div>
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                        Acessórios de PC / Gamer & Outros:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {["Mouse", "Teclado", "Fone", "Headset", "Camisetas (Novo)", "Tênis (Novo)"].map((cat) => {
                          const isSelected = categories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setCategories(categories.filter((c) => c !== cat));
                                } else {
                                  setCategories([...categories, cat]);
                                }
                              }}
                              className={`p-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-500 font-black"
                                  : "bg-[#08121a] text-gray-400 border-emerald-950 hover:border-emerald-800"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Category Input */}
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        placeholder="Outra categoria..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (customCategoryInput.trim() && !categories.includes(customCategoryInput.trim())) {
                              setCategories([...categories, customCategoryInput.trim()]);
                              setCustomCategoryInput("");
                            }
                          }
                        }}
                        className="flex-1 bg-[#08121a] border border-emerald-950 text-white rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customCategoryInput.trim() && !categories.includes(customCategoryInput.trim())) {
                            setCategories([...categories, customCategoryInput.trim()]);
                            setCustomCategoryInput("");
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* COMPATIBLE PHONE MODELS (ONLY UNLOCKED FOR CAPAS OR PELÍCULAS) */}
                <div 
                  id="admin-compatible-models-section"
                  className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                    isModelSelectionEnabled
                      ? "bg-[#081520]/80 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                      : "bg-[#060c13]/60 border-gray-800/80 opacity-65"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${
                        isModelSelectionEnabled 
                          ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400" 
                          : "bg-gray-900 border-gray-800 text-gray-500"
                      }`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                            Modelos Compatíveis
                          </label>
                          {isModelSelectionEnabled ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {compatibleModels.length}/5 selecionados
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Bloqueado
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-400 mt-0.5">
                          {isModelSelectionEnabled
                            ? "Adicione até 5 modelos de celulares compatíveis com este produto."
                            : "Liberado apenas quando a categoria Capas ou películas estiver selecionada."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selected Models Tag List or Empty State */}
                  {isModelSelectionEnabled ? (
                    <div className="mt-3 flex flex-col gap-2.5">
                      {compatibleModels.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {compatibleModels.map((model, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs"
                            >
                              <span>📱 {model}</span>
                              <button
                                type="button"
                                onClick={() => setCompatibleModels(compatibleModels.filter((_, i) => i !== idx))}
                                className="w-4 h-4 rounded-full bg-emerald-900/60 hover:bg-rose-500 hover:text-white flex items-center justify-center text-[10px] font-black transition-colors cursor-pointer"
                                title="Remover modelo"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-emerald-400/80 italic">
                          Nenhum modelo selecionado ainda. Clique abaixo para escolher até 5 modelos.
                        </p>
                      )}

                      {/* Action Button: Open Model Selector Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          setModelModalStep(1);
                          setModelSearchQuery("");
                          setIsModelModalOpen(true);
                        }}
                        disabled={compatibleModels.length >= 5}
                        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          compatibleModels.length >= 5
                            ? "bg-gray-900/80 border-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.25)] font-black"
                        }`}
                      >
                        {compatibleModels.length >= 5 ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Limite máximo de 5 modelos atingido</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              {compatibleModels.length === 0 
                                ? "Selecionar Modelo (Abrir Lista de Modelos)" 
                                : `Adicionar Mais Modelos (${compatibleModels.length}/5)`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-[#060b12] border border-gray-800/80 flex items-center justify-between text-gray-500">
                      <div className="flex items-center gap-2 text-[10px]">
                        <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>Selecione <strong className="text-gray-400 font-semibold">Capas</strong> ou <strong className="text-gray-400 font-semibold">películas</strong> acima para liberar</span>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="py-1 px-2.5 bg-gray-900 border border-gray-800 text-gray-600 text-[10px] font-bold rounded-lg cursor-not-allowed"
                      >
                        Selecionar Modelo
                      </button>
                    </div>
                  )}
                </div>

                {/* PRICING & PROMOTION */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                      Preço Atual (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                      Preço Original / Risque (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* TOGGLES */}
                <div className="flex flex-col gap-2 p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-200">Mostrar Estoque na Loja</span>
                      <span className="text-[9px] text-gray-400">Quando ativado, os clientes veem o status "Em estoque" e quantidades</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowStock(!showStock)}
                      className="text-emerald-400 cursor-pointer"
                    >
                      {showStock ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-emerald-950/40 pt-2">
                    <span className="text-xs font-bold text-gray-200">Destacar Tag de Desconto / Promoção</span>
                    <button
                      type="button"
                      onClick={() => setIsPromoActive(!isPromoActive)}
                      className="text-emerald-400 cursor-pointer"
                    >
                      {isPromoActive ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-emerald-950/40 pt-2">
                    <span className="text-xs font-bold text-gray-200">Produto Mais Vendido (Best-Seller)</span>
                    <button
                      type="button"
                      onClick={() => setIsBestSeller(!isBestSeller)}
                      className="text-emerald-400 cursor-pointer"
                    >
                      {isBestSeller ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                    </button>
                  </div>
                </div>

                {/* STOCK CONTROL */}
                <div className="flex flex-col gap-2 p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-200">Controle de Estoque por Variação</span>
                      <span className="text-[9px] text-gray-400">Ative para gerenciar quantidades e cores específicas por variante</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setColorStockControl(!colorStockControl)}
                      className="text-emerald-400"
                    >
                      {colorStockControl ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                    </button>
                  </div>

                  {!colorStockControl ? (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                        Quantidade Total em Estoque
                      </label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        className="w-full bg-[#050c12] border border-emerald-950 text-white rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                          Adicionar Variações & Estoque Individual
                        </span>
                        <span className="text-[9px] text-emerald-400 font-semibold">
                          {colors.length} variação(ões)
                        </span>
                      </div>

                      {/* Add variation row with color button */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openColorPickerFor("new", newColorHex, newColorName)}
                          className="h-8 px-2 rounded-lg bg-[#050c12] border border-emerald-950 hover:border-emerald-500/50 text-gray-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                          title="Escolher cor da variação"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                            style={{
                              backgroundColor: newColorHex && newColorHex.trim() !== "" ? newColorHex : "#00e181",
                              boxShadow: newColorHex && newColorHex.trim() !== "" ? `0 0 6px ${newColorHex}60` : "0 0 6px rgba(0,225,129,0.5)"
                            }}
                          />
                          <Palette className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        <input
                          type="text"
                          placeholder="Nome da variação (ex: Preto, Tam M)"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddColor();
                            }
                          }}
                          className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="number"
                          placeholder="Qtd"
                          value={newColorQty}
                          onChange={(e) => setNewColorQty(Number(e.target.value))}
                          className="w-14 bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          +
                        </button>
                      </div>

                      {/* List of Variations */}
                      {colors.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          {colors.map((c, idx) => {
                            const dotColor = c.colorHex && c.colorHex.trim() !== "" ? c.colorHex : "#00e181";
                            const isCustomColor = Boolean(c.colorHex && c.colorHex.trim() !== "");

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs bg-[#050c12] p-2 rounded-xl border border-emerald-950/80 hover:border-emerald-900 transition-all"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {/* Clickable Color Button to change color */}
                                  <button
                                    type="button"
                                    onClick={() => openColorPickerFor(idx, c.colorHex || "", c.color)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#08121a] hover:bg-[#0c1a24] border border-emerald-950 hover:border-emerald-500/40 text-gray-300 text-[10px] font-bold transition-all cursor-pointer group shrink-0"
                                    title="Clique para escolher a cor"
                                  >
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0 transition-transform group-hover:scale-110"
                                      style={{
                                        backgroundColor: dotColor,
                                        boxShadow: isCustomColor ? `0 0 6px ${dotColor}60` : "0 0 6px rgba(0,225,129,0.5)"
                                      }}
                                    />
                                    <span className="text-[9px] text-gray-400 group-hover:text-emerald-300">
                                      {isCustomColor ? "Cor" : "Sem cor"}
                                    </span>
                                    <Palette className="w-2.5 h-2.5 text-emerald-400/70" />
                                  </button>

                                  <span className="text-gray-100 font-semibold truncate">{c.color}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                                    {c.stock} un
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColor(idx)}
                                    className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                                    title="Remover variação"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PHOTOS & VIDEOS MEDIA MANAGEMENT */}
                <div className="flex flex-col gap-4 p-3.5 bg-emerald-950/15 border border-emerald-800/40 rounded-2xl">
                  {/* PHOTOS SECTION */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] font-extrabold text-gray-200 uppercase tracking-wider">
                          Fotos do Produto (Galeria)
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                        {images.length} foto(s)
                      </span>
                    </div>

                    {/* Hidden file input for photos */}
                    <input
                      type="file"
                      ref={productPhotoInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    {/* Upload button area */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => productPhotoInputRef.current?.click()}
                        disabled={isUploadingPhotos}
                        className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm group active:scale-[0.98]"
                      >
                        <Upload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>{isUploadingPhotos ? "Carregando fotos..." : "Upload de Fotos (Arquivos)"}</span>
                      </button>

                      {/* Manual Image URL Input */}
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ou cole a URL da foto..."
                          value={newImageInput}
                          onChange={(e) => setNewImageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImage();
                            }
                          }}
                          className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-3 rounded-xl transition-all cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Photo Previews Grid */}
                    {images.length === 0 ? (
                      <div className="p-3 bg-[#050c12] border border-dashed border-emerald-950 rounded-xl text-center text-xs text-gray-500">
                        Nenhuma foto adicionada. Faça o upload ou adicione uma URL acima.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`group relative aspect-square rounded-xl overflow-hidden border bg-black shadow-md flex flex-col justify-between ${
                              idx === 0 ? "border-emerald-400 ring-2 ring-emerald-500/30" : "border-emerald-950/60"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Produto foto ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />

                            {/* Badge for Cover */}
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-md pointer-events-none">
                                Capa Principal
                              </span>
                            )}

                            {/* Controls Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-lg shadow transition-colors cursor-pointer"
                                  title="Remover foto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between bg-black/80 p-1 rounded-lg">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveImage(idx, "left")}
                                  className="text-gray-300 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-gray-300 cursor-pointer p-0.5"
                                  title="Mover para a esquerda"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-[9px] font-bold text-gray-300">
                                  #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  disabled={idx === images.length - 1}
                                  onClick={() => handleMoveImage(idx, "right")}
                                  className="text-gray-300 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-gray-300 cursor-pointer p-0.5"
                                  title="Mover para a direita"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DIVIDER */}
                  <div className="h-px bg-emerald-950/60" />

                  {/* VIDEOS SECTION */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] font-extrabold text-gray-200 uppercase tracking-wider">
                          Vídeos do Produto (Demonstrações & Reels)
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                        {videos.length} vídeo(s)
                      </span>
                    </div>

                    {/* Hidden file input for videos */}
                    <input
                      type="file"
                      ref={productVideoInputRef}
                      onChange={handleVideoUpload}
                      accept="video/*"
                      multiple
                      className="hidden"
                    />

                    {/* Upload button area */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => productVideoInputRef.current?.click()}
                        disabled={isUploadingVideos}
                        className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-teal-500/20 to-emerald-600/10 hover:from-teal-500/30 hover:to-emerald-600/20 border border-teal-500/40 hover:border-teal-400 text-teal-300 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm group active:scale-[0.98]"
                      >
                        <Film className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                        <span>{isUploadingVideos ? "Carregando vídeo..." : "Upload de Vídeo (MP4, WEBM)"}</span>
                      </button>

                      {/* Manual Video URL Input */}
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ou URL de vídeo (MP4, YouTube...)"
                          value={newVideoInput}
                          onChange={(e) => setNewVideoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddVideo();
                            }
                          }}
                          className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddVideo}
                          className="bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-bold text-xs px-3 rounded-xl transition-all cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Video Previews Grid */}
                    {videos.length === 0 ? (
                      <div className="p-3 bg-[#050c12] border border-dashed border-emerald-950 rounded-xl text-center text-xs text-gray-500">
                        Nenhum vídeo adicionado. Faça upload de arquivo MP4/WEBM ou adicione uma URL.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        {videos.map((vid, idx) => (
                          <div
                            key={idx}
                            className="group relative rounded-xl overflow-hidden border border-teal-900/60 bg-black shadow-md flex flex-col p-2 gap-2"
                          >
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#050c12]">
                              {vid.includes("youtube.com") || vid.includes("youtu.be") ? (
                                <iframe
                                  src={vid.replace("watch?v=", "embed/")}
                                  title={`Vídeo ${idx + 1}`}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={vid}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-950/60">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-teal-400 bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded-md">
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  Vídeo #{idx + 1}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveVideo(idx, "left")}
                                  className="p-1 text-gray-300 hover:text-teal-400 disabled:opacity-30 cursor-pointer"
                                  title="Mover para a esquerda"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === videos.length - 1}
                                  onClick={() => handleMoveVideo(idx, "right")}
                                  className="p-1 text-gray-300 hover:text-teal-400 disabled:opacity-30 cursor-pointer"
                                  title="Mover para a direita"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVideo(idx)}
                                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors cursor-pointer ml-1"
                                  title="Remover vídeo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* TECHNICAL SPECIFICATIONS BUILDER */}
                <div className="flex flex-col gap-2 p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    Ficha Técnica / Especificações
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Propriedade (ex: Sensor)"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Valor (ex: Óptico 12.000 DPI)"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="bg-emerald-500 text-black font-bold text-xs px-3 rounded-lg"
                    >
                      +
                    </button>
                  </div>

                  {specifications.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {specifications.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-[#050c12] p-1.5 rounded border border-emerald-950">
                          <span className="text-gray-400">{s.key}: <strong className="text-gray-200">{s.value}</strong></span>
                          <button type="button" onClick={() => handleRemoveSpec(idx)} className="text-rose-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* KEY HIGHLIGHT POINTS BUILDER */}
                <div className="flex flex-col gap-2 p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    Destaques / Recursos Importantes
                  </span>
                  <div className="flex gap-2 mb-1">
                    <select
                      value={newHighlightIcon}
                      onChange={(e) => setNewHighlightIcon(e.target.value)}
                      className="bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2 py-1 text-[11px]"
                    >
                      <option value="Target">Alta Precisão (Alvo)</option>
                      <option value="Feather">Design Ergonômico (Pena)</option>
                      <option value="Lightbulb">Iluminação (Lâmpada)</option>
                      <option value="Shield">Construção Durável (Escudo)</option>
                      <option value="Zap">Tempo de Resposta (Raio)</option>
                      <option value="Sparkles">Estilo / Efeitos (Brilho)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Ex: Alta Precisão"
                      value={newHighlightTitle}
                      onChange={(e) => setNewHighlightTitle(e.target.value)}
                      className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2.5 py-1 text-[11px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Sensor de 12.000 DPI para máximo controle"
                      value={newHighlightDesc}
                      onChange={(e) => setNewHighlightDesc(e.target.value)}
                      className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2.5 py-1.5 text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="bg-emerald-500 text-black font-bold text-[10px] px-3.5 rounded-lg"
                    >
                      Adicionar
                    </button>
                  </div>

                  {highlightPoints.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1.5">
                      {highlightPoints.map((hl, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] bg-[#050c12] p-1.5 rounded border border-emerald-950">
                          <div>
                            <span className="text-emerald-400 font-bold">{hl.title}</span>
                            <p className="text-[9px] text-gray-400">{hl.desc}</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveHighlight(idx)} className="text-rose-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SAVE AND CANCEL BUTTONS */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="w-full bg-[#0c1f2e]/50 border border-emerald-950 text-emerald-400 hover:text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#00e181] hover:bg-[#00c570] text-black font-black text-xs py-3 rounded-xl shadow-[0_3px_15px_rgba(0,225,129,0.2)] transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Produto</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* ================ CUSTOM CONFIRMATION MODAL =================== */}
      {/* ============================================================== */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ isOpen: false, type: "banner" })}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#08121a] border border-rose-500/40 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-10 flex flex-col gap-4"
            >
              {/* Header with Icon and Title */}
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white">
                    {confirmModal.type === "banner" 
                      ? "Excluir Banner?" 
                      : confirmModal.type === "product"
                      ? "Excluir Produto?"
                      : "Restaurar Banners Padrão?"}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                    {confirmModal.type === "reset-banners" 
                      ? "Os banners customizados serão substituídos pelos banners padrão do sistema."
                      : "Tem certeza de que deseja remover este item? Esta ação é definitiva e não poderá ser desfeita."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: false, type: "banner" })}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Item Thumbnail & Details */}
              {confirmModal.itemImage && (
                <div className="relative aspect-[3/1] w-full rounded-xl overflow-hidden bg-black border border-rose-950/60 shadow-inner">
                  <img 
                    src={confirmModal.itemImage} 
                    alt={confirmModal.itemTitle || "Prévia"} 
                    className="w-full h-full object-cover"
                  />
                  {confirmModal.itemTitle && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-1.5">
                      <span className="text-[11px] font-bold text-white truncate block">
                        {confirmModal.itemTitle}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: false, type: "banner" })}
                  className="w-full py-2.5 px-3 bg-[#0c1a24] hover:bg-[#122533] border border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-[0_3px_14px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmModal.type === "reset-banners" ? "Restaurar" : "Sim, Excluir"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* ============ VARIATION COLOR SELECTOR MODAL ================= */}
      {/* ============================================================== */}
      <AnimatePresence>
        {colorPickerModal && colorPickerModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setColorPickerModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#08121a] border border-emerald-500/40 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-10 flex flex-col gap-3.5 text-gray-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-emerald-950">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Cor da Variação
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      {colorPickerModal.variationName ? `Para: "${colorPickerModal.variationName}"` : "Escolha a cor para o cliente"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setColorPickerModal(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Preview */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050c12] border border-emerald-950">
                <span className="text-[11px] font-bold text-gray-300">Visão do Cliente:</span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-white/30 shadow-md shrink-0 transition-colors"
                    style={{
                      backgroundColor: customHexInput.trim() !== "" ? customHexInput : "#00e181",
                      boxShadow: customHexInput.trim() !== "" ? `0 0 8px ${customHexInput}70` : "0 0 8px rgba(0,225,129,0.6)"
                    }}
                  />
                  <span className="text-xs font-extrabold text-white">
                    {customHexInput.trim() !== "" ? customHexInput : "Bolinha Verde (Padrão)"}
                  </span>
                </div>
              </div>

              {/* Preset Palette Grid */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                  Paleta de Cores Prontas
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_VARIATION_COLORS.map((preset, pIdx) => {
                    const isCurrent =
                      (preset.hex === "" && (!customHexInput || customHexInput === "")) ||
                      (preset.hex !== "" && customHexInput.toLowerCase() === preset.hex.toLowerCase());

                    return (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setCustomHexInput(preset.hex);
                          handleSelectVariationColor(preset.hex, preset.name.replace(/ \(.*\)/, ""));
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            : "bg-[#060e15] border-emerald-950/60 text-gray-300 hover:border-emerald-800 hover:bg-[#0c1a24]"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-sm"
                          style={{
                            backgroundColor: preset.preview,
                            boxShadow: `0 0 5px ${preset.preview}40`
                          }}
                        />
                        <span className="text-[10px] font-bold truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Picker Input */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-emerald-950">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                  Ou escolha uma cor personalizada:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customHexInput && customHexInput.startsWith("#") ? customHexInput : "#10b981"}
                    onChange={(e) => setCustomHexInput(e.target.value)}
                    className="w-10 h-9 rounded-lg bg-transparent border border-emerald-950 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    placeholder="#HEX (ex: #FF0055)"
                    value={customHexInput}
                    onChange={(e) => setCustomHexInput(e.target.value)}
                    className="flex-1 bg-[#050c12] border border-emerald-950 text-white rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectVariationColor(customHexInput)}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-emerald-950/60">
                <button
                  type="button"
                  onClick={() => handleSelectVariationColor("")}
                  className="text-[10px] text-gray-400 hover:text-emerald-400 font-bold cursor-pointer underline decoration-dotted"
                >
                  Sem cor (Padrão Verde)
                </button>
                <button
                  type="button"
                  onClick={() => setColorPickerModal(null)}
                  className="px-3 py-1.5 bg-[#050c12] hover:bg-gray-800 text-gray-300 text-xs font-bold rounded-lg border border-gray-800 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ADMIN PHONE MODEL SELECTION MODAL */}
        {isModelModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#07111b] border border-emerald-500/40 rounded-2xl w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Passo {modelModalStep} de 2
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      ({compatibleModels.length}/5 selecionados)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {modelModalStep === 1 
                      ? "Escolha a Marca do Smartphone" 
                      : `Escolha os Modelos (${modelModalBrand})`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modelModalStep === 1 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] text-gray-400">
                    Selecione a marca para visualizar os modelos disponíveis para vincular a esta capa ou película:
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PHONE_BRANDS.map((brand) => {
                      const isBrandSelected = modelModalBrand === brand;
                      const brandModels = PHONE_MODELS[brand] || [];
                      const addedCountFromBrand = brandModels.filter((m) => compatibleModels.includes(m)).length;

                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => {
                            setModelModalBrand(brand);
                            setModelModalStep(2);
                            setModelSearchQuery("");
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between group ${
                            isBrandSelected
                              ? "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20"
                              : "bg-[#0b1620] text-gray-200 border-emerald-950 hover:border-emerald-500/50 hover:bg-[#0e1d2a]"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-extrabold group-hover:text-emerald-300 transition-colors">
                              {brand}
                            </span>
                            {addedCountFromBrand > 0 && (
                              <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">
                                {addedCountFromBrand} já adicionado{addedCountFromBrand > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-300" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Brand tabs bar for quick switching */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-emerald-950/60">
                    {PHONE_BRANDS.map((brand) => {
                      const brandCount = (PHONE_MODELS[brand] || []).filter((m) => compatibleModels.includes(m)).length;
                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => {
                            setModelModalBrand(brand);
                            setModelSearchQuery("");
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                            modelModalBrand === brand
                              ? "bg-emerald-500 text-black font-black"
                              : "bg-[#08121a] text-gray-400 hover:text-white"
                          }`}
                        >
                          <span>{brand}</span>
                          {brandCount > 0 && (
                            <span className={`text-[8px] px-1 py-0.2 rounded-full ${
                              modelModalBrand === brand ? "bg-black/30 text-black font-black" : "bg-emerald-500/20 text-emerald-300"
                            }`}>
                              {brandCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search model in brand */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={`Buscar modelo ${modelModalBrand}...`}
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                      className="w-full bg-[#08121a] border border-emerald-950 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    {modelSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setModelSearchQuery("")}
                        className="absolute right-2.5 top-1.5 text-xs text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Models Grid */}
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {((PHONE_MODELS[modelModalBrand] || []).filter((m) =>
                      m.toLowerCase().includes(modelSearchQuery.toLowerCase())
                    )).map((model) => {
                      const isAlreadySelected = compatibleModels.includes(model);
                      const isMaxReached = compatibleModels.length >= 5 && !isAlreadySelected;

                      return (
                        <button
                          key={model}
                          type="button"
                          disabled={isMaxReached}
                          onClick={() => {
                            if (isAlreadySelected) {
                              setCompatibleModels(compatibleModels.filter((m) => m !== model));
                            } else if (compatibleModels.length < 5) {
                              setCompatibleModels([...compatibleModels, model]);
                            }
                          }}
                          className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                            isAlreadySelected
                              ? "bg-emerald-500 text-black border-emerald-400 shadow-xs font-black"
                              : isMaxReached
                              ? "bg-[#08121a]/40 text-gray-600 border-gray-900 cursor-not-allowed"
                              : "bg-[#0b1620] text-gray-200 border-emerald-950 hover:border-emerald-500/40 hover:bg-[#0e1d2a]"
                          }`}
                        >
                          <span className="truncate">{model}</span>
                          {isAlreadySelected ? (
                            <span className="text-xs font-black">✓</span>
                          ) : isMaxReached ? (
                            <span className="text-[8px] opacity-40">Máx</span>
                          ) : (
                            <span className="text-[10px] opacity-40 group-hover:opacity-100">+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Models Summary in Modal */}
                  {compatibleModels.length > 0 && (
                    <div className="p-2 rounded-xl bg-[#060c14] border border-emerald-950/60 flex flex-col gap-1">
                      <span className="text-[9px] font-extrabold text-emerald-400 uppercase">
                        Selecionados ({compatibleModels.length}/5):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {compatibleModels.map((m, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800"
                          >
                            {m}
                            <button
                              type="button"
                              onClick={() => setCompatibleModels(compatibleModels.filter((_, i) => i !== idx))}
                              className="hover:text-white ml-0.5 cursor-pointer font-black"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation and Conclude Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-950/60">
                    <button
                      type="button"
                      onClick={() => setModelModalStep(1)}
                      className="px-3 py-2 rounded-xl bg-[#0b1620] border border-emerald-950 text-gray-300 text-xs font-bold hover:text-white cursor-pointer"
                    >
                      ← Escolher Marca
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModelModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      Concluir ({compatibleModels.length}/5) ✓
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
