import React from "react";
import { X, Trash2, ShoppingBag, ArrowUpRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, action: "increase" | "decrease", color?: string) => void;
  onRemoveItem: (productId: string, color?: string) => void;
}

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}: CartDrawerProps) {
  
  // Compute totals
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = cartItems.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

  // Format currency
  const formatPrice = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  // WhatsApp checkout message generator
  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    const phoneNumber = "5581997073882"; // Thyago Tech phone number (81 99707-3882)
    let itemsText = "";
    
    cartItems.forEach((item, idx) => {
      const colorInfo = item.selectedColor ? ` (Cor: ${item.selectedColor})` : "";
      itemsText += `${idx + 1}. *${item.product.name}*${colorInfo}\n   Qtd: ${item.quantity}x • Unidade: ${formatPrice(item.product.price)} • Subtotal: ${formatPrice(item.product.price * item.quantity)}\n`;
    });

    const message = `Olá! Montei meu pedido no site *Thyago Tech* e gostaria de finalizar a compra por aqui!
    
📦 *RESUMO DO PEDIDO:*
----------------------------------
${itemsText}
----------------------------------
⭐ *Total de Itens:* ${totalItems}
💰 *Valor Total:* ${formatPrice(totalPrice)}
    
Por favor, verifique a disponibilidade e me informe os dados para pagamento!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#060b12] z-50 border-l border-emerald-900/40 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 bg-[#070c14] border-b border-emerald-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-sm text-white uppercase tracking-wider">Seu Carrinho</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {totalItems} {totalItems === 1 ? "item" : "itens"}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-none">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Seu carrinho está vazio</span>
                    <span className="text-[10px] text-gray-500 mt-1 block">Navegue pelos produtos e adicione à sacola</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 text-xs font-bold text-[#00e181] bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl"
                  >
                    Ver Produtos
                  </button>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div 
                    key={`${item.product.id}-${item.selectedColor || "none"}`}
                    className="flex gap-3 bg-[#08121a] p-3 rounded-xl border border-emerald-950/40 text-xs"
                  >
                    {/* Item Image */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-950 flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{item.product.name}</h4>
                      {item.selectedColor && (
                        <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">Cor: {item.selectedColor}</p>
                      )}
                      <span className="font-extrabold text-emerald-400 block mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-2 bg-gray-950 px-2 py-1 rounded-lg border border-emerald-950">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, "decrease", item.selectedColor)}
                            className="text-gray-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold text-emerald-400 min-w-3 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, "increase", item.selectedColor)}
                            className="text-gray-400 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedColor)}
                          className="text-gray-500 hover:text-rose-400 p-1"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-[#070c14] border-t border-emerald-950/40 flex flex-col gap-3.5">
                {/* Total pricing bar */}
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-gray-400">Total do Pedido:</span>
                  <span className="text-xl font-black text-[#00e181] tracking-tight">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Pedir no WhatsApp Checkout CTA button */}
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#00e181] hover:bg-[#00c570] text-black font-black text-sm py-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,225,129,0.3)] transition-all cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>PEDIR NO WHATSAPP</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3px]" />
                </button>

                <p className="text-[9px] text-gray-500 text-center leading-normal">
                  Não implementamos pagamentos online agora. <br />
                  Seu pedido será finalizado diretamente no WhatsApp de suporte.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
