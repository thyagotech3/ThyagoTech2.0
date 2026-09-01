export interface ColorStock {
  color: string;
  stock: number;
  colorHex?: string; // Optional HEX color (e.g. #000000, #FF0000). If omitted/empty, client displays standard green dot
}

export interface Specification {
  key: string;
  value: string;
}

export interface HighlightPoint {
  icon: string; // lucide icon name
  title: string;
  desc: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  categories?: string[];
  price: number;
  originalPrice: number;
  isPromoActive: boolean;
  images: string[];
  videos?: string[];
  stock: number;
  showStock: boolean;
  colorStockControl: boolean;
  colors: ColorStock[];
  specifications: Specification[];
  highlightPoints: HighlightPoint[];
  isBestSeller: boolean;
  compatibleModels?: string[]; // Up to 5 compatible phone models (for Capas and Películas)
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface BannerItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  linkGroup?: "Todos" | "Celular" | "Pc" | "Videogame";
  linkFilter?: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeTagline?: string;
  logoUrl?: string;
  logoZoom?: number; // Zoom level in percentage (e.g. 50% to 300%)
  logoFit?: "cover" | "contain";
  whatsappNumber: string;
  businessHours?: string;
  instagramHandle?: string;
  pixKey?: string;
  deliveryInfo?: string;
  address?: string;
  promoBannerUrl?: string; // Legacy string banner
  promoBanners?: BannerItem[]; // Array for Banner 2 carousel
}

export const defaultStoreSettings: StoreSettings = {
  storeName: "Thyago Tech",
  storeTagline: "Tecnologia & Acessórios",
  logoUrl: "",
  logoZoom: 100,
  logoFit: "cover",
  whatsappNumber: "5581997073882",
  businessHours: "Seg à Sáb: 08h às 18h",
  instagramHandle: "thyagotech",
  pixKey: "81997073882",
  deliveryInfo: "Entrega rápida para toda a região via motoboy ou Correios",
  address: "Recife, PE",
  promoBannerUrl: "",
  promoBanners: []
};
