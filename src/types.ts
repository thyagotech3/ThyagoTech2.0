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
