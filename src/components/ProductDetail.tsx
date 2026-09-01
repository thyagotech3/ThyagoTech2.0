import React, { useState } from "react";
import { 
  ArrowLeft, Heart, ShoppingCart, MessageCircle, 
  ChevronRight, Sparkles, AlertTriangle, Check, Shield, 
  Target, Feather, Lightbulb, Maximize, Palette, Volume2, 
  Mic, Zap, Video, Eye, Keyboard, Play, Film
} from "lucide-react";
import { Product } from "../types";

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onNavigateToProduct: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
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

export default function ProductDetail({ 
  product, 
  allProducts, 
  onBack, 
  onNavigateToProduct, 
  onAddToCart 
}: ProductDetailProps) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colorStockControl && product.colors.length > 0 ? product.colors[0].color : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

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

  // Phone brand and model selection for Capas
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedBrand, setSelectedBrand] = useState<string>("Apple");
  const [selectedModel, setSelectedModel] = useState<string>("15 Plus");

  const PHONE_BRANDS = ["Apple", "Samsung", "Xiaomi", "Motorola"];
  const PHONE_MODELS: { [key: string]: string[] } = {
    "Apple": ["11", "12", "13", "14", "14 Pro", "15", "15 Plus", "15 Pro", "15 Pro Max", "16", "16 Pro", "16 Pro Max"],
    "Samsung": ["Galaxy S23", "Galaxy S23 Ultra", "Galaxy S24", "Galaxy S24 Ultra", "Galaxy A54", "Galaxy A55"],
    "Xiaomi": ["Redmi Note 12", "Redmi Note 13", "Pocophone X6", "Xiaomi 13", "Xiaomi 14"],
    "Motorola": ["Moto G54", "Moto G84", "Edge 40", "Edge 50 Pro"]
  };

  // Format currency
  const formatPrice = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  // WhatsApp order URL generation
  const handleWhatsAppOrder = () => {
    const phoneNumber = "5581997073882"; // Thyago Tech phone number (81 99707-3882)
    const colorText = selectedColor ? `\n🎨 *Variação:* ${selectedColor}` : "";
    const promoText = product.isPromoActive ? ` (De ${formatPrice(product.originalPrice)} por ${formatPrice(product.price)})` : "";
    const phoneModelText = selectedBrand && selectedModel ? `\n📱 *Modelo de Celular:* ${selectedBrand} - ${selectedModel}` : "";
    
    const catStr = product.categories && product.categories.length > 0 ? product.categories.join(", ") : product.category;
    const message = `Olá! Vi o produto *${product.name}* no site *Thyago Tech* e gostaria de encomendá-lo!
    
🛒 *Produto:* ${product.name}
🏷️ *Preço:* ${formatPrice(product.price)}${promoText}${colorText}${phoneModelText}
📦 *Quantidade:* ${quantity}
✨ *Categorias:* ${catStr}
    
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

      <div className="max-w-md mx-auto px-4 pt-4 flex flex-col gap-5">
        {/* Breadcrumb path for Mobile strictly as in Image 2 */}
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <span className="hover:text-emerald-400 cursor-pointer" onClick={onBack}>Home</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="hover:text-emerald-300 cursor-pointer">{product.categories && product.categories.length > 0 ? product.categories.join(" • ") : product.category}</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-emerald-400 font-medium truncate max-w-[150px]">{product.name}</span>
        </div>

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
              <div className="w-10 h-14 bg-gradient-to-l from-[#091520] to-transparent absolute right-3 pointer-events-none flex items-center justify-end">
                <ChevronRight className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        {/* Product Meta Header Information */}
        <div className="flex flex-col gap-1.5">
          {/* Category Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.categories && product.categories.length > 0 ? (
              product.categories.map((cat) => {
                const isCapas = cat.toLowerCase().includes("capas");
                return (
                  <div key={cat} className="flex items-center gap-1.5 flex-wrap">
                    <span
                      onClick={() => {
                        if (isCapas) {
                          setIsPhoneModalOpen(true);
                          setModalStep(1);
                        }
                      }}
                      className={`h-6 inline-flex items-center justify-center gap-1 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] uppercase tracking-wider font-extrabold px-2.5 rounded-md transition-all ${
                        isCapas ? "cursor-pointer hover:border-emerald-500 hover:bg-emerald-900/40 shadow-sm" : ""
                      }`}
                    >
                      {cat} {isCapas && "📱"}
                    </span>

                    {isCapas && (
                      selectedBrand && selectedModel ? (
                        <>
                          <span className="h-6 inline-flex items-center justify-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 rounded-md shadow-sm">
                            <span>{selectedBrand} • {selectedModel}</span>
                            <button 
                              onClick={() => {
                                setSelectedBrand("");
                                setSelectedModel("");
                              }}
                              className="text-emerald-400 hover:text-white font-extrabold cursor-pointer leading-none"
                              title="Remover modelo"
                            >
                              ✕
                            </button>
                          </span>
                          <button
                            onClick={() => {
                              setIsPhoneModalOpen(true);
                              setModalStep(1);
                            }}
                            className="h-6 inline-flex items-center justify-center bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold px-2.5 rounded-md cursor-pointer whitespace-nowrap transition-all shadow-sm"
                          >
                            Mudar Modelo
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setIsPhoneModalOpen(true);
                            setModalStep(1);
                          }}
                          className="h-6 inline-flex items-center justify-center bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold px-2.5 rounded-md cursor-pointer whitespace-nowrap transition-all shadow-sm"
                        >
                          Escolher Modelo
                        </button>
                      )
                    )}
                  </div>
                );
              })
            ) : (
              <span className="inline-block bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md">
                {product.category}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h1 className="text-2xl font-black text-white leading-tight tracking-tight mt-1">
            {product.name}
          </h1>

          {/* Description */}
          <p className="text-xs text-gray-300 leading-relaxed mt-1">
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
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-bold">
              <span>Em estoque</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">
            Em até 6x de {formatPrice(product.price / 6)} sem juros
          </p>
        </div>

        {/* Variation Switch Selector (if variation stock control active) */}
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
                      setQuantity(1); // Reset qty to safe limit
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
                    <span className="text-[10px] text-gray-500">({c.stock} un)</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity and Order Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Quantity selector */}
          {product.showStock && (
            <div className="flex items-center justify-between bg-[#08121a] p-2.5 rounded-xl border border-emerald-950/40">
              <span className="text-xs font-bold text-gray-300">Quantidade</span>
              <div className="flex items-center gap-3">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-800/80 text-white font-bold flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-40"
                >
                  -
                </button>
                <span className="text-sm font-black text-emerald-400 min-w-4 text-center">{quantity}</span>
                <button
                  disabled={quantity >= currentStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-800/80 text-white font-bold flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* ADD TO BAG and PEDIR NO WHATSAPP Action buttons strictly as requested */}
          <div className="grid grid-cols-1 gap-2.5">
            {/* Primary CTA: PEDIR NO WHATSAPP (direct order) */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full flex items-center justify-center gap-2 bg-[#00e181] hover:bg-[#00c570] text-[#050c12] font-black text-sm py-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,225,129,0.3)] transition-all cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>PEDIR NO WHATSAPP</span>
            </button>

            {/* Secondary: ADICIONAR AO CARRINHO (adds to visual cart) */}
            <button
              onClick={() => {
                onAddToCart(product, quantity, selectedColor);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#0d1f2e] border border-emerald-500/20 text-emerald-400 hover:text-white hover:border-emerald-400 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{copied ? "ADICIONADO AO CARRINHO!" : "ADICIONAR AO CARRINHO"}</span>
            </button>
          </div>
        </div>

        {/* Feature/Highlights Points Row strictly as design 2 */}
        {product.highlightPoints.length > 0 && (
          <div className="grid grid-cols-1 gap-3.5 border-t border-emerald-950/20 pt-5 mt-2">
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

        {/* Specifications Table Section */}
        {product.specifications.length > 0 && (
          <div className="border-t border-emerald-950/20 pt-5 flex flex-col gap-3">
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
                  className={`grid grid-cols-2 p-3 ${
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

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-emerald-950/20 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Produtos Relacionados
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer">
                Ver todos
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => onNavigateToProduct(p.id)}
                  className="rounded-xl border border-emerald-950/40 bg-[#08121a] p-2.5 cursor-pointer hover:border-emerald-500/20 transition-all"
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-950">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-[11px] font-bold text-white mt-2 truncate">{p.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-extrabold block mt-0.5">
                    {formatPrice(p.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Support Banners */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-emerald-950/20">
          <div className="flex items-center gap-2 bg-[#08121a] p-3 rounded-xl border border-emerald-950/30">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-bold text-white">Suporte Ativo</span>
              <span className="text-[7px] text-gray-400">Atendimento humanizado</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#08121a] p-3 rounded-xl border border-emerald-950/30">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-bold text-white">100% Seguro</span>
              <span className="text-[7px] text-gray-400">Garantia Thyago Tech</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Brand & Model Selection Modal */}
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
                      {selectedBrand === brand && <Check className="w-4 h-4" />}
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
                      {selectedModel === model && <Check className="w-4 h-4" />}
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
    </div>
  );
}
