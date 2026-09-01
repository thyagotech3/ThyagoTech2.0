// Centralized Phone Brands and Models data
export const PHONE_BRANDS = ["Apple", "Samsung", "Xiaomi", "Motorola"] as const;

export type PhoneBrand = typeof PHONE_BRANDS[number];

export const PHONE_MODELS: Record<string, string[]> = {
  "Apple": [
    "iPhone 11",
    "iPhone 12",
    "iPhone 12 Pro",
    "iPhone 13",
    "iPhone 13 Pro",
    "iPhone 13 Pro Max",
    "iPhone 14",
    "iPhone 14 Plus",
    "iPhone 14 Pro",
    "iPhone 14 Pro Max",
    "iPhone 15",
    "iPhone 15 Plus",
    "iPhone 15 Pro",
    "iPhone 15 Pro Max",
    "iPhone 16",
    "iPhone 16 Plus",
    "iPhone 16 Pro",
    "iPhone 16 Pro Max"
  ],
  "Samsung": [
    "Galaxy S23",
    "Galaxy S23 Plus",
    "Galaxy S23 Ultra",
    "Galaxy S24",
    "Galaxy S24 Plus",
    "Galaxy S24 Ultra",
    "Galaxy A15",
    "Galaxy A34",
    "Galaxy A54",
    "Galaxy A55",
    "Galaxy Z Flip 5"
  ],
  "Xiaomi": [
    "Redmi Note 12",
    "Redmi Note 13",
    "Redmi Note 13 Pro",
    "Pocophone X6",
    "Pocophone X6 Pro",
    "Xiaomi 13",
    "Xiaomi 14"
  ],
  "Motorola": [
    "Moto G54",
    "Moto G84",
    "Moto G24",
    "Edge 40",
    "Edge 40 Neo",
    "Edge 50 Pro",
    "Edge 50 Ultra"
  ]
};

/**
 * Checks if a list of product categories corresponds to Capas or Películas.
 */
export function isPhoneModelCategory(categories: string[]): boolean {
  if (!categories || categories.length === 0) return false;
  return categories.some((c) => {
    const norm = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return norm === "capas" || norm === "capa" || norm === "peliculas" || norm === "pelicula";
  });
}
