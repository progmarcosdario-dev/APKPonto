import { useState, useEffect } from "react";
import { CheckCircle, Clock, User, Calendar } from "lucide-react";
import { motion } from "motion/react";
import logoImpacto from "figma:asset/1eb85b79076b45be29670862bf0e01ee16473145.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ConfirmationScreenProps {
  employeeName: string;
  entryType: string;
  timestamp: string;
  completedEntries: string[];
  onComplete: () => void;
  onRegisterAnother: () => void;
}

type EntryTypeInfo = {
  label: string;
  emoji: string;
  color: string;
};

const entryTypesMap: Record<string, EntryTypeInfo> = {
  start: { label: "Início expediente", emoji: "🟢", color: "#0F7C3E" },
  break_start: { label: "Saída intervalo", emoji: "🟡", color: "#F59E0B" },
  break_end: { label: "Retorno intervalo", emoji: "🟡", color: "#F59E0B" },
  end: { label: "Final expediente", emoji: "🔴", color: "#E30613" },
};

export function ConfirmationScreen({
  employeeName,
  entryType,
  timestamp,
  completedEntries,
  onComplete,
}: ConfirmationScreenProps) {
  const [countdown, setCountdown] = useState(5);
  
  const currentEntryInfo = entryTypesMap[entryType] || { 
    label: entryType, 
    emoji: "⚪", 
    color: "#6B7280" 
  };

  const currentEntryNumber = completedEntries.length;

  // Gerar data/hora atual formatada
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).toLowerCase(); // Tudo em lowercase para capitalização correta

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#EBEBEB] p-8"
    >
      {/* Logo da Empresa - Topo */}
      <div className="w-full flex justify-center pt-2 mb-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
          className="relative"
        >
          {/* Card branco com mascote */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <ImageWithFallback
              src={logoImpacto}
              alt="Mascote Impacto - Locações de Equipamentos"
              className="w-32 h-auto"
            />
          </div>
          
          {/* Círculo verde com check sobreposto */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.3, 
              type: "spring", 
              stiffness: 260,
              damping: 20
            }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          >
            {/* Confete Sutil */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 6) * 50,
                  y: Math.sin((i * Math.PI * 2) / 6) * 50,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  delay: 0.5,
                  duration: 0.6,
                  times: [0, 0.5, 1]
                }}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                style={{ 
                  backgroundColor: i % 2 === 0 ? "#FFD700" : "#0F7C3E",
                  transform: "translate(-50%, -50%)"
                }}
                aria-hidden="true"
              />
            ))}
            
            <div className="w-20 h-20 bg-[#0F7C3E] rounded-full flex items-center justify-center shadow-2xl relative z-10">
              <CheckCircle className="w-11 h-11 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Conteúdo Central */}
      <div className="w-full max-w-2xl mx-auto">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[#2A2A2A] text-center font-medium mb-8"
        >
          Ponto Registrado!
        </motion.h1>

        {/* Card Principal com Informações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-white rounded-2xl p-8 shadow-lg border border-[#E5E5E5] space-y-6 mb-8"
        >
          {/* Funcionário - DESTAQUE */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#E30613] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-[#8A8A8A] text-sm mb-1">Funcionário</p>
              <p className="text-[#2A2A2A] text-lg font-semibold">{employeeName}</p>
            </div>
          </div>

          {/* Tipo de Registro */}
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: currentEntryInfo.color }}
            >
              <div className="w-6 h-6 border-3 border-white rounded-full" aria-hidden="true" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-[#8A8A8A] text-sm mb-1">Tipo de registro</p>
              <p className="text-[#2A2A2A] text-lg font-medium">{currentEntryInfo.label}</p>
            </div>
          </div>

          {/* Data */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-[#2A2A2A]" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-[#8A8A8A] text-sm mb-1">Data</p>
              <p className="text-[#2A2A2A] text-lg">{dateStr}</p>
            </div>
          </div>

          {/* Horário - DESTAQUE MÁXIMO */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#6B7280] rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-[#8A8A8A] text-sm mb-1">Horário</p>
              <motion.p 
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.2, repeat: 2 }}
                className="text-[#2A2A2A] text-3xl font-mono font-bold tracking-wide"
              >
                {timestamp}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Contador Regressivo Simples */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-2 text-[#5A5A5A] mb-12"
        >
          <Clock className="w-4 h-4 text-[#8A8A8A]" aria-hidden="true" />
          <p className="text-sm">
            Retornando em <span className="font-semibold text-[#2A2A2A]">{countdown}s</span>
          </p>
        </motion.div>

        {/* Rodapé */}
        <div className="w-full flex flex-col items-center gap-2">
          <p className="text-[#6A6A6A] text-sm">
            Versão 1.0 — acesso restrito
          </p>
          <p className="text-[#7A7A7A] text-xs">
            © 2025 Impacto Locações de Equipamentos
          </p>
        </div>
      </div>
    </motion.div>
  );
}