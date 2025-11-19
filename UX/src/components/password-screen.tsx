import { useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import logoImpacto from "figma:asset/1eb85b79076b45be29670862bf0e01ee16473145.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PasswordScreenProps {
  onConfirm: (password: string) => void;
  onCancel: () => void;
  error?: string;
}

export function PasswordScreen({ onConfirm, onCancel, error }: PasswordScreenProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  };

  const handleNumberClick = (num: string) => {
    setPassword(prev => prev + num);
  };

  const handleClear = () => {
    setPassword("");
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-between min-h-screen p-8 bg-[#EBEBEB]"
    >
      {/* Logo da Empresa */}
      <div className="w-full flex justify-center pt-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
        >
          <ImageWithFallback
            src={logoImpacto}
            alt="Mascote Impacto - Locações de Equipamentos"
            className="w-32 h-auto rounded-2xl shadow-lg bg-white"
          />
        </motion.div>
      </div>

      {/* Conteúdo Central */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center -mt-16">
        {/* Ícone */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-[#C62828] rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-10 h-10 text-white" strokeWidth={2} aria-hidden="true" />
          </div>
        </motion.div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campo de Senha com Label */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <label 
              htmlFor="password" 
              className="block text-[#2A2A2A] text-left text-lg"
            >
              Digite sua senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "password-error" : undefined}
              className="w-full h-16 px-6 bg-white border-2 border-[#E5E5E5] rounded-2xl focus:outline-none focus:border-[#C62828] focus:ring-4 focus:ring-[#C62828]/20 transition-all text-[#2A2A2A] shadow-sm"
              autoFocus
            />
          </motion.div>

          {/* Mensagem de Erro */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              id="password-error"
              role="alert"
              className="text-[#C62828] text-center bg-[#FFEBEE] py-3 px-4 rounded-2xl border border-[#C62828]/20"
            >
              {error}
            </motion.div>
          )}

          {/* Teclado Numérico */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-3 gap-3 mt-6" 
            role="group" 
            aria-label="Teclado numérico"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNumberClick(num.toString())}
                aria-label={`Número ${num}`}
                className="h-16 bg-white border-2 border-[#E5E5E5] rounded-2xl hover:bg-[#FFEDEF] hover:border-[#C62828]/30 transition-colors shadow-sm"
              >
                {num}
              </motion.button>
            ))}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              aria-label="Limpar senha"
              className="h-16 bg-white border-2 border-[#E5E5E5] rounded-2xl hover:bg-[#FFEBEE] hover:border-[#C62828]/30 transition-colors text-[#C62828] shadow-sm"
            >
              Limpar
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNumberClick("0")}
              aria-label="Número 0"
              className="h-16 bg-white border-2 border-[#E5E5E5] rounded-2xl hover:bg-[#FFEDEF] hover:border-[#C62828]/30 transition-colors shadow-sm"
            >
              0
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBackspace}
              aria-label="Apagar último dígito"
              className="h-16 bg-white border-2 border-[#E5E5E5] rounded-2xl hover:bg-[#FFEDEF] hover:border-[#C62828]/30 transition-colors shadow-sm"
            >
              ⌫
            </motion.button>
          </motion.div>

          {/* Botões */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 mt-6"
          >
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Confirmar senha"
              className="w-full h-16 bg-[#E30613] hover:bg-[#B30510] text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#E30613]/30"
            >
              Confirmar
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              aria-label="Cancelar e voltar"
              className="w-full h-16 bg-transparent hover:bg-[#F5F5F5] text-[#2A2A2A] rounded-2xl transition-colors flex items-center justify-center gap-2 border-2 border-[#E5E5E5]"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              Cancelar
            </motion.button>
          </motion.div>
        </form>
      </div>

      {/* Rodapé */}
      <div className="w-full flex flex-col items-center gap-2 pb-6">
        <p className="text-[#6A6A6A] text-sm">
          Versão 1.0 — acesso restrito
        </p>
        <p className="text-[#7A7A7A] text-xs">
          © 2025 Impacto Locações de Equipamentos
        </p>
      </div>
    </motion.div>
  );
}