import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Send,
  Trash2,
  RotateCcw,
  Search,
  DollarSign,
  User,
  Phone,
  Check,
  X,
  Package,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Edit3,
  BadgeCheck,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCheck
} from "lucide-react";
import { Product, Sale } from "../types";

export type OrderFilterStatus = "todas" | "aguardando_validacao" | "preparando" | "entregue" | "cancelado";

interface OrderTrackerProps {
  sales: Sale[];
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  onUpdateSaleStatus: (
    saleId: string,
    updates: {
      paymentStatus?: "pago" | "na_entrega" | "a_prazo";
      status?: "concluida" | "cancelada";
      orderStatus?: "aguardando_validacao" | "preparando" | "entregue" | "cancelado";
      preparationTime?: string;
      consultantName?: string;
      notes?: string;
      orderStatusHistory?: { status: string; timestamp: string; note?: string }[];
    }
  ) => Promise<void>;
  onDeleteSale: (saleId: string) => Promise<void>;
  onNavigateToPDV: () => void;
}

export default function OrderTracker({
  sales,
  products,
  onSaveProducts,
  onUpdateSaleStatus,
  onDeleteSale,
  onNavigateToPDV
}: OrderTrackerProps) {
  const [selectedFilter, setSelectedFilter] = useState<OrderFilterStatus>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeSaleDetail, setActiveSaleDetail] = useState<Sale | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editPrepTimeSaleId, setEditPrepTimeSaleId] = useState<string | null>(null);
  const [editPrepDays, setEditPrepDays] = useState("0");
  const [editPrepHours, setEditPrepHours] = useState("0");

  // Helper to format days and hours
  const formatPrepTimeString = (daysStr: string, hoursStr: string) => {
    const d = Math.max(0, parseInt(daysStr, 10) || 0);
    const h = Math.max(0, parseInt(hoursStr, 10) || 0);

    if (d === 0 && h === 0) {
      return "Pronta Entrega";
    }
    if (d > 0 && h === 0) {
      return `${d} ${d === 1 ? "dia" : "dias"}`;
    }
    if (d === 0 && h > 0) {
      return `${h} ${h === 1 ? "hora" : "horas"}`;
    }
    return `${d} ${d === 1 ? "dia" : "dias"} e ${h} ${h === 1 ? "hora" : "horas"}`;
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Price formatter
  const formatPrice = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Format Date & Time
  const formatDateTimeBR = (isoStr: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month} às ${hours}:${mins}`;
    } catch {
      return isoStr;
    }
  };

  // Helper to normalize sale order status
  const getSaleOrderStatus = (sale: Sale): "aguardando_validacao" | "preparando" | "entregue" | "cancelado" => {
    if (sale.status === "cancelada" || sale.orderStatus === "cancelado") {
      return "cancelado";
    }
    if (sale.orderStatus) {
      return sale.orderStatus;
    }
    // Backward compatibility for older sales
    if (sale.paymentStatus === "pago") {
      return "entregue";
    }
    return "aguardando_validacao";
  };

  // Status visual attributes
  const getStatusBadgeConfig = (status: "aguardando_validacao" | "preparando" | "entregue" | "cancelado") => {
    switch (status) {
      case "aguardando_validacao":
        return {
          label: "1. Validação",
          shortLabel: "Validação",
          colorClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
          pillBg: "bg-amber-400 text-black",
          dotColor: "bg-amber-400",
          stepIndex: 1
        };
      case "preparando":
        return {
          label: "2. Em Preparação",
          shortLabel: "Preparando",
          colorClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
          pillBg: "bg-cyan-400 text-black",
          dotColor: "bg-cyan-400",
          stepIndex: 2
        };
      case "entregue":
        return {
          label: "3. Entregue",
          shortLabel: "Entregue",
          colorClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
          pillBg: "bg-emerald-400 text-black",
          dotColor: "bg-emerald-400",
          stepIndex: 3
        };
      case "cancelado":
        return {
          label: "Cancelado",
          shortLabel: "Cancelado",
          colorClass: "bg-rose-500/15 text-rose-300 border-rose-500/40",
          pillBg: "bg-rose-500 text-white",
          dotColor: "bg-rose-400",
          stepIndex: 0
        };
    }
  };

  // Counts for top chips
  const countAguardando = sales.filter((s) => getSaleOrderStatus(s) === "aguardando_validacao").length;
  const countPreparando = sales.filter((s) => getSaleOrderStatus(s) === "preparando").length;
  const countEntregue = sales.filter((s) => getSaleOrderStatus(s) === "entregue").length;
  const countCancelado = sales.filter((s) => getSaleOrderStatus(s) === "cancelado").length;
  const countTotal = sales.length;

  // Filtered sales
  const filteredSales = sales.filter((sale) => {
    const orderStatus = getSaleOrderStatus(sale);
    if (selectedFilter !== "todas" && orderStatus !== selectedFilter) {
      return false;
    }

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sale.clientName.toLowerCase().includes(term) ||
      sale.clientPhone.toLowerCase().includes(term) ||
      (sale.consultantName && sale.consultantName.toLowerCase().includes(term)) ||
      (sale.preparationTime && sale.preparationTime.toLowerCase().includes(term)) ||
      sale.id.toLowerCase().includes(term) ||
      sale.items.some((i) => i.productName.toLowerCase().includes(term)) ||
      (sale.deliveryAddress && sale.deliveryAddress.neighborhood.toLowerCase().includes(term))
    );
  });

  // Action: Move from Aguardando ➔ Preparando (Aprovar Pagamento)
  const handleApprovePaymentAndPrepare = async (sale: Sale) => {
    setIsProcessing(true);
    try {
      const newHistory = [
        ...(sale.orderStatusHistory || []),
        {
          status: "preparando",
          timestamp: new Date().toISOString(),
          note: "Pagamento confirmado. Pedido em preparação."
        }
      ];

      await onUpdateSaleStatus(sale.id, {
        paymentStatus: "pago",
        orderStatus: "preparando",
        orderStatusHistory: newHistory
      });

      if (activeSaleDetail && activeSaleDetail.id === sale.id) {
        setActiveSaleDetail({
          ...activeSaleDetail,
          paymentStatus: "pago",
          orderStatus: "preparando",
          orderStatusHistory: newHistory
        });
      }

      showToast(`✓ Pedido #${sale.id.slice(-5)} em Preparação!`);
    } catch (err) {
      showToast("⚠️ Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Move from Preparando ➔ Entregue
  const handleMarkAsDelivered = async (sale: Sale) => {
    setIsProcessing(true);
    try {
      const newHistory = [
        ...(sale.orderStatusHistory || []),
        {
          status: "entregue",
          timestamp: new Date().toISOString(),
          note: "Pedido marcado como Entregue ao cliente."
        }
      ];

      await onUpdateSaleStatus(sale.id, {
        orderStatus: "entregue",
        status: "concluida",
        paymentStatus: sale.paymentStatus === "a_prazo" ? "a_prazo" : "pago",
        orderStatusHistory: newHistory
      });

      if (activeSaleDetail && activeSaleDetail.id === sale.id) {
        setActiveSaleDetail({
          ...activeSaleDetail,
          orderStatus: "entregue",
          status: "concluida",
          paymentStatus: sale.paymentStatus === "a_prazo" ? "a_prazo" : "pago",
          orderStatusHistory: newHistory
        });
      }

      showToast(`✓ Pedido #${sale.id.slice(-5)} Entregue com sucesso! 🎉`);
    } catch (err) {
      showToast("⚠️ Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Change status directly
  const handleChangeOrderStatus = async (
    sale: Sale,
    newStatus: "aguardando_validacao" | "preparando" | "entregue" | "cancelado"
  ) => {
    if (newStatus === "cancelado") {
      setSaleToCancel(sale);
      return;
    }

    setIsProcessing(true);
    try {
      const newHistory = [
        ...(sale.orderStatusHistory || []),
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: `Status alterado manualmente para ${newStatus}.`
        }
      ];

      const updates: any = {
        orderStatus: newStatus,
        status: "concluida",
        orderStatusHistory: newHistory
      };

      await onUpdateSaleStatus(sale.id, updates);

      if (activeSaleDetail && activeSaleDetail.id === sale.id) {
        setActiveSaleDetail({
          ...activeSaleDetail,
          ...updates
        });
      }

      showToast(`✓ Status alterado para: ${getStatusBadgeConfig(newStatus).shortLabel}`);
    } catch (err) {
      showToast("⚠️ Erro ao alterar status.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save updated preparation time
  const handleSavePreparationTime = async (sale: Sale) => {
    const formattedTime = formatPrepTimeString(editPrepDays, editPrepHours);
    setIsProcessing(true);
    try {
      await onUpdateSaleStatus(sale.id, {
        preparationTime: formattedTime
      });

      if (activeSaleDetail && activeSaleDetail.id === sale.id) {
        setActiveSaleDetail({
          ...activeSaleDetail,
          preparationTime: formattedTime
        });
      }

      showToast(`✓ Tempo de preparação atualizado: ${formattedTime}`);
      setEditPrepTimeSaleId(null);
    } catch (err) {
      showToast("⚠️ Erro ao atualizar tempo de preparação.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Cancel Sale & Restock
  const handleConfirmCancelSale = async () => {
    if (!saleToCancel) return;
    setIsProcessing(true);
    try {
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

      const newHistory = [
        ...(saleToCancel.orderStatusHistory || []),
        {
          status: "cancelado",
          timestamp: new Date().toISOString(),
          note: "Pedido cancelado pelo administrador. Estoque estornado."
        }
      ];

      await onUpdateSaleStatus(saleToCancel.id, {
        status: "cancelada",
        orderStatus: "cancelado",
        orderStatusHistory: newHistory
      });

      if (activeSaleDetail && activeSaleDetail.id === saleToCancel.id) {
        setActiveSaleDetail({
          ...activeSaleDetail,
          status: "cancelada",
          orderStatus: "cancelado",
          orderStatusHistory: newHistory
        });
      }

      showToast("✓ Pedido cancelado e itens estornados no estoque!");
      setSaleToCancel(null);
    } catch (err) {
      showToast("⚠️ Erro ao cancelar pedido.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete Permanently
  const handleConfirmDeleteSale = async () => {
    if (!saleToDelete) return;
    setIsProcessing(true);
    try {
      await onDeleteSale(saleToDelete.id);
      showToast("✓ Pedido excluído definitivamente!");
      if (activeSaleDetail && activeSaleDetail.id === saleToDelete.id) {
        setActiveSaleDetail(null);
      }
      setSaleToDelete(null);
    } catch (err) {
      showToast("⚠️ Erro ao excluir pedido.");
    } finally {
      setIsProcessing(false);
    }
  };

  // WhatsApp status update message generator
  const sendWhatsAppStatusUpdate = (sale: Sale) => {
    const cleanPhone = sale.clientPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      showToast("⚠️ Cliente sem telefone cadastrado.");
      return;
    }

    const orderStatus = getSaleOrderStatus(sale);
    let statusText = "";
    if (orderStatus === "aguardando_validacao") {
      statusText = "⏳ *Aguardando Confirmação / Pagamento*.\nPor favor, nos envie o comprovante Pix ou informe quando o pagamento for realizado para iniciarmos a preparação!";
    } else if (orderStatus === "preparando") {
      statusText = `⚙️ *Em Preparação / Separação!*\nNosso time já está preparando os seus produtos.\n⏱️ *Prazo Prometido:* ${sale.preparationTime || "Conforme combinado"}`;
    } else if (orderStatus === "entregue") {
      statusText = "✅ *Pedido Concluído / Entregue!*\nSeu pedido foi entregue com sucesso. Muito obrigado pela preferência!";
    } else {
      statusText = "❌ *Pedido Cancelado*.";
    }

    const itemsSummary = sale.items
      .map((i) => `• ${i.quantity}x ${i.productName}${i.selectedColor ? ` (${i.selectedColor})` : ""}`)
      .join("\n");

    const text = encodeURIComponent(
      `Olá, *${sale.clientName}*! 👋\n\n` +
      `Atualização do seu pedido na *Thyago Tech*:\n\n` +
      `📦 *Pedido:* #${sale.id.slice(-5)}\n` +
      `📊 *Status Atual:* ${statusText}\n\n` +
      `🛍️ *Itens:* \n${itemsSummary}\n\n` +
      `💰 *Total:* ${formatPrice(sale.total)}\n` +
      `🚚 *Modalidade:* ${sale.deliveryType === "entrega" ? "Entrega" : "Retirada"}\n` +
      (sale.consultantName ? `👤 *Consultor:* ${sale.consultantName}\n` : "") +
      `\nQualquer dúvida estamos à total disposição!`
    );

    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-2.5 pb-24 max-w-lg mx-auto w-full px-0.5">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-3 right-3 z-50 max-w-sm mx-auto bg-emerald-400 text-black px-4 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center justify-between border border-emerald-300"
          >
            <span className="truncate">{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="ml-2 p-1 text-black/80 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPACT MOBILE HEADER: Title + Quick PDV Button */}
      <div className="bg-gradient-to-r from-[#0a1b24] via-[#08151f] to-[#050e14] border border-emerald-950/80 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-black flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white tracking-tight truncate flex items-center gap-1.5">
                Acompanhar Pedidos
              </h2>
              <p className="text-[10px] text-gray-400 truncate">
                {sales.length} no histórico • {countAguardando + countPreparando} em andamento
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToPDV}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer active:scale-95 flex-shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Venda</span>
          </button>
        </div>

        {/* 3-STEP PIPELINE TABS (Mobile Touch Target 44px) */}
        <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-emerald-950/60">
          {/* Step 1: Validação */}
          <button
            onClick={() => setSelectedFilter("aguardando_validacao")}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px] relative ${
              selectedFilter === "aguardando_validacao"
                ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20"
                : "bg-[#050b11] text-amber-300 border-amber-500/30 hover:border-amber-500/60"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${selectedFilter === "aguardando_validacao" ? "bg-black" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">1. Validação</span>
            </div>
            <span className="text-sm font-black mt-0.5">
              {countAguardando}
            </span>
          </button>

          {/* Step 2: Preparação */}
          <button
            onClick={() => setSelectedFilter("preparando")}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px] relative ${
              selectedFilter === "preparando"
                ? "bg-cyan-400 text-black border-cyan-400 shadow-md shadow-cyan-500/20"
                : "bg-[#050b11] text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${selectedFilter === "preparando" ? "bg-black" : "bg-cyan-400 animate-ping"}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">2. Preparando</span>
            </div>
            <span className="text-sm font-black mt-0.5">
              {countPreparando}
            </span>
          </button>

          {/* Step 3: Entregues */}
          <button
            onClick={() => setSelectedFilter("entregue")}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px] relative ${
              selectedFilter === "entregue"
                ? "bg-emerald-400 text-black border-emerald-400 shadow-md shadow-emerald-500/20"
                : "bg-[#050b11] text-emerald-300 border-emerald-950/80 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${selectedFilter === "entregue" ? "bg-black" : "bg-emerald-400"}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">3. Entregues</span>
            </div>
            <span className="text-sm font-black mt-0.5">
              {countEntregue}
            </span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR & FILTER TOGGLES */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, fone, #ID ou produto..."
            className="w-full bg-[#08121a] border border-emerald-950/80 focus:border-emerald-500/70 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick 'Todos' Filter Pill */}
        <button
          onClick={() => setSelectedFilter("todas")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1 ${
            selectedFilter === "todas"
              ? "bg-emerald-500 text-black font-black"
              : "bg-[#08121a] text-gray-300 border border-emerald-950 hover:text-white"
          }`}
        >
          <span>Todos ({countTotal})</span>
        </button>

        {/* Quick 'Cancelados' Pill if any */}
        {countCancelado > 0 && (
          <button
            onClick={() => setSelectedFilter("cancelado")}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1 ${
              selectedFilter === "cancelado"
                ? "bg-rose-500 text-white font-black"
                : "bg-[#08121a] text-rose-400 border border-rose-950"
            }`}
            title="Ver cancelados"
          >
            <AlertCircle className="w-3 h-3" />
            <span>({countCancelado})</span>
          </button>
        )}
      </div>

      {/* ACTIVE FILTER LABEL */}
      {selectedFilter !== "todas" && (
        <div className="flex items-center justify-between px-1 text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-emerald-400" />
            Filtrando por: <strong className="text-white capitalize">{selectedFilter.replace("_", " ")}</strong>
          </span>
          <button
            onClick={() => setSelectedFilter("todas")}
            className="text-emerald-400 hover:underline font-bold"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* ORDERS LIST CONTAINER */}
      <div className="flex flex-col gap-2.5">
        {filteredSales.length === 0 ? (
          <div className="bg-[#08121a] border border-emerald-950/60 rounded-2xl p-6 text-center flex flex-col items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Nenhum pedido encontrado</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {searchTerm
                  ? "Nenhum resultado para a busca."
                  : "Não há pedidos neste status."}
              </p>
            </div>
            <button
              onClick={onNavigateToPDV}
              className="mt-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Registrar Venda</span>
            </button>
          </div>
        ) : (
          filteredSales.map((sale) => {
            const orderStatus = getSaleOrderStatus(sale);
            const badge = getStatusBadgeConfig(orderStatus);
            const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <motion.div
                key={sale.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`bg-[#08121a] border rounded-2xl overflow-hidden transition-all shadow-md ${
                  orderStatus === "aguardando_validacao"
                    ? "border-amber-500/40 hover:border-amber-500/70"
                    : orderStatus === "preparando"
                    ? "border-cyan-500/40 hover:border-cyan-500/70"
                    : orderStatus === "entregue"
                    ? "border-emerald-500/30 hover:border-emerald-500/60"
                    : "border-rose-900/50 opacity-75"
                }`}
              >
                {/* CARD TOP BAR: ID, Status, and Time */}
                <div className="px-3 py-2 bg-[#091622] border-b border-emerald-950/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-black text-white bg-emerald-950 border border-emerald-800/60 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      #{sale.id.slice(-5)}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {formatDateTimeBR(sale.createdAt)}
                    </span>
                  </div>

                  {/* Status Pill Badge */}
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border flex-shrink-0 ${badge.colorClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor} ${orderStatus === "preparando" ? "animate-ping" : ""}`} />
                    <span>{badge.shortLabel}</span>
                  </div>
                </div>

                {/* CARD BODY: Mobile-Dense Structure */}
                <div className="p-3 flex flex-col gap-2">
                  {/* Client name & Total */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <h4 className="text-xs font-black text-white truncate">{sale.clientName}</h4>
                      </div>
                      {sale.clientPhone && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate pl-5">
                          {sale.clientPhone}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-emerald-400 block">
                        {formatPrice(sale.total)}
                      </span>
                      <span className={`text-[9px] font-bold px-1 py-0.2 rounded inline-block ${
                        sale.paymentStatus === "pago"
                          ? "bg-emerald-950 text-emerald-400"
                          : sale.paymentStatus === "na_entrega"
                          ? "bg-blue-950 text-blue-300"
                          : "bg-amber-950 text-amber-300"
                      }`}>
                        {sale.paymentStatus === "pago" ? "Pago" : sale.paymentStatus === "na_entrega" ? "Pagar na Entrega" : "A Prazo"}
                      </span>
                    </div>
                  </div>

                  {/* Products summary inline list */}
                  <div className="bg-[#050b11] border border-emerald-950/50 rounded-xl p-2 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-300">
                      <span className="font-bold text-gray-300 flex items-center gap-1">
                        <Package className="w-3 h-3 text-emerald-400" />
                        {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                      </span>
                      {sale.consultantName && (
                        <span className="text-[10px] text-emerald-300 font-bold bg-[#0d221c] px-1.5 py-0.2 rounded border border-emerald-700/40">
                          {sale.consultantName}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1">
                      {sale.items.map((i) => `${i.quantity}x ${i.productName}${i.selectedColor ? ` (${i.selectedColor})` : ""}`).join(", ")}
                    </p>
                  </div>

                  {/* Prazo de Preparação / Entrega Prometido */}
                  <div className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                    orderStatus === "preparando"
                      ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-200"
                      : orderStatus === "aguardando_validacao"
                      ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                      : "bg-[#060c12] border-emerald-950/60 text-gray-300"
                  }`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">Prazo:</span>
                        <span className="text-[11px] font-black text-white truncate block">
                          {sale.preparationTime || "Pronta Entrega"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditPrepTimeSaleId(sale.id);
                        setEditPrepDays("0");
                        setEditPrepHours("0");
                      }}
                      className="text-[10px] font-bold text-gray-300 hover:text-white px-2 py-1 rounded-lg bg-[#0b1b26] border border-gray-700/50 flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Alterar</span>
                    </button>
                  </div>

                  {/* Inline Quick Prazo Editor if opened */}
                  {editPrepTimeSaleId === sale.id && (
                    <div className="p-2.5 bg-[#07131e] border border-cyan-500/50 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-cyan-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          Tempo de Preparação
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                            {formatPrepTimeString(editPrepDays, editPrepHours)}
                          </span>
                          <button
                            onClick={() => setEditPrepTimeSaleId(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-gray-300 block mb-0.5">Dias</label>
                          <input
                            type="number"
                            min="0"
                            max="365"
                            value={editPrepDays}
                            onChange={(e) => setEditPrepDays(e.target.value)}
                            onFocus={(e) => e.target.value === "0" && setEditPrepDays("")}
                            onBlur={(e) => !e.target.value && setEditPrepDays("0")}
                            placeholder="0"
                            className="w-full bg-[#050b11] border border-cyan-700/60 rounded-lg px-2 py-1 text-xs text-white text-center font-black focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-gray-300 block mb-0.5">Horas</label>
                          <input
                            type="number"
                            min="0"
                            max="240"
                            value={editPrepHours}
                            onChange={(e) => setEditPrepHours(e.target.value)}
                            onFocus={(e) => e.target.value === "0" && setEditPrepHours("")}
                            onBlur={(e) => !e.target.value && setEditPrepHours("0")}
                            placeholder="0"
                            className="w-full bg-[#050b11] border border-cyan-700/60 rounded-lg px-2 py-1 text-xs text-white text-center font-black focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleSavePreparationTime(sale)}
                        disabled={isProcessing}
                        className="w-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        Salvar Tempo de Preparação
                      </button>
                    </div>
                  )}

                  {/* Delivery Location Note */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                    <span className="flex items-center gap-1 truncate">
                      {sale.deliveryType === "entrega" ? (
                        <>
                          <Truck className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{sale.deliveryAddress?.neighborhood || "Entrega no endereço"}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{sale.pickupLocation || "Retirada na loja"}</span>
                        </>
                      )}
                    </span>
                    {sale.deliveryDate && (
                      <span className="text-gray-400 flex-shrink-0">
                        Prev: {sale.deliveryDate.split("-").reverse().slice(0, 2).join("/")}
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER: 1-TOUCH THUMB ACTION BUTTONS */}
                <div className="p-2.5 bg-[#091622] border-t border-emerald-950/40 flex items-center gap-1.5">
                  {/* Step 1 to Step 2 Primary Action */}
                  {orderStatus === "aguardando_validacao" && (
                    <button
                      onClick={() => handleApprovePaymentAndPrepare(sale)}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black font-black text-xs py-2.5 px-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[44px]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span className="truncate">Aprovar & Iniciar Preparo</span>
                    </button>
                  )}

                  {/* Step 2 to Step 3 Primary Action */}
                  {orderStatus === "preparando" && (
                    <button
                      onClick={() => handleMarkAsDelivered(sale)}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs py-2.5 px-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span className="truncate">Marcar como Entregue</span>
                    </button>
                  )}

                  {/* Completed / Delivered Badge */}
                  {orderStatus === "entregue" && (
                    <div className="flex-1 bg-emerald-950/60 border border-emerald-600/30 text-emerald-300 text-[11px] font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1 min-h-[40px]">
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      <span>Pedido Entregue</span>
                    </div>
                  )}

                  {/* Cancelled Badge */}
                  {orderStatus === "cancelado" && (
                    <div className="flex-1 bg-rose-950/60 border border-rose-600/30 text-rose-300 text-[11px] font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1 min-h-[40px]">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Pedido Cancelado</span>
                    </div>
                  )}

                  {/* WhatsApp Direct Notification */}
                  <button
                    onClick={() => sendWhatsAppStatusUpdate(sale)}
                    className="bg-[#0f2c20] hover:bg-[#153e2d] text-emerald-300 border border-emerald-600/50 w-11 h-11 rounded-xl transition-all cursor-pointer flex items-center justify-center flex-shrink-0 active:scale-95"
                    title="Enviar atualização no WhatsApp"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                  </button>

                  {/* Bottom Sheet Details Button */}
                  <button
                    onClick={() => setActiveSaleDetail(sale)}
                    className="bg-[#0a1b26] hover:bg-[#102738] text-gray-300 border border-emerald-950/80 w-11 h-11 rounded-xl transition-all cursor-pointer flex items-center justify-center flex-shrink-0 active:scale-95"
                    title="Ver detalhes completos"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* =================================================================== */}
      {/* ============= BOTTOM SHEET: DETALHES DO PEDIDO (MOBILE) ============ */}
      {/* =================================================================== */}
      <AnimatePresence>
        {activeSaleDetail && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-0">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="w-full max-w-lg bg-[#070e17] border-t border-emerald-500/40 rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-gray-100 pb-6"
            >
              {/* Bottom Sheet Handle & Header */}
              <div className="p-3.5 border-b border-emerald-950/60 bg-[#091622] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">
                      Pedido #{activeSaleDetail.id.slice(-5)}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {formatDateTimeBR(activeSaleDetail.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSaleDetail(null)}
                  className="w-8 h-8 rounded-full bg-[#0d202e] text-gray-300 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
                {/* 1. Status Fast-Switcher */}
                <div className="bg-[#050c13] border border-emerald-950/80 rounded-2xl p-2.5">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase">
                    Alterar Status do Pedido:
                  </span>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Validação */}
                    <button
                      onClick={() => handleChangeOrderStatus(activeSaleDetail, "aguardando_validacao")}
                      className={`p-2 rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[44px] ${
                        getSaleOrderStatus(activeSaleDetail) === "aguardando_validacao"
                          ? "bg-amber-400 text-black border-amber-400 shadow-md"
                          : "bg-[#081520] text-amber-300 border-amber-500/30"
                      }`}
                    >
                      <span>1. Validação</span>
                    </button>

                    {/* Preparando */}
                    <button
                      onClick={() => handleChangeOrderStatus(activeSaleDetail, "preparando")}
                      className={`p-2 rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[44px] ${
                        getSaleOrderStatus(activeSaleDetail) === "preparando"
                          ? "bg-cyan-400 text-black border-cyan-400 shadow-md"
                          : "bg-[#081520] text-cyan-300 border-cyan-500/30"
                      }`}
                    >
                      <span>2. Preparando</span>
                    </button>

                    {/* Entregue */}
                    <button
                      onClick={() => handleChangeOrderStatus(activeSaleDetail, "entregue")}
                      className={`p-2 rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[44px] ${
                        getSaleOrderStatus(activeSaleDetail) === "entregue"
                          ? "bg-emerald-400 text-black border-emerald-400 shadow-md"
                          : "bg-[#081520] text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      <span>3. Entregue</span>
                    </button>
                  </div>
                </div>

                {/* 2. Client Info Card */}
                <div className="bg-[#050c13] border border-emerald-950/80 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Cliente</span>
                      <h4 className="text-xs font-black text-white">{activeSaleDetail.clientName}</h4>
                      <p className="text-[11px] text-gray-300">{activeSaleDetail.clientPhone || "Sem telefone"}</p>
                    </div>

                    <button
                      onClick={() => sendWhatsAppStatusUpdate(activeSaleDetail)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {activeSaleDetail.consultantName && (
                    <div className="pt-2 border-t border-gray-800/60 flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Consultor: {activeSaleDetail.consultantName}</span>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-gray-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Prazo de Preparação:</span>
                    <span className="font-black text-cyan-300">
                      {activeSaleDetail.preparationTime || "Pronta Entrega"}
                    </span>
                  </div>
                </div>

                {/* 3. Items Breakdown */}
                <div className="bg-[#050c13] border border-emerald-950/80 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">
                    Produtos ({activeSaleDetail.items.length})
                  </span>

                  <div className="space-y-1.5">
                    {activeSaleDetail.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#091520] border border-emerald-950/60 rounded-xl p-2 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-8 h-8 object-cover rounded-lg border border-emerald-950/80 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                              {item.selectedColor && (
                                <span className="text-emerald-300">
                                  Cor: {item.selectedColor} •
                                </span>
                              )}
                              <span>{item.quantity}x {formatPrice(item.unitPrice)}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-black text-emerald-400 flex-shrink-0">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Totals */}
                  <div className="mt-2.5 pt-2 border-t border-gray-800/60 space-y-1 text-xs">
                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Subtotal:</span>
                      <span>{formatPrice(activeSaleDetail.subtotal)}</span>
                    </div>

                    {activeSaleDetail.discount ? (
                      <div className="flex justify-between text-rose-400 text-[11px]">
                        <span>Desconto:</span>
                        <span>- {formatPrice(activeSaleDetail.discount)}</span>
                      </div>
                    ) : null}

                    {activeSaleDetail.deliveryFee ? (
                      <div className="flex justify-between text-blue-400 text-[11px]">
                        <span>Taxa de Entrega:</span>
                        <span>+ {formatPrice(activeSaleDetail.deliveryFee)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between text-xs font-black text-white pt-1 border-t border-gray-800">
                      <span>Total:</span>
                      <span className="text-emerald-400">{formatPrice(activeSaleDetail.total)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Delivery Address */}
                <div className="bg-[#050c13] border border-emerald-950/80 rounded-2xl p-3 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">
                    Envio & Endereço
                  </span>

                  {activeSaleDetail.deliveryType === "entrega" ? (
                    <div className="text-[11px] text-gray-300">
                      <p className="font-bold text-blue-300 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Entrega no Endereço
                      </p>
                      <p className="mt-0.5">
                        {activeSaleDetail.deliveryAddress?.street}, {activeSaleDetail.deliveryAddress?.number}
                        {activeSaleDetail.deliveryAddress?.complement ? ` (${activeSaleDetail.deliveryAddress.complement})` : ""} - {activeSaleDetail.deliveryAddress?.neighborhood}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-300">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Retirada no Balcão
                      </p>
                      <p className="mt-0.5">{activeSaleDetail.pickupLocation || "Loja Principal"}</p>
                    </div>
                  )}

                  {activeSaleDetail.notes && (
                    <p className="pt-1.5 border-t border-gray-800 text-[10px] text-gray-400 mt-1">
                      <span className="font-bold text-gray-300">Obs: </span>
                      {activeSaleDetail.notes}
                    </p>
                  )}
                </div>

                {/* 5. Danger Zone: Cancel & Delete */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => {
                      setSaleToCancel(activeSaleDetail);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 p-2 rounded-xl flex items-center gap-1 border border-rose-950"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>Cancelar & Estornar</span>
                  </button>

                  <button
                    onClick={() => {
                      setSaleToDelete(activeSaleDetail);
                    }}
                    className="text-[11px] text-gray-400 hover:text-rose-300 p-2 rounded-xl flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* ================= MODAL DE CANCELAMENTO & ESTORNO ================= */}
      {/* =================================================================== */}
      <AnimatePresence>
        {saleToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#08121a] border border-rose-500/40 rounded-2xl p-4 shadow-2xl text-gray-100 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>

              <div className="text-center">
                <h3 className="text-sm font-black text-white">Cancelar Pedido #{saleToCancel.id.slice(-5)}?</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cliente: <strong className="text-white">{saleToCancel.clientName}</strong>
                </p>
                <div className="mt-2.5 p-2.5 bg-[#050a0f] border border-rose-950 rounded-xl text-left text-[11px] text-rose-300">
                  <p className="font-bold flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Estorno automático:
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    As quantidades dos produtos serão devolvidas ao estoque.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setSaleToCancel(null)}
                  disabled={isProcessing}
                  className="bg-[#0c1c2a] text-gray-300 text-xs font-bold py-2.5 rounded-xl hover:bg-[#11273b] transition-all cursor-pointer min-h-[44px]"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmCancelSale}
                  disabled={isProcessing}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1 min-h-[44px]"
                >
                  {isProcessing ? "Cancelando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* ================= MODAL DE EXCLUSÃO DEFINITIVA ==================== */}
      {/* =================================================================== */}
      <AnimatePresence>
        {saleToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#08121a] border border-rose-500/40 rounded-2xl p-4 shadow-2xl text-gray-100 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>

              <div className="text-center">
                <h3 className="text-sm font-black text-white">Excluir Registro de Venda?</h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Esta ação não pode ser desfeita e removerá o pedido definitivamente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setSaleToDelete(null)}
                  disabled={isProcessing}
                  className="bg-[#0c1c2a] text-gray-300 text-xs font-bold py-2.5 rounded-xl hover:bg-[#11273b] transition-all cursor-pointer min-h-[44px]"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmDeleteSale}
                  disabled={isProcessing}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1 min-h-[44px]"
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
