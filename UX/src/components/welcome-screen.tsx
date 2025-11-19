import { Clock } from "lucide-react";
import { motion } from "motion/react";
import logoImpacto from "figma:asset/1eb85b79076b45be29670862bf0e01ee16473145.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Atualizar relógio a cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Definir saudação baseada na hora
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }

    return () => clearInterval(timer);
  }, []);

  // Formatar data
  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  // Formatar hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-between min-h-screen p-8 bg-[#EBEBEB]"
    >
      {/* Logo da Empresa */}
      <div className="w-full flex justify-center pt-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
          className="relative"
        >
          <ImageWithFallback
            src={logoImpacto}
            alt="Mascote Impacto - Locações de Equipamentos"
            className="w-32 h-auto relative z-10 rounded-2xl shadow-lg bg-white"
          />
        </motion.div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center gap-5 flex-1 justify-center max-w-2xl w-full -mt-16">
        {/* Título Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-[#2A2A2A]">Registro de Ponto</h1>
        </motion.div>

        {/* Relógio em Tempo Real */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg w-full"
        >
          <p className="text-[#5A5A5A]">
            {formatDate(currentTime)}
          </p>
          <div className="text-[#2A2A2A] text-5xl font-mono tabular-nums tracking-tight" aria-live="polite" aria-atomic="true">
            {formatTime(currentTime)}
          </div>
        </motion.div>

        {/* Instrução */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center"
        >
          <p className="text-[#6A6A6A]">
            Toque no botão abaixo para iniciar seu registro
          </p>
        </motion.div>

        {/* Botão CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          aria-label="Iniciar registro de ponto"
          className="mt-2 inline-flex items-center justify-center gap-3 h-20 px-12 bg-[#E30613] hover:bg-[#B30510] text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#E30613]/30"
        >
          <Clock className="w-7 h-7" strokeWidth={2} aria-hidden="true" />
          <span className="leading-none">Registrar Ponto</span>
        </motion.button>

        {/* Indicador de Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 text-[#5A5A5A] mt-2 bg-white/40 backdrop-blur-sm rounded-full px-6 py-2.5"
        >
          <div className="w-2.5 h-2.5 bg-[#0F7C3E] rounded-full animate-pulse" aria-hidden="true" />
          <p className="text-sm">Sistema online e pronto</p>
        </motion.div>
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