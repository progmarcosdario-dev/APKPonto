import { useState, useEffect } from "react";
import { Clock, User, ArrowLeft, Lock } from "lucide-react";
import { motion } from "motion/react";
import logoImpacto from "figma:asset/1eb85b79076b45be29670862bf0e01ee16473145.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TimeEntryScreenProps {
  employeeName: string;
  onSave: (type: string, observation: string) => void;
  onBack: () => void;
  completedEntries: string[];
}

type EntryType = "start" | "break_start" | "break_end" | "end";

export function TimeEntryScreen({ employeeName, onSave, onBack, completedEntries }: TimeEntryScreenProps) {
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);
  const [observation, setObservation] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime(currentDateTime);

  const entryTypes = [
    { id: "start" as EntryType, label: "Início expediente", icon: "🟢", color: "success" },
    { id: "break_start" as EntryType, label: "Saída intervalo", icon: "🟡", color: "warning" },
    { id: "break_end" as EntryType, label: "Retorno intervalo", icon: "🟡", color: "warning" },
    { id: "end" as EntryType, label: "Final expediente", icon: "🔴", color: "error" },
  ];

  // Função para verificar se um tipo de ponto está disponível
  const isEntryTypeEnabled = (typeId: EntryType): boolean => {
    // Início expediente: sempre disponível se não foi feito ainda
    if (typeId === "start") {
      return !completedEntries.includes("start");
    }
    
    // Saída intervalo: só após início expediente
    if (typeId === "break_start") {
      return completedEntries.includes("start") && !completedEntries.includes("break_start");
    }
    
    // Retorno intervalo: só após saída para intervalo
    if (typeId === "break_end") {
      return completedEntries.includes("break_start") && !completedEntries.includes("break_end");
    }
    
    // Final expediente: após retornar do intervalo OU apenas após início (se não teve intervalo)
    if (typeId === "end") {
      const hasStart = completedEntries.includes("start");
      const hasBreakStart = completedEntries.includes("break_start");
      const hasBreakEnd = completedEntries.includes("break_end");
      const alreadyEnded = completedEntries.includes("end");
      
      // Não pode finalizar se já finalizou
      if (alreadyEnded) return false;
      
      // Pode finalizar se: tem início E (não teve intervalo OU já retornou do intervalo)
      return hasStart && (!hasBreakStart || hasBreakEnd);
    }
    
    return false;
  };

  const handleSave = () => {
    if (selectedType) {
      const typeLabel = entryTypes.find((t) => t.id === selectedType)?.label || "";
      onSave(selectedType, observation);
    }
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
      <div className="w-full flex justify-center pt-4 pb-8">
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
      <div className="w-full max-w-3xl flex-1 flex flex-col justify-center">
        {/* Label Registrar Ponto */}
        <motion.label 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="block text-[#2A2A2A] pl-1 mb-3 font-medium"
        >
          Registrar ponto
        </motion.label>

        {/* Info do Funcionário e Horário */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-7 shadow-lg border border-white/40 space-y-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E30613] rounded-full flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-white" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[#5A5A5A] text-sm">Funcionário</p>
              <p className="text-[#2A2A2A]">{employeeName}</p>
            </div>
          </div>
          
          <div className="h-px bg-[#E5E5E5]" aria-hidden="true" />
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6 text-[#2A2A2A]" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[#5A5A5A] text-sm capitalize">{dateStr}</p>
              <p className="text-[#E30613] font-mono tracking-wider">{timeStr}</p>
            </div>
          </div>
        </motion.div>

        {/* Tipos de Registro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-5"
        >
          <label className="block text-[#2A2A2A] pl-1">Tipo de ponto</label>
          <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Selecione o tipo de registro de ponto">
            {entryTypes.map((type) => {
              const isEnabled = isEntryTypeEnabled(type.id);
              const isCompleted = completedEntries.includes(type.id);
              
              return (
                <motion.button
                  key={type.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedType === type.id}
                  aria-disabled={!isEnabled}
                  disabled={!isEnabled}
                  whileHover={isEnabled ? { scale: 1.01 } : {}}
                  whileTap={isEnabled ? { scale: 0.99 } : {}}
                  onClick={() => isEnabled && setSelectedType(type.id)}
                  className={`h-16 px-6 rounded-2xl border-2 transition-all flex items-center gap-4 relative ${
                    !isEnabled
                      ? "bg-[#F5F5F5] border-[#E5E5E5] text-[#B0B0B0] cursor-not-allowed opacity-60"
                      : selectedType === type.id
                      ? "bg-[#E30613] border-[#E30613] text-white shadow-lg"
                      : "bg-white border-[#E5E5E5] text-[#2A2A2A] hover:border-[#E30613]/30 hover:bg-[#FFE5E7]/30 shadow-sm"
                  }`}
                >
                  {/* Radio Indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedType === type.id
                      ? "border-white"
                      : !isEnabled
                      ? "border-[#D0D0D0]"
                      : "border-[#C0C0C0]"
                  }`}>
                    {selectedType === type.id && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>
                  
                  {/* Ícone */}
                  <span className={`text-2xl ${!isEnabled ? "opacity-50" : ""}`} aria-hidden="true">
                    {type.icon}
                  </span>
                  
                  {/* Label */}
                  <span className="flex-1 text-left">{type.label}</span>
                  
                  {/* Ícone de cadeado para bloqueados */}
                  {!isEnabled && !isCompleted && (
                    <Lock className="w-5 h-5 text-[#9A9A9A] flex-shrink-0" aria-hidden="true" />
                  )}
                  
                  {/* Ícone de check para completados */}
                  {isCompleted && (
                    <div className="w-6 h-6 bg-[#0F7C3E] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Observação */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 mb-6"
        >
          <label htmlFor="observation" className="block text-[#2A2A2A] pl-1">
            Observação (opcional)
          </label>
          <textarea
            id="observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Digite uma observação se necessário..."
            aria-label="Campo de observação opcional"
            rows={4}
            className="w-full px-6 py-4 bg-white border-2 border-[#E5E5E5] rounded-2xl focus:outline-none focus:border-[#E30613] focus:ring-4 focus:ring-[#E30613]/30 transition-all text-[#2A2A2A] resize-none shadow-sm"
          />
        </motion.div>

        {/* Botões */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!selectedType}
            aria-label="Salvar registro de ponto"
            aria-disabled={!selectedType}
            className={`w-full h-16 rounded-2xl transition-all ${
              selectedType
                ? "bg-[#0F7C3E] hover:bg-[#0C6331] text-white shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#0F7C3E]/30"
                : "bg-[#D5D5D5] text-[#9A9A9A] cursor-not-allowed shadow-sm"
            }`}
          >
            Salvar Registro
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            aria-label="Voltar para tela anterior"
            className="w-full h-16 bg-transparent hover:bg-[#F5F5F5] text-[#2A2A2A] rounded-2xl transition-colors flex items-center justify-center gap-2 border-2 border-[#E5E5E5]"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            Voltar
          </motion.button>
        </motion.div>
      </div>

      {/* Rodapé */}
      <div className="w-full flex flex-col items-center gap-2 pt-12 pb-6">
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