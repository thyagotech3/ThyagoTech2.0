import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Truck,
  MapPin,
  Copy,
  Send,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  User,
  Phone,
  Check,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Package,
  Layers,
  ArrowRight
} from "lucide-react";
import { Product, Sale } from "../types";

interface SalesHistoryProps {
  sales: Sale[];
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  onUpdateSaleStatus: (saleId: string, updates: { paymentStatus?: "pago" | "na_entrega" | "a_prazo"; status?: "concluida" | "cancelada" }) => Promise<void>;
  onDeleteSale: (saleId: string) => Promise<void>;
  onNavigateToPDV: () => void;
}

export default function SalesHistory({
  sales,
  products,
  onSaveProducts,
  onUpdateSaleStatus,
  onDeleteSale,
  onNavigateToPDV
}: SalesHistoryProps) {
  const [filterStatus, setFilterStatus] = useState<"todas" | "pago" | "na_entrega" | "a_prazo" | "cancelada">("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Format Price
  const formatPrice = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Format Date DD/MM/YYYY
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // KPI Calculations
  const activeSales = sales.filter((s) => s.status !== "cancelada");
  const totalRevenue = activeSales.filter((s) => s.paymentStatus === "pago").reduce((sum, s) => sum + s.total, 0);
  const totalPendingReceivable = activeSales
    .filter((s) => s.paymentStatus === "a_prazo" || s.paymentStatus === "na_entrega")
    .reduce((sum, s) => sum + s.total, 0);
  const totalConcludedCount = activeSales.filter((s) => s.paymentStatus === "pago").length;
  const totalPendingCount = activeSales.filter((s) => s.paymentStatus !== "pago").length;

  // Filter list
  const filteredSales = sales.filter((sale) => {
    if (filterStatus === "todas") {
      // do not show canceladas by default unless explicitly chosen
    } else if (filterStatus === "cancelada") {
      if (sale.status !== "cancelada") return false;
    } else {
      if (sale.status === "cancelada" || sale.paymentStatus !== filterStatus) return false;
    }

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sale.clientName.toLowerCase().includes(term) ||
      sale.clientPhone.toLowerCase().includes(term) ||
      sale.items.some((i) => i.productName.toLowerCase().includes(term)) ||
      (sale.pickupLocation && sale.pickupLocation.toLowerCase().includes(term)) ||
      (sale.deliveryAddress && sale.deliveryAddress.neighborhood.toLowerCase().includes(term))
    );
  });

  // Mark as Paid
  const handleMarkAsPaid = async (sale: Sale) => {
    try {
      await onUpdateSaleStatus(sale.id, { paymentStatus: "pago" });
      showToast(`✓ Venda de ${sale.clientName} marcada como PAGA!`);
    } catch (err) {
      showToast("Erro ao atualizar status.");
    }
  };

  // Cancel Sale & Restock Products
  const handleConfirmCancelSale = async () => {
    if (!saleToCancel) return;
    setIsProcessing(true);
    try {
      // 1. Restock items back to products
      const updatedProductsList: Product[] = JSON.parse(JSON.stringify(products));

      for (const item of saleToCancel.items) {
        const prodIndex = updatedProductsList.findIndex((p) => p.id === item.productId);
        if (prodIndex !== -1) {
          const targetProd = updatedProductsList[prodIndex];
          targetProd.stock = (targetProd.stock || 0) + item.quantity;

          if (targetProd.colorStockControl && item.selectedColor && Array.isArray(targetProd.colors)) {
            const colorIndex = targetProd.colors.findIndex((c) => c.color === item.selectedColor);
            if (colorIndex !== -1) {
              targetProd.colors[colorIndex].stock = (targetProd.colors[colorIndex].stock || 0) + item.quantity;
            }
          }
        }
      }

      onSaveProducts(updatedProductsList);
      await onUpdateSaleStatus(saleToCancel.id, { status: "cancelada" });

      showToast(`✓ Venda cancelada e estoque estornado com sucesso!`);
      setSaleToCancel(null);
    } catch (err) {
      showToast("Erro ao cancelar venda.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete sale permanently
  const handleConfirmDeleteSale = async () => {
    if (!saleToDelete) return;
    setIsProcessing(true);
    try {
      await onDeleteSale(saleToDelete.id);
      showToast("✓ Registro de venda excluído.");
      setSaleToDelete(null);
    } catch (err) {
      showToast("Erro ao excluir.");
    } finally {
      setIsProcessing(false);
    }
  };

  // WhatsApp receipt helper
  const handleCopyReceipt = (sale: Sale) => {
    const itemsText = sale.items
      .map(
        (i) =>
          `• *${i.quantity}x ${i.productName}*${i.selectedColor ? ` (Cor: ${i.selectedColor})` : ""} - ${formatPrice(i.total)}`
      )
      .join("\n");

    const paymentStatusText =
      sale.paymentStatus === "pago"
        ? "✅ *PAGO*"
        : sale.paymentStatus === "na_entrega"
        ? "🟡 *PAGAR NA ENTREGA*"
        : `🟣 *A PRAZO* (Vencimento: ${formatDateBR(sale.dueDate || "")})`;

    const deliveryDetailText =
      sale.deliveryType === "entrega"
        ? `📍 *Entrega:* ${sale.deliveryAddress?.street}, ${sale.deliveryAddress?.number} - ${sale.deliveryAddress?.neighborhood}`
        : `📍 *Retirada:* ${sale.pickupLocation}`;

    const text = `🛍️ *THYAGO TECH - RESUMO DO PEDIDO*
---------------------------------------
👤 *Cliente:* ${sale.clientName}
📅 *Data:* ${formatDateBR(sale.deliveryDate)}
${deliveryDetailText}

📦 *ITENS DO PEDIDO:*
${itemsText}
${sale.deliveryFee ? `\n🛵 *Taxa de Entrega:* ${formatPrice(sale.deliveryFee)}` : ""}
${sale.discount ? `🏷️ *Desconto:* -${formatPrice(sale.discount)}` : ""}
💰 *VALOR TOTAL:* *${formatPrice(sale.total)}*

💳 *Pagamento:* ${sale.paymentMethod.toUpperCase()} (${paymentStatusText})
---------------------------------------`;

    navigator.clipboard.writeText(text);
    showToast("✓ Comprovante copiado para a área de transferência!");
  };

  const handleOpenWhatsAppChat = (sale: Sale) => {
    const cleanPhone = sale.clientPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      showToast("⚠️ Nenhum telefone cadastrado para este cliente.");
      return;
    }
    const phoneParam = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${phoneParam}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-[#071720] to-[#08121a] border border-emerald-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Histórico de Vendas & Pedidos
            </h2>
            <p className="text-[11px] text-gray-400">Controle de recebimentos, entregas e estorno de estoque</p>
          </div>
        </div>

        <button
          onClick={onNavigateToPDV}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
        >
          <span>+ Nova Venda (PDV)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#08121a] border border-emerald-950/80 p-3 rounded-2xl flex flex-col">
          <span className="text-[10px] text-gray-400 font-semibold">Faturamento Liquidado</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 mt-1">{formatPrice(totalRevenue)}</span>
          <span className="text-[9px] text-emerald-500/80">{totalConcludedCount} pedidos pagos</span>
        </div>

        <div className="bg-[#08121a] border border-amber-950/60 p-3 rounded-2xl flex flex-col">
          <span className="text-[10px] text-amber-400 font-semibold">Total a Receber</span>
          <span className="text-base sm:text-lg font-black text-amber-300 mt-1">{formatPrice(totalPendingReceivable)}</span>
          <span className="text-[9px] text-amber-400/80">{totalPendingCount} pendentes</span>
        </div>

        <div className="bg-[#08121a] border border-emerald-950/80 p-3 rounded-2xl flex flex-col">
          <span className="text-[10px] text-gray-400 font-semibold">Total de Vendas</span>
          <span className="text-base sm:text-lg font-black text-white mt-1">{activeSales.length}</span>
          <span className="text-[9px] text-gray-500">Pedidos registrados</span>
        </div>

        <div className="bg-[#08121a] border border-purple-950/60 p-3 rounded-2xl flex flex-col">
          <span className="text-[10px] text-purple-400 font-semibold">A Prazo / Fiado</span>
          <span className="text-base sm:text-lg font-black text-purple-300 mt-1">
            {sales.filter((s) => s.paymentStatus === "a_prazo" && s.status !== "cancelada").length}
          </span>
          <span className="text-[9px] text-purple-400/80">Com data limite</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-2.5">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#050b11] rounded-xl border border-emerald-950">
          {[
            { id: "todas", label: `Todas (${sales.filter((s) => s.status !== "cancelada").length})` },
            { id: "na_entrega", label: `Na Entrega (${sales.filter((s) => s.paymentStatus === "na_entrega" && s.status !== "cancelada").length})` },
            { id: "a_prazo", label: `A Prazo (${sales.filter((s) => s.paymentStatus === "a_prazo" && s.status !== "cancelada").length})` },
            { id: "pago", label: `Pagas (${sales.filter((s) => s.paymentStatus === "pago" && s.status !== "cancelada").length})` },
            { id: "cancelada", label: `Canceladas (${sales.filter((s) => s.status === "cancelada").length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, produto, telefone ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Sales List */}
      <div className="flex flex-col gap-3">
        {filteredSales.length === 0 ? (
          <div className="bg-[#08121a] border border-dashed border-emerald-950/80 p-8 rounded-2xl text-center">
            <ShoppingBag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Nenhuma venda encontrada para esta seleção</p>
          </div>
        ) : (
          filteredSales.map((sale) => {
            const isCanceled = sale.status === "cancelada";
            const isPaid = sale.paymentStatus === "pago";
            const isPendingDelivery = sale.paymentStatus === "na_entrega";
            const isAPrazo = sale.paymentStatus === "a_prazo";

            return (
              <div
                key={sale.id}
                className={`bg-[#08121a] border rounded-2xl p-4 transition-all flex flex-col gap-3 shadow-sm ${
                  isCanceled
                    ? "border-rose-950/60 opacity-60 bg-[#070c12]"
                    : isPaid
                    ? "border-emerald-950/80 hover:border-emerald-500/40"
                    : isAPrazo
                    ? "border-purple-950/80 hover:border-purple-500/40"
                    : "border-amber-950/80 hover:border-amber-500/40"
                }`}
              >
                {/* Sale Header */}
                <div className="flex items-start justify-between gap-2 border-b border-emerald-950/50 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCanceled
                          ? "bg-rose-500/20 text-rose-400"
                          : isPaid
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isAPrazo
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{sale.clientName}</h4>
                        {sale.clientPhone && (
                          <button
                            onClick={() => handleOpenWhatsAppChat(sale)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded cursor-pointer"
                            title="Abrir WhatsApp"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{sale.clientPhone}</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Previsto: <strong className="text-gray-300 font-semibold">{formatDateBR(sale.deliveryDate)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isCanceled ? (
                      <span className="text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase">
                        Cancelada (Estornada)
                      </span>
                    ) : isPaid ? (
                      <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Pago
                      </span>
                    ) : isPendingDelivery ? (
                      <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <Clock className="w-3 h-3" /> Pagar na Entrega
                      </span>
                    ) : (
                      <span className="text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <Calendar className="w-3 h-3" /> A Prazo (Venc: {formatDateBR(sale.dueDate || "")})
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery / Meeting Point Detail */}
                <div className="bg-[#050b11] p-2 rounded-xl text-[11px] text-gray-300 flex items-center gap-2">
                  {sale.deliveryType === "entrega" ? (
                    <>
                      <Truck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">
                        Entrega: {sale.deliveryAddress?.street}, {sale.deliveryAddress?.number} - {sale.deliveryAddress?.neighborhood}
                        {sale.deliveryAddress?.complement ? ` (${sale.deliveryAddress.complement})` : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">
                        Retirada / Ponto: <strong className="text-white">{sale.pickupLocation}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-1.5">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-gray-300">
                      <span className="truncate max-w-[220px]">
                        • {item.quantity}x <strong className="text-white">{item.productName}</strong>
                        {item.selectedColor && <span className="text-emerald-400 ml-1">({item.selectedColor})</span>}
                      </span>
                      <span className="font-semibold text-gray-400 flex-shrink-0">{formatPrice(item.total)}</span>
                    </div>
                  ))}

                  {sale.deliveryFee ? (
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>• Taxa de entrega:</span>
                      <span>+{formatPrice(sale.deliveryFee)}</span>
                    </div>
                  ) : null}

                  {sale.discount ? (
                    <div className="flex items-center justify-between text-[11px] text-rose-400">
                      <span>• Desconto:</span>
                      <span>-{formatPrice(sale.discount)}</span>
                    </div>
                  ) : null}
                </div>

                {/* Footer Total & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald-950/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Total:</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400">{formatPrice(sale.total)}</span>
                    <span className="text-[10px] text-gray-500 uppercase">({sale.paymentMethod})</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Mark as Paid button (if not paid and not canceled) */}
                    {!isPaid && !isCanceled && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsPaid(sale)}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Marcar como Pago</span>
                      </button>
                    )}

                    {/* Copy WhatsApp Receipt */}
                    <button
                      type="button"
                      onClick={() => handleCopyReceipt(sale)}
                      className="px-2.5 py-1.5 bg-[#0c1c28] hover:bg-[#112a3d] text-emerald-300 font-bold text-[11px] rounded-xl border border-emerald-950 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copiar texto para WhatsApp"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="hidden sm:inline">Comprovante</span>
                    </button>

                    {/* Cancel & Restock button */}
                    {!isCanceled && (
                      <button
                        type="button"
                        onClick={() => setSaleToCancel(sale)}
                        className="px-2.5 py-1.5 bg-[#050b11] hover:bg-rose-950/50 text-gray-400 hover:text-rose-400 font-bold text-[11px] rounded-xl border border-emerald-950 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Cancelar venda e devolver estoque"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    )}

                    {/* Delete record permanently */}
                    <button
                      type="button"
                      onClick={() => setSaleToDelete(sale)}
                      className="p-1.5 bg-[#050b11] hover:bg-rose-950/60 text-gray-500 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRM CANCEL MODAL */}
      <AnimatePresence>
        {saleToCancel && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#07131e] border border-rose-500/40 rounded-3xl w-full max-w-sm p-5 flex flex-col gap-4 text-white shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-sm font-black text-white">Cancelar Venda e Estornar Estoque?</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Os itens desta venda de <strong>{saleToCancel.clientName}</strong> serão somados de volta ao estoque dos produtos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaleToCancel(null)}
                  className="py-2.5 bg-[#08121a] text-gray-300 font-bold text-xs rounded-xl border border-emerald-950 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelSale}
                  disabled={isProcessing}
                  className="py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
                >
                  {isProcessing ? "Estornando..." : "Sim, Estornar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {saleToDelete && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#07131e] border border-rose-500/40 rounded-3xl w-full max-w-sm p-5 flex flex-col gap-4 text-white shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-sm font-black text-white">Excluir Registro de Venda?</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Esta ação removerá o registro permanentemente do histórico.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaleToDelete(null)}
                  className="py-2.5 bg-[#08121a] text-gray-300 font-bold text-xs rounded-xl border border-emerald-950 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSale}
                  disabled={isProcessing}
                  className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  {isProcessing ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
