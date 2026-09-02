import React, { useState } from "react";
import { 
  ArrowLeft, Heart, ShoppingCart, MessageCircle, 
  ChevronRight, Sparkles, AlertTriangle, Check, Shield, 
  Target, Feather, Lightbulb, Maximize, Palette, Volume2, 
  Mic, Zap, Video, Eye, Keyboard, Play, Film, Smartphone,
  Tag, Laptop, Gamepad2, Layers
} from "lucide-react";
import { Product, StoreSettings } from "../types";

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onNavigateToProduct: (productId: string) => void;
  onNavigateToCategory?: (options: {
    group?: "Todos" | "Celular" | "Pc" | "Videogame";
    filter?: string;
    brand?: string;
    model?: string;
  }) => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  storeSettings?: StoreSettings;
}

// Map string icon names to Lucide icon components dynamically
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Target,
  Feather,
  Lightbulb,
  Maximize,
  Palette,
  Volume2,
  Mic,
  Sparkles,
  Shield,
  Zap,
  Video,
  Eye,
  Keyboard
};

export interface ProductTagItem {
  id: string;
  label: string;
  type: "group" | "category" | "model";
  group?: "Todos" | "Celular" | "Pc" | "Videogame";
  filter?: string;
  model?: string;
}

/**
 * Extracts strictly selected and existing tags for this product:
 * 1. Selected device group (Celular, PC, Videogames)
 * 2. Selected categories (Capas, Películas, Carregadores, Mouse, etc.)
 * 3. Selected compatible phone models (if any)
 */
function extractProductTags(p: Product): ProductTagItem[] {
  const tags: ProductTagItem[] = [];
  const addedKeys = new Set<string>();

  const addTag = (tag: ProductTagItem) => {
    const key = `${tag.type}-${tag.label.toLowerCase().trim()}`;
    if (!addedKeys.has(key) && tag.label.trim()) {
      addedKeys.add(key);
      tags.push(tag);
    }
  };

  const pCats = (p.categories && p.categories.length > 0 ? p.categories : [p.category]).filter(Boolean);

  // 1. Device Group (Celular, Pc, Videogames)
  const hasCelularGroup = pCats.some((c) => c.toLowerCase() === "celular");
  const hasPcGroup = pCats.some((c) => c.toLowerCase() === "pc");
  const hasVideoGameGroup = pCats.some((c) => c.toLowerCase() === "videogames" || c.toLowerCase() === "videogame");

  const isCelularCategory = pCats.some((c) => ["capas", "peliculas", "películas", "fones", "carregadores", "cabos"].includes(c.toLowerCase()));
  const isPcCategory = pCats.some((c) => ["mouse", "teclado", "headset", "fone"].includes(c.toLowerCase()));
  const isVideogameCategory = pCats.some((c) => ["camisetas (novo)", "tênis (novo)", "tenis (novo)"].includes(c.toLowerCase()));

  if (hasCelularGroup || (!hasPcGroup && !hasVideoGameGroup && isCelularCategory)) {
    addTag({
      id: "group-celular",
      label: "Celular",
      type: "group",
      group: "Celular",
      filter: "Todos"
    });
  } else if (hasPcGroup || (!hasCelularGroup && !hasVideoGameGroup && isPcCategory)) {
    addTag({
      id: "group-pc",
      label: "PC",
      type: "group",
      group: "Pc",
      filter: "Todos"
    });
  } else if (hasVideoGameGroup || isVideogameCategory) {
    addTag({
      id: "group-videogame",
      label: "Videogames",
      type: "group",
      group: "Videogame",
      filter: "Todos"
    });
  }

  // 2. Specific Selected Categories on Product
  pCats.forEach((cat) => {
    const raw = cat.trim();
    const cLower = raw.toLowerCase();
    
    // Skip general group names if already added
    if (cLower === "celular" || cLower === "pc" || cLower === "videogames" || cLower === "videogame") {
      return;
    }

    let targetGroup: "Todos" | "Celular" | "Pc" | "Videogame" = "Todos";
    let targetFilter = raw;

    if (["capas", "peliculas", "películas", "fones", "carregadores", "cabos"].includes(cLower)) {
      targetGroup = "Celular";
      if (cLower === "capas") targetFilter = "Capas";
      else if (cLower === "peliculas" || cLower === "películas") targetFilter = "películas";
      else if (cLower === "carregadores") targetFilter = "Carregadores";
      else if (cLower === "cabos") targetFilter = "Cabos";
      else if (cLower === "fones") targetFilter = "Fones";
    } else if (["mouse", "teclado", "headset", "fone"].includes(cLower)) {
      targetGroup = "Pc";
      if (cLower === "mouse") targetFilter = "Mouse";
      else if (cLower === "teclado") targetFilter = "Teclado";
      else if (cLower === "headset") targetFilter = "Headset";
      else if (cLower === "fone") targetFilter = "Fone";
    } else if (["camisetas (novo)", "tênis (novo)", "tenis (novo)"].includes(cLower)) {
      targetGroup = "Videogame";
    }

    addTag({
      id: `cat-${raw}`,
      label: raw,
      type: "category",
      group: targetGroup,
      filter: targetFilter
    });
  });

  // 3. Compatible Phone Models if assigned to the product
  if (p.compatibleModels && Array.isArray(p.compatibleModels) && p.compatibleModels.length > 0) {
    const primaryCat = pCats.find((c) => ["capas", "peliculas", "películas"].includes(c.toLowerCase())) || "Capas";
    const filterCat = primaryCat.toLowerCase().includes("pelic") ? "películas" : "Capas";

    p.compatibleModels.forEach((model) => {
      if (model && model.trim()) {
        addTag({
          id: `model-${model.trim()}`,
          label: model.trim(),
          type: "model",
          group: "Celular",
          filter: filterCat,
          model: model.trim()
        });
      }
    });
  }

  return tags;
}

