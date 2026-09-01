import React, { useState } from "react";
import { Heart, ShoppingCart, Play } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

export default function ProductCard({ product, onClick, onAddToCart }: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  // Format currency
  const formatPrice = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-emerald-950/40 hover:border-emerald-500/30 bg-[#08121a]/90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer select-none"
      onClick={onClick}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#0a1824]/40">
        <img
          src={product.images[0] || "https://images.unsplash.com/photo-1527698266440-12104e498b76?w=600"}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-[#070b11]/60 backdrop-blur-md border border-white/5 text-gray-300 hover:text-rose-500 transition-colors cursor-pointer"
          title="Favoritar"
        >
          <Heart 
            className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : "text-gray-300"}`} 
          />
        </button>

        {/* Category Badge or Best Seller or Video Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.isBestSeller && (
            <div className="bg-emerald-500 text-[#070b11] text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded shadow-sm">
              Mais Vendido
            </div>
          )}
          {product.videos && product.videos.length > 0 && (
            <div className="flex items-center gap-1 bg-teal-500/90 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Vídeo</span>
            </div>
          )}
        </div>
      </div>

      {/* Content details */}
      <div className="flex flex-col flex-1 p-3.5">
        <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-1 truncate">
          {product.categories && product.categories.length > 0 ? product.categories.join(" • ") : product.category}
        </span>
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-emerald-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-1.5">
          <div className="flex flex-col">
            {product.isPromoActive && (
              <span className="text-[9px] text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-sm font-extrabold text-emerald-400 tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            className="flex items-center gap-1.5 bg-[#00e181] hover:bg-[#00c570] text-[#050c12] text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-[0_2px_10px_rgba(0,225,129,0.2)] transition-all cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>ADD</span>
          </button>
        </div>

        {/* Stock status indicator (if active & showStock is enabled) */}
        {product.showStock && (
          <div className="mt-2.5 pt-1.5 border-t border-emerald-950/20 flex justify-between items-center text-[8px] text-gray-400 font-medium">
            <span>Disponível em estoque</span>
            <span className={`font-bold ${product.stock <= 3 ? "text-amber-400" : "text-emerald-400"}`}>
              {product.stock} un
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
