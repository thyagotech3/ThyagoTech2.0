import { Product } from "./types";

export const initialProducts: Product[] = [
  // --- PC PRODUCTS ---
  {
    id: "quantum-vector-mouse",
    name: "Quantum Vector Mouse",
    description: "Desempenho e precisão para elevar o seu jogo. Design ergonômico e tecnologia de última geração. Equipado com cabo ultra flexível e grips laterais emborrachados para máxima aderência durante as partidas.",
    category: "Mouse",
    price: 59.99,
    originalPrice: 79.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/quantum_vector_mouse_1788183228777.jpg"
    ],
    videos: [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    ],
    stock: 15,
    showStock: true,
    colorStockControl: true,
    colors: [
      { color: "Verde Neon", stock: 8, colorHex: "#10B981" },
      { color: "Preto Fosco", stock: 7, colorHex: "#121212" }
    ],
    specifications: [
      { key: "Sensor", value: "Óptico 12.000 DPI" },
      { key: "Conexão", value: "USB 2.0 (Com fio)" },
      { key: "Botões", value: "6 botões programáveis" }
    ],
    highlightPoints: [
      { icon: "Target", title: "Alta precisão", desc: "Sensor óptico de 12.000 DPI" }
    ],
    isBestSeller: true
  },
  {
    id: "precision-glide-mat",
    name: "Precision Glide Mat XXL",
    description: "Superfície de tecido micro-texturizado para máximo controle e precisão. Bordas com costura reforçada e iluminação LED neon integrada.",
    category: "Mouse",
    price: 34.99,
    originalPrice: 49.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/precision_glide_mat_1788183241988.jpg"
    ],
    stock: 25,
    showStock: true,
    colorStockControl: false,
    colors: [],
    specifications: [
      { key: "Dimensões", value: "900 x 400 x 4mm" }
    ],
    highlightPoints: [
      { icon: "Maximize", title: "Espaço XXL", desc: "900x400mm" }
    ],
    isBestSeller: false
  },
  {
    id: "nebula-tkl-keyboard",
    name: "Nebula TKL Keyboard",
    description: "Teclado mecânico compacto tenkeyless com switches mecânicos de alta velocidade e chassi de alumínio reforçado.",
    category: "Teclado",
    price: 199.99,
    originalPrice: 249.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/nebula_tkl_keyboard_1788183265944.jpg"
    ],
    stock: 8,
    showStock: true,
    colorStockControl: false,
    colors: [],
    specifications: [
      { key: "Layout", value: "ABNT2 compacto TKL" }
    ],
    highlightPoints: [
      { icon: "Keyboard", title: "Switches de Elite", desc: "Durabilidade máxima" }
    ],
    isBestSeller: false
  },
  {
    id: "thunder-pro-headset",
    name: "Thunder Pro Headset",
    description: "Som surround de alta fidelidade para imersão total em jogos. Almofadas de espuma memory foam para conforto duradouro.",
    category: "Headset",
    price: 129.99,
    originalPrice: 179.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/thunder_pro_headset_1788183254154.jpg"
    ],
    stock: 12,
    showStock: true,
    colorStockControl: true,
    colors: [
      { color: "Preto", stock: 6 },
      { color: "Cinza", stock: 6 }
    ],
    specifications: [
      { key: "Áudio", value: "7.1 Surround Virtual" }
    ],
    highlightPoints: [
      { icon: "Volume2", title: "Som Imersivo", desc: "Surround 7.1" }
    ],
    isBestSeller: false
  },

  // --- CELULAR PRODUCTS ---
  {
    id: "capa-magsafe-carbon",
    name: "Capa MagSafe Fibra de Carbono",
    description: "Proteção ultra resistente com acabamento premium em fibra de carbono e alinhamento magnético perfeito.",
    category: "Capas",
    price: 24.99,
    originalPrice: 39.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/celular_banner_1788185867079.jpg"
    ],
    stock: 30,
    showStock: true,
    colorStockControl: true,
    colors: [
      { color: "Preto Carbono", stock: 20 },
      { color: "Verde Militar", stock: 10 }
    ],
    specifications: [
      { key: "Material", value: "Fibra de Carbono / TPU" },
      { key: "Compatibilidade", value: "MagSafe" }
    ],
    highlightPoints: [
      { icon: "Shield", title: "Ultra Resistente", desc: "Proteção contra quedas de até 3 metros" }
    ],
    isBestSeller: true
  },
  {
    id: "pelicula-vidro-privacidade",
    name: "Película de Vidro Privacidade 3D",
    description: "Proteja sua tela e sua privacidade contra olhares curiosos com tecnologia de filtro de ângulo de visão.",
    category: "películas",
    price: 14.99,
    originalPrice: 19.99,
    isPromoActive: false,
    images: [
      "/src/assets/images/celular_banner_1788185867079.jpg"
    ],
    stock: 50,
    showStock: false,
    colorStockControl: false,
    colors: [],
    specifications: [
      { key: "Dureza", value: "9H Temperado" },
      { key: "Filtro", value: "Privacidade 30 Graus" }
    ],
    highlightPoints: [
      { icon: "Eye", title: "Filtro Anti-Espião", desc: "Privacidade garantida para o seu visor" }
    ],
    isBestSeller: false
  },
  {
    id: "auriculares-pro-buds",
    name: "Fones Bluetooth Pro Buds",
    description: "Cancelamento ativo de ruído inteligente, graves profundos e até 30 horas de autonomia total com estojo.",
    category: "Fones",
    price: 79.99,
    originalPrice: 119.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/thunder_pro_headset_1788183254154.jpg"
    ],
    stock: 20,
    showStock: true,
    colorStockControl: false,
    colors: [],
    specifications: [
      { key: "Bluetooth", value: "v5.3" },
      { key: "Bateria", value: "Até 30h com estojo" }
    ],
    highlightPoints: [
      { icon: "Mic", title: "Voz Cristalina", desc: "Microfones beamforming integrados" }
    ],
    isBestSeller: true
  },
  {
    id: "carregador-gan-65w",
    name: "Carregador Turbo GaN 65W Duo",
    description: "Tecnologia de nitreto de gálio (GaN) para carregamento ultra veloz, seguro e compacto de celulares e notebooks.",
    category: "Carregadores",
    price: 39.99,
    originalPrice: 59.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/focus_1080p_webcam_1788183282221.jpg"
    ],
    stock: 15,
    showStock: true,
    colorStockControl: false,
    colors: [],
    specifications: [
      { key: "Potência", value: "65W Máximo" },
      { key: "Portas", value: "1x USB-C + 1x USB-A" }
    ],
    highlightPoints: [
      { icon: "Zap", title: "Carregamento Rápido", desc: "De 0% a 50% em apenas 25 minutos" }
    ],
    isBestSeller: false
  },
  {
    id: "cabo-kevlar-usb-c",
    name: "Cabo Kevlar USB-C para USB-C 2m",
    description: "Construído com fibra de Kevlar balístico ultra reforçado. Suporta fornecimento de energia de até 100W.",
    category: "Cabos",
    price: 19.99,
    originalPrice: 29.99,
    isPromoActive: false,
    images: [
      "/src/assets/images/precision_glide_mat_1788183241988.jpg"
    ],
    stock: 40,
    showStock: true,
    colorStockControl: false,
    colors: [],
    specifications: [
      { key: "Comprimento", value: "2 metros" },
      { key: "Potência Suportada", value: "100W Power Delivery" }
    ],
    highlightPoints: [
      { icon: "Shield", title: "Inquebrável", desc: "Suporta mais de 50.000 dobras sem quebrar" }
    ],
    isBestSeller: false
  },

  // --- MAIS / OUTRAS PRODUCTS ---
  {
    id: "console-retro-pocket",
    name: "Console Retrô Pocket Slim",
    description: "Jogue milhares de clássicos onde quiser com tela IPS de alta definição de 3.5 polegadas e bateria de longa duração.",
    category: "Videogames",
    price: 89.99,
    originalPrice: 129.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/quantum_vector_mouse_1788183228777.jpg"
    ],
    stock: 10,
    showStock: true,
    colorStockControl: false,
    colors: [],
    specifications: [
      { key: "Jogos", value: "Mais de 15.000 inclusos" },
      { key: "Tela", value: "3.5\" IPS HD" }
    ],
    highlightPoints: [
      { icon: "Sparkles", title: "Consoles Suportados", desc: "PS1, N64, GBA, Arcade e mais" }
    ],
    isBestSeller: true
  },
  {
    id: "camiseta-thyago-tech-cyber",
    name: "Camiseta Premium Cyber Neon",
    description: "Tecido 100% algodão egípcio peletizado, estampa neon cyberpunk de altíssima durabilidade e conforto inigualável.",
    category: "Camisetas (Novo)",
    price: 29.99,
    originalPrice: 39.99,
    isPromoActive: false,
    images: [
      "/src/assets/images/thyago_tech_banner_1788185051955.jpg"
    ],
    stock: 25,
    showStock: true,
    colorStockControl: true,
    colors: [
      { color: "Preto", stock: 15 },
      { color: "Verde Neon", stock: 10 }
    ],
    specifications: [
      { key: "Material", value: "100% Algodão Premium" },
      { key: "Modelagem", value: "Oversized unissex" }
    ],
    highlightPoints: [
      { icon: "Shirt", title: "Ajuste Perfeito", desc: "Extremamente confortável e estilosa" }
    ],
    isBestSeller: false
  },
  {
    id: "tenis-stealth-runner",
    name: "Tênis Sneaker Stealth Runner Neon",
    description: "Amortecimento responsivo de última geração, detalhes refletivos neon e palmilha ergonômica respirável.",
    category: "Tênis (Novo)",
    price: 119.99,
    originalPrice: 159.99,
    isPromoActive: true,
    images: [
      "/src/assets/images/celular_banner_1788185867079.jpg"
    ],
    stock: 8,
    showStock: true,
    colorStockControl: true,
    colors: [
      { color: "Verde Cyber / Preto", stock: 5 },
      { color: "Preto Absoluto", stock: 3 }
    ],
    specifications: [
      { key: "Amortecimento", value: "Tecnologia Cyber-Boost" },
      { key: "Peso", value: "290g" }
    ],
    highlightPoints: [
      { icon: "Zap", title: "Lançamento Exclusivo", desc: "Série limitada e ultra numerada" }
    ],
    isBestSeller: true
  }
];
