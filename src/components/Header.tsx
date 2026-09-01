import React, { useState } from "react";
import { ShoppingCart, Menu, X, Settings, User as UserIcon, LogOut, ShieldCheck, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "firebase/auth";
import { StoreSettings } from "../types";

interface HeaderProps {
  onNavigate: (view: "home" | "admin" | "detail", productId?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentView: string;
  user: User | null;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  storeSettings?: StoreSettings;
}

export default function Header({ 
  onNavigate, 
  cartCount, 
  onOpenCart, 
  currentView,
  user,
  isAdmin,
  onOpenLogin,
  onLogout,
  storeSettings
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const storeName = storeSettings?.storeName || "Thyago Tech";
  const nameParts = storeName.split(" ");
  const firstNamePart = nameParts[0] || "THYAGO";
  const restNamePart = nameParts.slice(1).join(" ") || "TECH";

  return (
    <header className="sticky top-0 z-50 bg-[#070b11]/95 backdrop-blur-md border-b border-emerald-950/40 px-4 py-3 flex items-center justify-between">
      {/* Brand Logo & Tagline */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer select-none max-w-[70%]"
        onClick={() => {
          onNavigate("home");
          setMenuOpen(false);
        }}
      >
        {/* Custom Logo Image or Circuit Board Vector Icon */}
        {storeSettings?.logoUrl && !imgError ? (
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#091522] border border-emerald-500/40 ring-1 ring-emerald-400/20 overflow-hidden shadow-[0_0_16px_rgba(16,185,129,0.25)] flex-shrink-0 group">
            <img 
              src={storeSettings.logoUrl} 
              alt={storeName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              style={{
                transform: `scale(${((storeSettings.logoZoom ?? 100) / 100)})`,
                transformOrigin: "center center"
              }}
              className={`w-full h-full transition-transform duration-300 ${
                storeSettings.logoFit === "contain" ? "object-contain p-1" : "object-cover"
              }`}
            />
            {/* Subtle inner highlight border overlay */}
            <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-inset ring-white/10" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-10 h-10 border border-emerald-400/80 rounded-xl bg-[#091522] shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/20 flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <path d="M9 9h6v6H9z" />
              <path d="M9 1h1v4H9zM14 1h1v4h-1zM9 19h1v4H9zM14 19h1v4h-1zM1 9h4v1H1zM1 14h4v1H1zM19 9h4v1h-4zM19 14h4v1h-4z" />
            </svg>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1 truncate">
            {nameParts.length > 1 ? (
              <>
                <span className="font-extrabold text-lg tracking-wider text-white uppercase truncate">{firstNamePart}</span>
                <span className="font-extrabold text-lg tracking-wider text-emerald-400 uppercase truncate">{restNamePart}</span>
              </>
            ) : (
              <span className="font-extrabold text-lg tracking-wider text-white uppercase truncate">{storeName}</span>
            )}
          </div>
          {storeSettings?.storeTagline && (
            <p className="text-[9px] text-gray-400 -mt-1 font-medium truncate">{storeSettings.storeTagline}</p>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Cart */}
        <button 
          id="cart-btn"
          onClick={onOpenCart}
          className="relative p-2 text-gray-300 hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer"
          title="Carrinho"
        >
          <ShoppingCart className="w-5.5 h-5.5" />
          {cartCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-emerald-400 text-[#070b11] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse">
              {cartCount}
            </span>
          )}
        </button>

        {/* 3-bar Menu Toggle */}
        <button 
          id="menu-toggle-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 border border-emerald-500/30 hover:border-emerald-400/50 rounded-lg bg-[#0d1b24]/80 text-white hover:text-emerald-400 transition-all focus:outline-none cursor-pointer"
          title="Menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Dropdown Menu Side Drawer / Drawer Panel Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              id="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 top-[61px] bg-black/60 z-40 backdrop-blur-xs"
            />
            {/* Menu List */}
            <motion.div 
              id="menu-drawer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[61px] left-0 right-0 bg-[#070b11] border-b border-emerald-900/40 shadow-xl z-50 p-4"
            >
              <div className="flex flex-col gap-2">
                <button
                  id="menu-home-opt"
                  onClick={() => {
                    onNavigate("home");
                    setMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors font-medium text-sm cursor-pointer ${
                    currentView === "home" 
                      ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40" 
                      : "text-gray-300 hover:bg-gray-900/40"
                  }`}
                >
                  <span>Vitrine de Produtos</span>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Catálogo</span>
                </button>

                {/* ADM PANEL BUTTON: STRICTLY DISPLAYED FOR ADMIN EMAIL ONLY */}
                {isAdmin && (
                  <button
                    id="menu-adm-opt"
                    onClick={() => {
                      onNavigate("admin");
                      setMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors font-medium text-sm cursor-pointer ${
                      currentView === "admin" 
                        ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40" 
                        : "text-gray-300 hover:bg-emerald-950/10 hover:text-emerald-300 border border-transparent hover:border-emerald-950/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-400" />
                      <span>Painel de Administração (ADM)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      Gerenciar
                    </span>
                  </button>
                )}

                {/* Account / Login Option in Menu */}
                {user ? (
                  <div className="p-3 rounded-xl bg-[#091520] border border-emerald-500/30 flex flex-col gap-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${isAdmin ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-300"}`}>
                          {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                          <div className="font-black text-sm text-white flex items-center gap-1.5">
                            {isAdmin ? "Thyago Tech" : (user.displayName || "Minha Conta")}
                            {isAdmin && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-black">
                                ADM
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[200px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full mt-1 py-2 px-3 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onOpenLogin();
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <span>Entrar na Conta</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Login</span>
                  </button>
                )}

                <div className="mt-2 pt-2 border-t border-gray-800/40 flex justify-between items-center px-3">
                  <span className="text-xs text-gray-500 font-medium">Filtro Rápido:</span>
                  <div className="flex gap-2 text-[10px]">
                    <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">Mobile First</span>
                    <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">WhatsApp Vitrine</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
