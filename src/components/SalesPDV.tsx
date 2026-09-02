import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  User,
  Phone,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  CreditCard,
  Banknote,
  QrCode,
  Clock,
  Send,
  X
} from "lucide-react";
import { Product, Sale, SaleItem } from "../types";

interface SalesPDVProps {
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  onSaveSale: (sale: Sale) => Promise<void>;
  onViewHistory: () => void;
  onNavigateToTracker?: () => void;
}

export default function SalesPDV({
  products,
  onSaveProducts,
  onSaveSale,
  onViewHistory,
  onNavigateToTracker
}: SalesPDVProps) {
  // Today date helper (YYYY-MM-DD)
  const getTodayDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper to format days and hours into readable string
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

  // Form States
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [consultantName, setConsultantName] = useState("Thyago");
  const [prepDays, setPrepDays] = useState<string>("0");
  const [prepHours, setPrepHours] = useState<string>("0");
  const [orderInitialStatus, setOrderInitialStatus] = useState<"aguardando_validacao" | "preparando">("preparando");
  const [deliveryType, setDeliveryType] = useState<"entrega" | "retirada">("retirada");

  // Delivery fields
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<string>("");

  // Pickup fields
  const [pickupLocation, setPickupLocation] = useState("");

  // Dates
  const [deliveryDate, setDeliveryDate] = useState<string>(getTodayDateStr());
  const [dueDate, setDueDate] = useState<string>("");

  // Items in Sale
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>("");
  const [selectedVariationToAdd, setSelectedVariationToAdd] = useState<string>("");
  const [itemQuantityToAdd, setItemQuantityToAdd] = useState<number>(1);
  const [itemCustomPrice, setItemCustomPrice] = useState<string>("");

  // Product search filter
  const [prodSearch, setProdSearch] = useState("");

  // Financials
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  const [paymentStatus, setPaymentStatus] = useState<"pago" | "na_entrega" | "a_prazo">("pago");
  const [discount, setDiscount] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finishedSale, setFinishedSale] = useState<Sale | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected product object
  const currentProduct = products.find((p) => p.id === selectedProductToAdd);

  // Available stock calculation for the selected item / variation
  const getAvailableStock = (prod: Product | undefined, variation: string) => {
    if (!prod) return 0;
    if (prod.colorStockControl && prod.colors && prod.colors.length > 0) {
      if (!variation) return 0;
      const foundColor = prod.colors.find((c) => c.color === variation);
      return foundColor ? Number(foundColor.stock) : 0;
    }
    return Number(prod.stock) || 0;
  };

  const availableStockForCurrent = getAvailableStock(currentProduct, selectedVariationToAdd);

  // Handle Product Selection Change
  const handleSelectProduct = (productId: string) => {
    setSelectedProductToAdd(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      if (prod.colorStockControl && prod.colors && prod.colors.length > 0) {
        // Select first variation with stock, or first variation
        const firstWithStock = prod.colors.find((c) => c.stock > 0) || prod.colors[0];
        setSelectedVariationToAdd(firstWithStock ? firstWithStock.color : "");
      } else {
        setSelectedVariationToAdd("");
      }
      setItemCustomPrice(prod.price.toString());
      setItemQuantityToAdd(1);
    }
  };

  // Add Item to PDV Cart
  const handleAddItem = () => {
    setErrorMessage(null);
    if (!currentProduct) {
      setErrorMessage("Por favor, selecione um produto.");
      return;
    }

    if (currentProduct.colorStockControl && currentProduct.colors && currentProduct.colors.length > 0 && !selectedVariationToAdd) {
      setErrorMessage("Selecione a variação/cor do produto.");
      return;
    }

    const available = getAvailableStock(currentProduct, selectedVariationToAdd);
    
    // Check how many already in cart
    const alreadyInCart = saleItems
      .filter((i) => i.productId === currentProduct.id && (!currentProduct.colorStockControl || i.selectedColor === selectedVariationToAdd))
      .reduce((sum, i) => sum + i.quantity, 0);

    if (alreadyInCart + itemQuantityToAdd > available) {
      setErrorMessage(
        `Estoque insuficiente! Disponível: ${available} un. (Já há ${alreadyInCart} no carrinho do PDV).`
      );
      return;
    }

    const unitPrice = parseFloat(itemCustomPrice) || currentProduct.price;

    const newItem: SaleItem = {
      productId: currentProduct.id,
      productName: currentProduct.name,
      productImage: currentProduct.images && currentProduct.images.length > 0 ? currentProduct.images[0] : undefined,
      unitPrice: unitPrice,
      quantity: itemQuantityToAdd,
      selectedColor: currentProduct.colorStockControl ? selectedVariationToAdd : undefined,
      total: unitPrice * itemQuantityToAdd
    };

    setSaleItems((prev) => [...prev, newItem]);

    // Reset item selector
    setSelectedProductToAdd("");
    setSelectedVariationToAdd("");
    setItemQuantityToAdd(1);
    setItemCustomPrice("");
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Subtotal & Calculations
  const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
  const numDeliveryFee = parseFloat(deliveryFee) || 0;
  const numDiscount = parseFloat(discount) || 0;
  const finalTotal = Math.max(0, subtotal + numDeliveryFee - numDiscount);

  // Quick Pickup Presets
  const pickupPresets = [
    "Em frente ao Shopping",
    "Posto de Combustível Central",
    "Estação de Metrô / Terminal",
    "Retirada no Centro",
    "A combinar com cliente via WhatsApp"
  ];

  // Finalize Sale
  const handleFinalizeSale = async () => {
    setErrorMessage(null);

    if (!clientName.trim()) {
      setErrorMessage("Por favor, preencha o nome do cliente.");
      return;
    }

    if (saleItems.length === 0) {
      setErrorMessage("Adicione pelo menos 1 produto à venda.");
      return;
    }

    if (deliveryType === "entrega" && (!street.trim() || !neighborhood.trim())) {
      setErrorMessage("Preencha ao menos a Rua e o Bairro para entrega.");
      return;
    }

    if (deliveryType === "retirada" && !pickupLocation.trim()) {
      setErrorMessage("Defina o local de retirada ou ponto de encontro.");
      return;
    }

    if (paymentStatus === "a_prazo" && !dueDate) {
      setErrorMessage("Para vendas A Prazo, defina a Data Limite de Pagamento.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Deduct Stock from Products in State & Cloud
      const updatedProductsList: Product[] = JSON.parse(JSON.stringify(products));

      for (const item of saleItems) {
        const prodIndex = updatedProductsList.findIndex((p) => p.id === item.productId);
        if (prodIndex !== -1) {
          const targetProd = updatedProductsList[prodIndex];
          // Deduct from general stock
          targetProd.stock = Math.max(0, (targetProd.stock || 0) - item.quantity);

          // If variation control is active, deduct from variation stock
          if (targetProd.colorStockControl && item.selectedColor && Array.isArray(targetProd.colors)) {
            const colorIndex = targetProd.colors.findIndex((c) => c.color === item.selectedColor);
            if (colorIndex !== -1) {
              targetProd.colors[colorIndex].stock = Math.max(
                0,
                (targetProd.colors[colorIndex].stock || 0) - item.quantity
              );
            }
          }
        }
      }

      // 2. Build Sale Record
      const newSaleId = "sale_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const calculatedOrderStatus = orderInitialStatus || (paymentStatus === "pago" ? "preparando" : "aguardando_validacao");
      const newSale: Sale = {
        id: newSaleId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        consultantName: consultantName.trim() || "Thyago",
        deliveryType,
        deliveryAddress:
          deliveryType === "entrega"
            ? {
                street: street.trim(),
                number: number.trim(),
                neighborhood: neighborhood.trim(),
                complement: complement.trim(),
                city: "Recife / Região"
              }
            : undefined,
        deliveryFee: numDeliveryFee,
        pickupLocation: deliveryType === "retirada" ? pickupLocation.trim() : undefined,
        deliveryDate,
        preparationTime: formatPrepTimeString(prepDays, prepHours),
        items: saleItems,
        subtotal,
        discount: numDiscount,
        total: finalTotal,
        paymentMethod,
        paymentStatus,
        dueDate: paymentStatus === "a_prazo" ? dueDate : undefined,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        status: "concluida",
        orderStatus: calculatedOrderStatus,
        orderStatusHistory: [
          {
            status: calculatedOrderStatus,
            timestamp: new Date().toISOString(),
            note: "Pedido lançado no PDV."
          }
        ]
      };

      // 3. Save Products & Sale
      onSaveProducts(updatedProductsList);
      await onSaveSale(newSale);

      setFinishedSale(newSale);
    } catch (err: any) {
      console.error("Erro ao registrar venda:", err);
      setErrorMessage("Erro ao salvar no banco de dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form for new sale
  const handleResetForm = () => {
    setClientName("");
    setClientPhone("");
    setConsultantName("Thyago");
    setPrepDays("0");
    setPrepHours("0");
    setOrderInitialStatus("preparando");
    setDeliveryType("retirada");
    setStreet("");
    setNumber("");
    setNeighborhood("");
    setComplement("");
    setDeliveryFee("");
    setPickupLocation("");
    setDeliveryDate(getTodayDateStr());
    setDueDate("");
    setSaleItems([]);
    setSelectedProductToAdd("");
    setSelectedVariationToAdd("");
    setItemQuantityToAdd(1);
    setItemCustomPrice("");
    setPaymentMethod("pix");
    setPaymentStatus("pago");
    setDiscount("");
    setNotes("");
    setFinishedSale(null);
    setCopiedReceipt(false);
    setErrorMessage(null);
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

  // Generate WhatsApp Receipt
  const generateWhatsAppReceipt = (sale: Sale) => {
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

    const orderStatusText =
      sale.orderStatus === "aguardando_validacao"
        ? "⏳ *Aguardando Confirmação*"
        : sale.orderStatus === "preparando"
        ? "⚙️ *Preparando Pedido*"
        : "✅ *Entregue / Concluído*";

    const deliveryDetailText =
      sale.deliveryType === "entrega"
        ? `📍 *Entrega:* ${sale.deliveryAddress?.street}, ${sale.deliveryAddress?.number} - ${sale.deliveryAddress?.neighborhood}${sale.deliveryAddress?.complement ? ` (${sale.deliveryAddress.complement})` : ""}`
        : `📍 *Retirada:* ${sale.pickupLocation}`;

    return `🛍️ *THYAGO TECH - RESUMO DO PEDIDO*
---------------------------------------
👤 *Cliente:* ${sale.clientName}
🧑‍💼 *Consultor:* ${sale.consultantName || "Thyago"}
⏱️ *Prazo de Preparação:* ${sale.preparationTime || "Pronta Entrega"}
📅 *Data Prevista:* ${formatDateBR(sale.deliveryDate)}
${deliveryDetailText}

📦 *ITENS DO PEDIDO:*
${itemsText}
${sale.deliveryFee ? `\n🛵 *Taxa de Entrega:* ${formatPrice(sale.deliveryFee)}` : ""}
${sale.discount ? `🏷️ *Desconto:* -${formatPrice(sale.discount)}` : ""}
💰 *VALOR TOTAL:* *${formatPrice(sale.total)}*

💳 *Forma de Pagamento:* ${sale.paymentMethod.toUpperCase()}
📌 *Status do Pagamento:* ${paymentStatusText}
🔄 *Status do Pedido:* ${orderStatusText}
---------------------------------------
_Obrigado pela preferência! Qualquer dúvida estamos à disposição._`;
  };

  const handleCopyReceipt = () => {
    if (!finishedSale) return;
    const text = generateWhatsAppReceipt(finishedSale);
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    if (!finishedSale) return;
    const cleanPhone = finishedSale.clientPhone.replace(/\D/g, "");
    const text = encodeURIComponent(generateWhatsAppReceipt(finishedSale));
    const phoneParam = cleanPhone ? (cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`) : "";
    const url = phoneParam ? `https://wa.me/${phoneParam}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  // Filtered product options for search
  const filteredProducts = products.filter((p) => {
    if (!prodSearch.trim()) return true;
    const term = prodSearch.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#071720] to-[#08121a] border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Registrar Nova Venda <span className="text-[10px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase">PDV</span>
            </h2>
            <p className="text-[11px] text-gray-400">Lançamento de pedidos, WhatsApp e baixa automática de estoque</p>
          </div>
        </div>

        <button
          onClick={onViewHistory}
          className="px-3 py-2 bg-[#0d1f2d] hover:bg-[#132c40] border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ver Histórico</span>
        </button>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2 shadow-lg animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* 1. DADOS DO CLIENTE */}
      <div className="bg-[#08121a] border border-emerald-950/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-emerald-950/60 pb-2.5">
          <User className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">1. Dados do Cliente</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">
              Nome do Cliente <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Carlos Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-[#050b11] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">
              WhatsApp / Telefone
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="(81) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-[#050b11] border border-emerald-950 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Consultor / Vendedor */}
        <div className="pt-2 border-t border-emerald-950/40 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Consultor / Vendedor Responsável
            </span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["Thyago", "Balcão", "Consultor 1", "Consultor 2"].map((seller) => (
              <button
                key={seller}
                type="button"
                onClick={() => setConsultantName(seller)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  consultantName === seller
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-sm"
                    : "bg-[#050b11] text-gray-400 border-emerald-950 hover:border-emerald-500/30 hover:text-white"
                }`}
              >
                {seller}
              </button>
            ))}
            <input
              type="text"
              value={consultantName}
              onChange={(e) => setConsultantName(e.target.value)}
              placeholder="Ou digite o nome do consultor..."
              className="flex-1 min-w-[140px] bg-[#050b11] border border-emerald-950 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. MODALIDADE DE ENVIO, PRAZO & DATA */}
      <div className="bg-[#08121a] border border-emerald-950/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center gap-2 border-b border-emerald-950/60 pb-2.5">
          <Truck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">2. Envio & Prazo de Preparação</h3>
        </div>

        {/* Toggle Entrega vs Retirada */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#050b11] rounded-xl border border-emerald-950">
          <button
            type="button"
            onClick={() => setDeliveryType("retirada")}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deliveryType === "retirada"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Retirada / Ponto de Encontro</span>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryType("entrega")}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deliveryType === "entrega"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Entrega a Domicílio</span>
          </button>
        </div>

        {/* Retirada fields */}
        {deliveryType === "retirada" && (
          <div className="flex flex-col gap-2.5 bg-[#050b11]/60 p-3 rounded-xl border border-emerald-950/60">
            <label className="text-[11px] font-bold text-gray-300">
              Local da Retirada / Ponto de Encontro Combinado <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Em frente ao Shopping Recife / Posto Shell"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pickupPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPickupLocation(preset)}
                  className="text-[10px] bg-[#0c1c28] hover:bg-emerald-500/20 hover:text-emerald-300 text-gray-400 border border-emerald-950 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Entrega fields */}
        {deliveryType === "entrega" && (
          <div className="flex flex-col gap-2.5 bg-[#050b11]/60 p-3 rounded-xl border border-emerald-950/60">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-300 block mb-1">
                  Rua / Avenida <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome da rua"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">Número</label>
                <input
                  type="text"
                  placeholder="Nº"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">
                  Bairro <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">Complemento / Ref.</label>
                <input
                  type="text"
                  placeholder="Apto, bloco, próx a..."
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-300 block mb-1">Taxa de Entrega (R$)</label>
              <input
                type="number"
                step="0.50"
                placeholder="Ex: 10.00 (ou deixe 0 se grátis)"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Tempo de Preparação (Compacto com 2 caixas: Dias e Horas) */}
        <div className="bg-[#050b11]/80 p-3 rounded-xl border border-cyan-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Tempo de Preparação
            </label>
            <span className="text-[10px] text-cyan-300 font-black bg-cyan-950/80 border border-cyan-700/50 px-2 py-0.5 rounded-md">
              {formatPrepTimeString(prepDays, prepHours)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-300 block mb-1">Dias</label>
              <input
                type="number"
                min="0"
                max="365"
                value={prepDays}
                onChange={(e) => setPrepDays(e.target.value)}
                onFocus={(e) => e.target.value === "0" && setPrepDays("")}
                onBlur={(e) => !e.target.value && setPrepDays("0")}
                placeholder="0"
                className="w-full bg-[#08121a] border border-cyan-800/60 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white text-center font-black placeholder-gray-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-300 block mb-1">Horas</label>
              <input
                type="number"
                min="0"
                max="240"
                value={prepHours}
                onChange={(e) => setPrepHours(e.target.value)}
                onFocus={(e) => e.target.value === "0" && setPrepHours("")}
                onBlur={(e) => !e.target.value && setPrepHours("0")}
                placeholder="0"
                className="w-full bg-[#08121a] border border-cyan-800/60 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white text-center font-black placeholder-gray-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Data da Entrega / Retirada (Pre-set with today + datepicker) */}
        <div>
          <label className="text-[11px] font-bold text-gray-300 block mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Data da Entrega / Retirada
            </span>
            <span className="text-[10px] font-normal text-emerald-400">Pré-definida para hoje</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full bg-[#050b11] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer scheme-dark"
            />
          </div>
        </div>
      </div>

      {/* 3. SELEÇÃO DE PRODUTOS E BAIXA DE ESTOQUE */}
      <div className="bg-[#08121a] border border-emerald-950/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-emerald-950/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">3. Itens da Venda</h3>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {saleItems.length} {saleItems.length === 1 ? "item adicionado" : "itens adicionados"}
          </span>
        </div>

        {/* Item Selection Box */}
        <div className="bg-[#050b11] p-3.5 rounded-xl border border-emerald-950 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">Selecione o Produto</label>
            {/* Search filter input */}
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={prodSearch}
              onChange={(e) => setProdSearch(e.target.value)}
              className="w-full mb-2 bg-[#08121a] border border-emerald-950 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-300 placeholder-gray-600 outline-none"
            />

            <select
              value={selectedProductToAdd}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="w-full bg-[#08121a] border border-emerald-950 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              <option value="">-- Escolha um produto do catálogo --</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) - {formatPrice(p.price)} [Estoque: {p.stock} un]
                </option>
              ))}
            </select>
          </div>

          {/* If selected product has variations */}
          {currentProduct && currentProduct.colorStockControl && currentProduct.colors && currentProduct.colors.length > 0 && (
            <div className="bg-[#0c1822] p-2.5 rounded-xl border border-emerald-500/20 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Selecione a Variação / Cor:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {currentProduct.colors.map((c) => {
                  const isSelected = selectedVariationToAdd === c.color;
                  return (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setSelectedVariationToAdd(c.color)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                          : c.stock > 0
                          ? "bg-[#08121a] text-gray-200 border-emerald-950 hover:border-emerald-500/40"
                          : "bg-[#06090e] text-gray-500 border-gray-900 line-through opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30 flex-shrink-0"
                          style={{ backgroundColor: c.colorHex || "#10B981" }}
                        />
                        <span className="truncate">{c.color}</span>
                      </div>
                      <span className="text-[10px] opacity-80 flex-shrink-0">({c.stock})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Unit Price */}
          {currentProduct && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">
                  Qtd (Máx: {availableStockForCurrent})
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setItemQuantityToAdd(Math.max(1, itemQuantityToAdd - 1))}
                    className="w-8 h-8 rounded-lg bg-[#08121a] hover:bg-emerald-500/20 text-white font-bold border border-emerald-950 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={availableStockForCurrent || 1}
                    value={itemQuantityToAdd}
                    onChange={(e) => setItemQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-[#08121a] border border-emerald-950 rounded-lg py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setItemQuantityToAdd(Math.min(availableStockForCurrent || 99, itemQuantityToAdd + 1))}
                    className="w-8 h-8 rounded-lg bg-[#08121a] hover:bg-emerald-500/20 text-white font-bold border border-emerald-950 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  value={itemCustomPrice}
                  onChange={(e) => setItemCustomPrice(e.target.value)}
                  className="w-full bg-[#08121a] border border-emerald-950 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={availableStockForCurrent <= 0}
                  className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    availableStockForCurrent > 0
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar à Venda</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* List of Added Items */}
        {saleItems.length > 0 ? (
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[11px] font-bold text-gray-400">Produtos no pedido:</span>
            {saleItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#050b11] border border-emerald-950/70 p-2.5 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-9 h-9 rounded-lg object-cover border border-emerald-950 flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.productName}</h4>
                    <p className="text-[10px] text-gray-400">
                      {item.quantity}x {formatPrice(item.unitPrice)}
                      {item.selectedColor && (
                        <span className="ml-1 text-emerald-400 font-semibold">• Cor: {item.selectedColor}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-black text-emerald-400">{formatPrice(item.total)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-gray-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed border-emerald-950/60 rounded-xl">
            <p className="text-xs text-gray-500">Nenhum produto adicionado ainda</p>
          </div>
        )}
      </div>

      {/* 4. PAGAMENTO E CONDIÇÕES */}
      <div className="bg-[#08121a] border border-emerald-950/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center gap-2 border-b border-emerald-950/60 pb-2.5">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">4. Pagamento e Condição</h3>
        </div>

        {/* Forma de Pagamento */}
        <div>
          <label className="text-[11px] font-bold text-gray-300 block mb-1.5">Forma de Pagamento</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: "pix", label: "Pix", icon: QrCode },
              { id: "dinheiro", label: "Dinheiro", icon: Banknote },
              { id: "cartao_credito", label: "Cartão Crédito", icon: CreditCard },
              { id: "cartao_debito", label: "Cartão Débito", icon: CreditCard }
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = paymentMethod === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-black border-emerald-400 shadow-md"
                      : "bg-[#050b11] text-gray-300 border-emerald-950 hover:border-emerald-500/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status / Condição do Pagamento */}
        <div>
          <label className="text-[11px] font-bold text-gray-300 block mb-1.5">Status / Prazo do Pagamento</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentStatus("pago")}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                paymentStatus === "pago"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-md"
                  : "bg-[#050b11] text-emerald-400 border-emerald-950 hover:border-emerald-500/30"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Já Pago</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentStatus("na_entrega")}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                paymentStatus === "na_entrega"
                  ? "bg-amber-500 text-black border-amber-400 shadow-md"
                  : "bg-[#050b11] text-amber-400 border-emerald-950 hover:border-amber-500/30"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Na Entrega</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentStatus("a_prazo")}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                paymentStatus === "a_prazo"
                  ? "bg-purple-500 text-white border-purple-400 shadow-md"
                  : "bg-[#050b11] text-purple-400 border-emerald-950 hover:border-purple-500/30"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>A Prazo / Fiado</span>
            </button>
          </div>
        </div>

        {/* If A Prazo -> Reveal Datepicker for Due Date */}
        {paymentStatus === "a_prazo" && (
          <div className="bg-purple-950/30 border border-purple-500/40 p-3 rounded-xl flex flex-col gap-1.5 animate-fadeIn">
            <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Data Limite para Receber (Vencimento) <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#050b11] border border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none scheme-dark cursor-pointer font-bold"
            />
          </div>
        )}

        {/* Status Inicial do Pedido para Acompanhamento */}
        <div className="pt-2 border-t border-emerald-950/40 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Status Inicial no Acompanhamento de Pedidos
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderInitialStatus("aguardando_validacao")}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                orderInitialStatus === "aguardando_validacao"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm"
                  : "bg-[#050b11] text-gray-400 border-emerald-950 hover:border-amber-500/40"
              }`}
            >
              <span className="text-[11px] font-bold">1. Validação</span>
              <span className="text-[9px] opacity-80">Aguardando Confirmação / Pix</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderInitialStatus("preparando")}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                orderInitialStatus === "preparando"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm"
                  : "bg-[#050b11] text-gray-400 border-emerald-950 hover:border-cyan-500/40"
              }`}
            >
              <span className="text-[11px] font-bold">2. Preparação</span>
              <span className="text-[9px] opacity-80">Preparando / Em Separação</span>
            </button>
          </div>
        </div>

        {/* Desconto e Observações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold text-gray-300 block mb-1">Desconto (R$)</label>
            <input
              type="number"
              step="0.50"
              placeholder="0.00"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full bg-[#050b11] border border-emerald-950 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-300 block mb-1">Observações Internas</label>
            <input
              type="text"
              placeholder="Ex: Levar troco p/ 50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#050b11] border border-emerald-950 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5. RESUMO FINANCEIRO E FINALIZAR */}
      <div className="bg-gradient-to-b from-[#0a1824] to-[#07121b] border border-emerald-500/40 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col gap-1.5 text-xs border-b border-emerald-950 pb-3">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal dos Produtos:</span>
            <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
          </div>

          {deliveryType === "entrega" && (
            <div className="flex justify-between text-gray-400">
              <span>Taxa de Entrega:</span>
              <span className="text-white font-semibold">{formatPrice(numDeliveryFee)}</span>
            </div>
          )}

          {numDiscount > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Desconto Aplicado:</span>
              <span className="font-semibold">-{formatPrice(numDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-emerald-950/60">
            <span>Total da Venda:</span>
            <span className="text-emerald-400 text-base">{formatPrice(finalTotal)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinalizeSale}
          disabled={isSubmitting || saleItems.length === 0}
          className={`w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
            saleItems.length > 0 && !isSubmitting
              ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black active:scale-[0.98]"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Finalizar Venda & Baixar Estoque</span>
            </>
          )}
        </button>
      </div>

      {/* POST-SALE SUCCESS MODAL */}
      <AnimatePresence>
        {finishedSale && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#07131e] border border-emerald-500/50 rounded-3xl w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Venda Registrada com Sucesso!</h3>
                    <p className="text-[10px] text-emerald-400">Estoque atualizado e baixado em tempo real</p>
                  </div>
                </div>
                <button
                  onClick={handleResetForm}
                  className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Card */}
              <div className="bg-[#050b11] border border-emerald-950 rounded-2xl p-3.5 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center border-b border-emerald-950/60 pb-2">
                  <span className="text-gray-400">Cliente:</span>
                  <span className="font-bold text-white">{finishedSale.clientName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-950/60 pb-2">
                  <span className="text-gray-400">Data Prevista:</span>
                  <span className="font-bold text-emerald-400">{formatDateBR(finishedSale.deliveryDate)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-950/60 pb-2">
                  <span className="text-gray-400">Destino:</span>
                  <span className="font-medium text-white truncate max-w-[200px]">
                    {finishedSale.deliveryType === "entrega" ? finishedSale.deliveryAddress?.street : finishedSale.pickupLocation}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-400">Valor Total:</span>
                  <span className="text-base font-black text-emerald-400">{formatPrice(finishedSale.total)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="w-full py-3 bg-[#0c1f2d] hover:bg-[#112a3d] border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedReceipt ? "✓ Resumo Copiado!" : "Copiar Resumo para WhatsApp"}</span>
                </button>

                {finishedSale.clientPhone && (
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar no WhatsApp do Cliente</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="py-2.5 bg-[#08121a] hover:bg-[#0c1c2a] text-gray-300 font-bold text-xs rounded-xl border border-emerald-950 transition-colors cursor-pointer"
                  >
                    + Nova Venda
                  </button>
                  {onNavigateToTracker ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleResetForm();
                        onNavigateToTracker();
                      }}
                      className="py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Acompanhar Pedido</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleResetForm();
                        onViewHistory();
                      }}
                      className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Ver Histórico
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
