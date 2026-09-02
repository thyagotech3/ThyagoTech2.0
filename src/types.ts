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


export interface SaleItem {
  productId: string;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  selectedColor?: string;
  total: number;
}

export interface Sale {
  id: string;
  clientName: string;
  clientPhone: string;
  consultantName?: string; // Consultant / Seller who registered the sale
  deliveryType: "entrega" | "retirada";
  deliveryAddress?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    city?: string;
  };
  deliveryFee?: number;
  pickupLocation?: string;
  deliveryDate: string; // YYYY-MM-DD
  preparationTime?: string; // Estimated preparation time defined at sale time (e.g. "Hoje até 17h", "1 dia útil", "Pronta Entrega")
  estimatedDelivery?: string;
  items: SaleItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod: "pix" | "dinheiro" | "cartao_credito" | "cartao_debito" | "transferencia" | string;
  paymentStatus: "pago" | "na_entrega" | "a_prazo";
  dueDate?: string; // YYYY-MM-DD if a_prazo
  notes?: string;
  createdAt: string; // ISO string
  status: "concluida" | "cancelada";
  orderStatus?: "aguardando_validacao" | "preparando" | "entregue" | "cancelado";
  orderStatusHistory?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}
