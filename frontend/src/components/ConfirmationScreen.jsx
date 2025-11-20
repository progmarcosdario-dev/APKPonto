import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function ConfirmationScreen({
  employeeName,
  entryType,
  timestamp,
  completedEntries,
  onComplete,
  onRegisterAnother,
}) {
  const [countdown, setCountdown] = useState(5);

  const entryTypesMap = {
    1: { label: 'Início expediente', emoji: '🟢', color: '#0F7C3E' },
    2: { label: 'Saída intervalo', emoji: '🟡', color: '#F59E0B' },
    3: { label: 'Retorno intervalo', emoji: '🟡', color: '#F59E0B' },
    4: { label: 'Final expediente', emoji: '🔴', color: '#E30613' },
  };

  const currentEntryInfo = entryTypesMap[entryType] || {
    label: entryType,
    emoji: '⚪',
    color: '#6B7280',
  };

  const currentEntryNumber = completedEntries.length;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toLowerCase();

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

  const progressPercentage = (completedEntries.length / 4) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-between min-h-screen p-8 bg-brand"
    >
      {/* Logo com Check */}
      <div className="w-full flex justify-center pt-4 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
          className="relative"
        >
          <img
            src={logo}
            alt="Scopum Logo"
            className="w-32 h-auto rounded-2xl shadow-lg bg-white"
          />
          {/* Círculo com Check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute -bottom-2 -right-2 bg-brand-green rounded-full p-2 shadow-lg"
          >
            <CheckCircle className="w-8 h-8 text-white" strokeWidth={2} />
          </motion.div>
        </motion.div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col items-center gap-6 flex-1 justify-center max-w-md w-full">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-text-primary text-center"
        >
          Ponto Registrado!
        </motion.h1>

        {/* Card com Informações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-5"
        >
          {/* Tipo de Entrada */}
          <div className="flex items-center gap-4">
            <span className="text-5xl">{currentEntryInfo.emoji}</span>
            <div>
              <p className="text-text-primary font-bold text-lg">
                {currentEntryInfo.label}
              </p>
              <p className="text-text-secondary text-sm">
                Registro {currentEntryNumber} do dia
              </p>
            </div>
          </div>

          {/* Detalhes */}
          <div className="space-y-3 pt-4 border-t border-white/40">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 text-text-primary"
            >
              <User size={18} className="text-text-secondary" strokeWidth={2} />
              <span className="font-medium">{employeeName}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-center gap-3 text-text-primary"
            >
              <Calendar size={18} className="text-text-secondary" strokeWidth={2} />
              <span className="font-medium capitalize">{dateStr}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-text-primary"
            >
              <Clock size={18} className="text-text-secondary" strokeWidth={2} />
              <span className="font-mono font-bold">{timestamp}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Progresso de Registros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full space-y-3"
        >
          <p className="text-text-secondary font-medium text-sm">
            Registros do dia
          </p>
          <div className="w-full h-3 bg-white/40 backdrop-blur-sm rounded-full overflow-hidden shadow-lg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-green to-brand-red rounded-full"
            />
          </div>
          <p className="text-text-primary font-bold text-center">
            {completedEntries.length} de 4 pontos
          </p>
        </motion.div>
      </div>

      {/* Rodapé */}
      <div className="w-full flex flex-col items-center gap-4 pb-4">
        {/* Countdown */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-text-secondary text-sm"
        >
          Retornando em <span className="font-bold text-brand-red">{countdown}s</span>...
        </motion.p>

        {/* Botão Registrar Outro */}
        <motion.button
          onClick={onRegisterAnother}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="h-14 px-8 bg-brand-red hover:bg-brand-red-hover text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-red/30"
        >
          Registrar Outro Ponto
        </motion.button>
      </div>
    </motion.div>
  );
}
