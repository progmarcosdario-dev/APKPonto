import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function WelcomeScreen({ onStart }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Bom dia');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  const formatTime = (date) => {
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
      className="flex flex-col items-center justify-between min-h-screen p-8 bg-brand"
    >
      {/* Logo */}
      <div className="w-full flex justify-center pt-4">
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
        </motion.div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center gap-5 flex-1 justify-center max-w-md w-full -mt-16">
        {/* Saudação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center"
        >
          <p className="text-text-secondary text-sm font-medium">{greeting}</p>
        </motion.div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-text-primary">Scopum</h1>
          <p className="text-text-secondary text-sm mt-1">Controle de Ponto</p>
        </motion.div>

        {/* Data e Hora */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-text-secondary" strokeWidth={2} />
            <p className="text-text-secondary text-sm">
              {formatDate(currentTime)}
            </p>
          </div>
          <p className="text-center text-text-primary text-5xl font-mono tabular-nums tracking-tight">
            {formatTime(currentTime)}
          </p>
        </motion.div>

        {/* Instrução */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center"
        >
          <p className="text-text-tertiary text-sm">
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
          className="mt-4 h-16 px-8 bg-brand-red hover:bg-brand-red-hover text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-red/30"
        >
          Começar
        </motion.button>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-text-secondary mt-4 bg-white/40 backdrop-blur-sm rounded-full px-6 py-2"
        >
          <div className="w-2.5 h-2.5 bg-brand-green rounded-full animate-pulse" />
          <p className="text-xs">Sistema online e pronto</p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full flex flex-col items-center gap-1 pb-4">
        <p className="text-text-tertiary text-xs">
          Versão 1.0 — acesso restrito
        </p>
        <p className="text-text-footer text-xs">
          © 2025 Scopum Locações de Equipamentos
        </p>
      </div>
    </motion.div>
  );
}
