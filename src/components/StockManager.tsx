import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Search,
  Plus,
  Minus,
  Layers,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Palette,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Product, ColorStock } from "../types";
import { PRESET_VARIATION_COLORS } from "./AdminPanel";

interface StockManagerProps {
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  onNavigateToPDV?: () => void;
}

export default function StockManager({
  products,
  onSaveProducts,
  onNavigateToPDV
}: StockManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New variation form state in modal
  const [newVarColor, setNewVarColor] = useState("");
  const [newVarStock, setNewVarStock] = useState<number>(5);
  const [newVarHex, setNewVarHex] = useState("#10B981");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Categories list
  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "Todos" || p.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate global inventory metrics
  const totalStockCount = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 2).length;
  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) === 0).length;

  // Format Price
  const formatPrice = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };



  // Open Edit Stock Modal for specific product
  const handleOpenStockModal = (product: Product) => {
    // Clone product to isolate edits until saved
    setEditingProduct(JSON.parse(JSON.stringify(product)));
    setNewVarColor("");
    setNewVarStock(5);
    setNewVarHex("#10B981");
  };

  // Save changes from modal
  const handleSaveModalStock = () => {
    if (!editingProduct) return;

    // Calculate total stock if colorStockControl is active
    let finalProduct = { ...editingProduct };
    if (finalProduct.colorStockControl && Array.isArray(finalProduct.colors) && finalProduct.colors.length > 0) {
      finalProduct.stock = finalProduct.colors.reduce((sum, c) => sum + (Number(c.stock) || 0), 0);
    }

    const updated = products.map((p) => (p.id === finalProduct.id ? finalProduct : p));
    onSaveProducts(updated);
    setEditingProduct(null);
    showToast(`✓ Estoque de "${finalProduct.name}" atualizado!`);
  };

  // Add variation inside modal
  const handleAddVariation = () => {
    if (!editingProduct) return;
    if (!newVarColor.trim()) return;

    const currentColors = editingProduct.colors || [];
    const newColorItem: ColorStock = {
      color: newVarColor.trim(),
      stock: Math.max(0, newVarStock),
      colorHex: newVarHex
    };

    const updatedColors = [...currentColors, newColorItem];
    const newTotalStock = updatedColors.reduce((sum, c) => sum + c.stock, 0);

    setEditingProduct({
      ...editingProduct,
      colorStockControl: true,
      colors: updatedColors,
      stock: newTotalStock
    });

    setNewVarColor("");
    setNewVarStock(5);
  };

  // Remove variation inside modal
  const handleRemoveVariation = (colorName: string) => {
    if (!editingProduct || !editingProduct.colors) return;
    const updatedColors = editingProduct.colors.filter((c) => c.color !== colorName);
    const newTotalStock = updatedColors.reduce((sum, c) => sum + c.stock, 0);

    setEditingProduct({
      ...editingProduct,
      colors: updatedColors,
      stock: newTotalStock
    });
  };

  // Adjust variation stock inside modal
  const handleAdjustVariationStock = (colorName: string, delta: number) => {
    if (!editingProduct || !editingProduct.colors) return;
    const updatedColors = editingProduct.colors.map((c) => {
      if (c.color === colorName) {
        return { ...c, stock: Math.max(0, c.stock + delta) };
      }
      return c;
    });
    const newTotalStock = updatedColors.reduce((sum, c) => sum + c.stock, 0);

    setEditingProduct({
      ...editingProduct,
      colors: updatedColors,
      stock: newTotalStock
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner with Metrics */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-[#071720] to-[#08121a] border border-emerald-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Controle de Estoque <span className="text-[10px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase">Ao Vivo</span>
            </h2>
            <p className="text-[11px] text-gray-400">Gerencie quantidades gerais e por variação vinculadas à vitrine</p>
          </div>
        </div>

        {onNavigateToPDV && (
          <button
            onClick={onNavigateToPDV}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <span>+ Lançar Venda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-[#08121a] border border-emerald-950/80 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-xl sm:text-2xl font-black text-white">{totalStockCount}</span>
          <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Unidades Totais</span>
        </div>

        <div className="bg-[#08121a] border border-amber-950/50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-xl sm:text-2xl font-black text-amber-400">{lowStockCount}</span>
          <span className="text-[10px] sm:text-xs text-amber-300/80 mt-0.5">Estoque Baixo (≤2)</span>
        </div>

        <div className="bg-[#08121a] border border-rose-950/50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-xl sm:text-2xl font-black text-rose-400">{outOfStockCount}</span>
          <span className="text-[10px] sm:text-xs text-rose-300/80 mt-0.5">Esgotados (0 un)</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Categoria: {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products Stock List */}
      <div className="flex flex-col gap-2.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-[#08121a] border border-dashed border-emerald-950/80 p-8 rounded-2xl text-center">
            <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Nenhum produto encontrado com os filtros aplicados</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stockNum = Number(product.stock) || 0;
            const isOutOfStock = stockNum === 0;
            const isLowStock = stockNum > 0 && stockNum <= 2;

            return (
              <div
                key={product.id}
                className="bg-[#08121a] hover:bg-[#0c1c2a] border border-emerald-950/70 hover:border-emerald-500/40 p-3 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                {/* Product Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : "/src/assets/images/quantum_vector_mouse_1788183228777.jpg"}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-950 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                        {product.name}
                      </h4>
                      <span className="text-[9px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                      <span className="text-white font-bold">{formatPrice(product.price)}</span>
                      {product.colorStockControl && product.colors && product.colors.length > 0 && (
                        <span className="text-[10px] text-teal-400 flex items-center gap-1 font-medium">
                          <Layers className="w-3 h-3" />
                          {product.colors.length} variações
                        </span>
                      )}
                    </div>

                    {/* Variations Preview if any */}
                    {product.colorStockControl && product.colors && product.colors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {product.colors.map((c) => (
                          <span
                            key={c.color}
                            className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                              c.stock === 0
                                ? "bg-rose-950/50 text-rose-300 border-rose-900 line-through opacity-70"
                                : c.stock <= 2
                                ? "bg-amber-950/50 text-amber-300 border-amber-900"
                                : "bg-[#050b11] text-gray-300 border-emerald-950"
                            }`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: c.colorHex || "#10B981" }}
                            />
                            {c.color}: {c.stock}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Controls & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-950/40">
                  {/* Stock count badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                        isOutOfStock
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          : isLowStock
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {isOutOfStock ? "Esgotado (0)" : `${stockNum} un`}
                    </span>


                  </div>

                  {/* Gerenciar Modal Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenStockModal(product)}
                    className="px-3 py-1.5 bg-[#0e2130] hover:bg-emerald-500 hover:text-black text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Gerenciar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================== */}
      {/* MODAL DE CONTROLE COMPLETO DE ESTOQUE & VARIAÇÕES */}
      {/* ========================================================== */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#07131e] border border-emerald-500/50 rounded-3xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-2xl text-white my-auto max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images[0] : ""}
                    alt={editingProduct.name}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-950 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{editingProduct.name}</h3>
                    <p className="text-[10px] text-emerald-400">Gestão de Estoque & Variações da Vitrine</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toggles: Exibir Estoque na Vitrine & Controle por Variação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-[#050b11] p-3 rounded-xl border border-emerald-950 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-white block">Exibir Estoque</span>
                    <span className="text-[10px] text-gray-400">Mostrar número ao cliente</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, showStock: !editingProduct.showStock })}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      editingProduct.showStock
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    {editingProduct.showStock ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="bg-[#050b11] p-3 rounded-xl border border-emerald-950 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-white block">Estoque por Variação</span>
                    <span className="text-[10px] text-gray-400">Separar por cores/modelos</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({
                        ...editingProduct,
                        colorStockControl: !editingProduct.colorStockControl
                      })
                    }
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      editingProduct.colorStockControl
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* General Stock Number (if not controlled solely by variations) */}
              <div className="bg-[#050b11] p-3.5 rounded-xl border border-emerald-950 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white block">Estoque Geral Disponível</label>
                    <span className="text-[10px] text-gray-400">
                      {editingProduct.colorStockControl
                        ? "Soma automática das variações abaixo"
                        : "Quantidade total em estoque do item"}
                    </span>
                  </div>
                  <span className="text-lg font-black text-emerald-400">{editingProduct.stock || 0} un</span>
                </div>

                {!editingProduct.colorStockControl && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: Math.max(0, (editingProduct.stock || 0) - 1)
                        })
                      }
                      className="w-9 h-9 rounded-xl bg-[#08121a] hover:bg-emerald-500/20 text-white font-bold border border-emerald-950 flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={editingProduct.stock ?? 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: Math.max(0, parseInt(e.target.value) || 0)
                        })
                      }
                      className="flex-1 text-center bg-[#08121a] border border-emerald-950 rounded-xl py-2 text-sm text-white font-bold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: (editingProduct.stock || 0) + 1
                        })
                      }
                      className="w-9 h-9 rounded-xl bg-[#08121a] hover:bg-emerald-500/20 text-white font-bold border border-emerald-950 flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* VARIATIONS MANAGEMENT SECTION */}
              {editingProduct.colorStockControl && (
                <div className="bg-[#050b11] p-3.5 rounded-xl border border-emerald-950 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-emerald-950/60 pb-2">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Variações Cadastradas ({editingProduct.colors?.length || 0})
                    </span>
                  </div>

                  {/* List of existing variations */}
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {editingProduct.colors && editingProduct.colors.length > 0 ? (
                      editingProduct.colors.map((c) => (
                        <div
                          key={c.color}
                          className="bg-[#08121a] border border-emerald-950/80 p-2.5 rounded-xl flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/30 flex-shrink-0"
                              style={{ backgroundColor: c.colorHex || "#10B981" }}
                            />
                            <span className="text-xs font-bold text-white truncate">{c.color}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleAdjustVariationStock(c.color, -1)}
                                className="w-7 h-7 rounded-lg bg-[#050b11] hover:bg-rose-500/20 text-gray-300 font-bold border border-emerald-950 flex items-center justify-center text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-9 text-center font-bold text-xs text-white">{c.stock} un</span>
                              <button
                                type="button"
                                onClick={() => handleAdjustVariationStock(c.color, 1)}
                                className="w-7 h-7 rounded-lg bg-[#050b11] hover:bg-emerald-500/20 text-gray-300 font-bold border border-emerald-950 flex items-center justify-center text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveVariation(c.color)}
                              className="text-gray-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Remover variação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-500 text-center py-2">
                        Nenhuma variação cadastrada ainda. Adicione uma abaixo.
                      </p>
                    )}
                  </div>

                  {/* Add New Variation Form */}
                  <div className="bg-[#08121a] p-3 rounded-xl border border-emerald-500/20 flex flex-col gap-2.5">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      Adicionar Nova Variação / Cor:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Nome da Cor / Variação</label>
                        <input
                          type="text"
                          placeholder="Ex: Azul Titanium, Branco"
                          value={newVarColor}
                          onChange={(e) => setNewVarColor(e.target.value)}
                          className="w-full bg-[#050b11] border border-emerald-950 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Estoque Inicial</label>
                        <input
                          type="number"
                          min={0}
                          value={newVarStock}
                          onChange={(e) => setNewVarStock(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-[#050b11] border border-emerald-950 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Color palette presets */}
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Cor Visual (Bolinha)</label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_VARIATION_COLORS.slice(0, 10).map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setNewVarHex(preset.preview);
                              if (!newVarColor) setNewVarColor(preset.name.split(" ")[0]);
                            }}
                            className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                              newVarHex === preset.preview ? "scale-110 border-white ring-2 ring-emerald-500" : "border-black/50"
                            }`}
                            style={{ backgroundColor: preset.preview }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariation}
                      disabled={!newVarColor.trim()}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        newVarColor.trim()
                          ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-md"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Inserir Variação</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-950">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="py-2.5 bg-[#08121a] hover:bg-[#0c1c2a] text-gray-300 font-bold text-xs rounded-xl border border-emerald-950 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalStock}
                  className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