export default function ProductDetail({ 
  product, 
  allProducts, 
  onBack, 
  onNavigateToProduct, 
  onNavigateToCategory,
  onAddToCart,
  storeSettings
}: ProductDetailProps) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colorStockControl && product.colors.length > 0 ? product.colors[0].color : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // Extract all tag cards for this product
  const productTags = extractProductTags(product);

  // Combine images and videos for full interactive gallery
  const mediaList: { type: "image" | "video"; src: string }[] = [
    ...(product.images && product.images.length > 0
      ? product.images.map((src) => ({ type: "image" as const, src }))
      : [{ type: "image" as const, src: "https://images.unsplash.com/photo-1527698266440-12104e498b76?w=600" }]),
    ...(product.videos && product.videos.length > 0
      ? product.videos.map((src) => ({ type: "video" as const, src }))
      : [])
  ];

  const currentMedia = mediaList[activeMediaIdx] || mediaList[0];

  // Format currency
  const formatPrice = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  // WhatsApp order URL generation
  const handleWhatsAppOrder = () => {
    let rawPhone = storeSettings?.whatsappNumber ? storeSettings.whatsappNumber.replace(/\D/g, "") : "5581997073882";
    if (rawPhone.length === 10 || rawPhone.length === 11) {
      rawPhone = `55${rawPhone}`;
    }
    const phoneNumber = rawPhone;
    const storeName = storeSettings?.storeName || "Thyago Tech";
    const colorText = selectedColor ? `\n🎨 *Variação:* ${selectedColor}` : "";
    const promoText = product.isPromoActive ? ` (De ${formatPrice(product.originalPrice)} por ${formatPrice(product.price)})` : "";
    
    const message = `Olá! Vi o produto *${product.name}* no site *${storeName}* e gostaria de encomendá-lo!
    
🛒 *Produto:* ${product.name}
🏷️ *Preço:* ${formatPrice(product.price)}${promoText}${colorText}
📦 *Quantidade:* ${quantity}
    
Por favor, me confirme a disponibilidade!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  // Filter related products (same category or general)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Get current stock for selected color or total stock
  const currentStock = product.colorStockControl
    ? product.colors.find((c) => c.color === selectedColor)?.stock || 0
    : product.stock;

  return (
    <div className="min-h-screen bg-[#05090f] pb-16 text-gray-100">
      {/* Navigation Breadcrumb & Back Bar */}
      <div className="px-4 py-3 bg-[#070c14] border-b border-emerald-950/20 flex items-center justify-between sticky top-[61px] z-20">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à vitrine</span>
        </button>

        <div className="hidden xs:flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className="hover:text-emerald-400 transition-colors cursor-pointer" onClick={onBack}>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-emerald-400 transition-colors cursor-pointer">{product.categories && product.categories.length > 0 ? product.categories.join(" • ") : product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300 font-bold truncate max-w-[100px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 pt-4 flex flex-col gap-6">
        {/* Breadcrumb path for Mobile & Desktop */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
          <span className="hover:text-emerald-400 cursor-pointer" onClick={onBack}>Home</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span 
            className="hover:text-emerald-300 cursor-pointer"
            onClick={() => {
              const primary = product.categories && product.categories.length > 0 ? product.categories[0] : product.category;
              if (onNavigateToCategory && primary) {
                onNavigateToCategory({ filter: primary });
              } else {
                onBack();
              }
            }}
          >
            {product.categories && product.categories.length > 0 ? product.categories.join(" • ") : product.category}
          </span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-emerald-400 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Responsive 2-Column Product Detail Layout (1 col mobile, 2 cols on md+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Media Stage, Gallery & Highlights */}
          <div className="flex flex-col gap-4">
            {/* PRODUCT TAGS / MINI-CARDS ROW (ABOVE THE PHOTO) */}
            {productTags.length > 0 && (
              <div 
                id="product-tags-row"
                className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-wrap"
              >
                {productTags.map((tag) => {
                  let bgClass = "bg-[#091522] border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/80 hover:border-emerald-400 hover:text-white";
                  let IconComponent = Tag;

                  if (tag.type === "group") {
                    bgClass = "bg-[#06181e] border-teal-500/40 text-teal-300 hover:bg-teal-950/80 hover:border-teal-400 hover:text-teal-100";
                    IconComponent = tag.label === "Celular" ? Smartphone : tag.label === "PC" ? Laptop : tag.label === "Videogames" ? Gamepad2 : Layers;
                  } else if (tag.type === "model") {
                    bgClass = "bg-[#071d18] border-emerald-400/50 text-emerald-200 font-bold hover:bg-emerald-900/90 hover:border-emerald-300 hover:text-white";
                    IconComponent = Smartphone;
                  } else if (tag.type === "category") {
                    bgClass = "bg-[#0a1724] border-emerald-500/35 text-emerald-300 hover:bg-[#0f2538] hover:border-emerald-400 hover:text-white";
                    IconComponent = Tag;
                  }

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (onNavigateToCategory) {
                          onNavigateToCategory({
                            group: tag.group,
                            filter: tag.filter,
                            model: tag.model
                          });
                        } else if (onBack) {
                          onBack();
                        }
                      }}
                      title={`Filtrar vitrine por "${tag.label}"`}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9.5px] font-bold tracking-tight shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer select-none group ${bgClass}`}
                    >
                      <IconComponent className="w-2.5 h-2.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="whitespace-nowrap">{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Product Media Stage Card (Photos and Videos) */}
            <div className="relative rounded-2xl border border-emerald-950/40 bg-[#091520]/80 p-3 overflow-hidden shadow-lg">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#060c12] flex items-center justify-center">
                {currentMedia.type === "video" ? (
                  currentMedia.src.includes("youtube.com") || currentMedia.src.includes("youtu.be") ? (
                    <iframe 
                      src={currentMedia.src.replace("watch?v=", "embed/")} 
                      title={product.name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      key={currentMedia.src}
                      src={currentMedia.src} 
                      controls 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-contain bg-black"
                    />
                  )
                ) : (
                  <img 
                    src={currentMedia.src} 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                )}

                {/* Badges on main media */}
                {product.isBestSeller && (
                  <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-emerald-500/95 text-[#070b11] text-[10px] font-extrabold px-2 py-1 rounded-lg shadow-[0_2px_10px_rgba(16,185,129,0.3)] z-10 pointer-events-none">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    Mais vendido
                  </span>
                )}

                {/* Video badge if current media is video */}
                {currentMedia.type === "video" && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-teal-500/90 text-black text-[10px] font-extrabold px-2 py-1 rounded-lg shadow z-10 pointer-events-none">
                    <Play className="w-3 h-3 fill-current" />
                    Vídeo / Demonstração
                  </span>
                )}

                {/* Favorite Top Right */}
                <button 
                  onClick={() => setLiked(!liked)}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-[#070b11]/70 backdrop-blur-md border border-white/5 text-gray-300 hover:text-rose-500 transition-colors shadow z-10 cursor-pointer"
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>

              {/* Interactive Thumbnails Slider Grid (Photos & Videos) */}
              {mediaList.length > 1 && (
                <div className="flex items-center gap-2 mt-3.5 px-1 overflow-x-auto scrollbar-none">
                  {mediaList.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIdx(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 bg-black ${
                        idx === activeMediaIdx ? "border-[#00e181] scale-95 shadow-[0_0_8px_rgba(0,225,129,0.4)]" : "border-emerald-950/40 hover:border-emerald-800/40 opacity-75 hover:opacity-100"
                      }`}
                    >
                      {m.type === "video" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-950 to-[#060c12] text-teal-400">
                          <Play className="w-4 h-4 fill-teal-400" />
                          <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5 text-teal-300">Vídeo</span>
                        </div>
                      ) : (
                        <img src={m.src} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Feature/Highlights Points Row */}
            {product.highlightPoints.length > 0 && (
              <div className="grid grid-cols-1 gap-3.5 border-t border-emerald-950/20 pt-4">
                {product.highlightPoints.map((item, idx) => {
                  const DynamicIcon = IconMap[item.icon] || Sparkles;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 mt-0.5">
                        <DynamicIcon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Title, Pricing, Variations, Specs & Action CTAs */}
          <div className="flex flex-col gap-4">
            {/* Product Meta Header Information */}
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-1">
                {product.description}
              </p>
            </div>

            {/* Pricing Card Section */}
            <div className="rounded-xl border border-emerald-950/20 bg-gradient-to-br from-[#08121d] to-[#04080d] p-4 flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                {product.isPromoActive && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-emerald-400 tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.showStock && (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-bold">
                    <span>Em estoque</span>
                  </div>
                )}
              </div>
            </div>

            {/* Variation Switch Selector */}
            {product.colorStockControl && product.colors.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Selecione a Variação:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, idx) => {
                    const isSelected = selectedColor === c.color;
                    const dotColor = c.colorHex && c.colorHex.trim() !== "" ? c.colorHex : "#00e181";
                    const isDefaultGreen = !c.colorHex || c.colorHex.trim() === "";

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(c.color);
                          setQuantity(1);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(0,225,129,0.2)]"
                            : "bg-[#08121a] border-emerald-950/40 text-gray-400 hover:border-emerald-800 hover:text-gray-200"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/25 shadow-xs shrink-0"
                          style={{
                            backgroundColor: dotColor,
                            boxShadow: isDefaultGreen
                              ? "0 0 6px rgba(0,225,129,0.6)"
                              : `0 0 6px ${dotColor}60`
                          }}
                        />
                        <span>{c.color}</span>
                        {product.showStock && (
                          <span className="text-[10px] text-gray-500">({c.stock} un)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Compatible Models List */}
            {product.compatibleModels && product.compatibleModels.length > 0 && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#081520]/70 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">
                    Modelos Compatíveis ({product.compatibleModels.length}):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.compatibleModels.map((model, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs"
                    >
                      📱 {model}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Order Buttons */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center justify-between bg-[#08121a] p-2.5 rounded-xl border border-emerald-950/40">
                <span className="text-xs font-bold text-gray-300">Quantidade</span>
                <div className="flex items-center gap-3">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-800/80 text-white font-bold flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-emerald-400 min-w-4 text-center">{quantity}</span>
                  <button
                    disabled={product.showStock && currentStock > 0 && quantity >= currentStock}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-800/80 text-white font-bold flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2.5">
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 bg-[#00e181] hover:bg-[#00c570] text-[#050c12] font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,225,129,0.3)] transition-all cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>PEDIR NO WHATSAPP</span>
                </button>

                <button
                  onClick={() => {
                    onAddToCart(product, quantity, selectedColor);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#0d1f2e] border border-emerald-500/20 text-emerald-400 hover:text-white hover:border-emerald-400 font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{copied ? "ADICIONADO!" : "ADICIONAR AO CARRINHO"}</span>
                </button>
              </div>
            </div>

            {/* Specifications Table Section */}
            {product.specifications.length > 0 && (
              <div className="border-t border-emerald-950/20 pt-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Especificações Técnicas
                  </h3>
                </div>

                <div className="rounded-xl border border-emerald-950/30 overflow-hidden bg-[#070c14]/40 text-xs">
                  {product.specifications.map((spec, idx) => (
                    <div 
                      key={idx} 
                      className={`grid grid-cols-2 p-2.5 ${
                        idx % 2 === 0 ? "bg-[#09121c]/40" : "bg-[#060a10]/20"
                      } border-b border-emerald-950/20 last:border-0`}
                    >
                      <span className="font-bold text-gray-400">{spec.key}</span>
                      <span className="text-gray-200">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support / Guarantee Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-950/20">
              <div className="flex items-center gap-2 bg-[#08121a] p-3 rounded-xl border border-emerald-950/30">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-bold text-white">Suporte Ativo</span>
                  <span className="text-[8px] text-gray-400">Atendimento humanizado</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#08121a] p-3 rounded-xl border border-emerald-950/30">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-bold text-white">100% Seguro</span>
                  <span className="text-[8px] text-gray-400">Garantia Thyago Tech</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS (Full width below the 2-column split) */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-emerald-950/20 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Produtos Relacionados
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {relatedProducts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => onNavigateToProduct(p.id)}
                  className="rounded-xl border border-emerald-950/40 bg-[#08121a] p-2.5 cursor-pointer hover:border-emerald-500/40 transition-all hover:scale-[1.02]"
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-950">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-[11px] font-bold text-white mt-2 truncate">{p.name}</h4>
                  <span className="text-[11px] text-emerald-400 font-extrabold block mt-0.5">
                    {formatPrice(p.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
