import React, { useState } from "react";
import { X, Lock, Mail, ShieldCheck, UserCheck, LogIn, UserPlus, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { loginWithEmail, registerWithEmail, ADMIN_EMAIL } from "../firebase";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Por favor, insira o seu e-mail.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const user = await loginWithEmail(email, password);
        setSuccessMsg("Login realizado com sucesso!");
        setTimeout(() => {
          onSuccess(user.email || email);
          onClose();
        }, 600);
      } else {
        const user = await registerWithEmail(email, password);
        setSuccessMsg("Conta criada com sucesso!");
        setTimeout(() => {
          onSuccess(user.email || email);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErrorMsg("E-mail ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Este e-mail já está cadastrado. Tente entrar.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMsg("Formato de e-mail inválido.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("A senha é muito fraca. Escolha uma senha com no mínimo 6 caracteres.");
      } else if (err.code === "auth/operation-not-allowed" || err.code === "auth/configuration-not-found") {
        setErrorMsg("Provedor Email/Senha precisa ser ativado no Firebase Console (Authentication > Sign-in method).");
      } else {
        setErrorMsg(err.message || "Erro ao autenticar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdminCredentials = () => {
    setEmail(ADMIN_EMAIL);
    setPassword("Th123@##");
    setMode("login");
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-[#070e17] border border-emerald-500/30 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-10 overflow-hidden"
      >
        {/* Decorative Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-black mb-3 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-black text-white tracking-wide">
            {mode === "login" ? "Entrar na Conta" : "Criar Conta"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Acesso seguro à plataforma e gerenciamento <span className="text-emerald-400 font-bold">Thyago Tech</span>
          </p>
        </div>

        {/* Admin 1-Click Shortcut Card */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-black text-emerald-300">Sou o Administrador (Thyago)</div>
              <div className="text-[10px] text-gray-400">Preencher credenciais de ADM</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillAdminCredentials}
            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Preencher
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#050c14] border border-emerald-950/80 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050c14] border border-emerald-950/80 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Conta</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-5 pt-4 border-t border-emerald-950/60 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
          >
            {mode === "login" ? (
              <span>Não tem uma conta? <strong className="text-emerald-400 font-bold underline">Cadastre-se</strong></span>
            ) : (
              <span>Já possui uma conta? <strong className="text-emerald-400 font-bold underline">Fazer Login</strong></span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
