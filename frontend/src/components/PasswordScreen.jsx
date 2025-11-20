import React, { useState } from 'react';
import { Lock, ArrowLeft, Delete } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function PasswordScreen({ onConfirm, onCancel, error }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  };

  const handleNumberClick = (num) => {
    if (password.length < 6) {
      setPassword(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPassword('');
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const isPasswordComplete = password.length >= 6;

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
      <div className="flex flex-col items-center gap-8 flex-1 justify-center max-w-md w-full">
        {/* Ícone */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 150 }}
          className="flex items-center justify-center w-20 h-20 rounded-full bg-white/60 backdrop-blur-sm shadow-lg"
        >
          <Lock className="w-10 h-10 text-brand-red" strokeWidth={2} />
        </motion.div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <label className="text-text-primary font-semibold text-lg">
              Digite sua senha
            </label>
          </motion.div>

          {/* Input Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
          >
            <input
              type="password"
              value={password}
              onChange={() => {}} // Controlado apenas via botões
              placeholder="●●●●●●"
              className="w-full text-center text-3xl tracking-widest font-mono text-text-primary bg-transparent border-none outline-none placeholder:text-text-secondary/30 disabled:cursor-default"
              disabled
            />
          </motion.div>

          {/* Erro */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center font-medium bg-red-50/50 backdrop-blur-sm rounded-lg p-3"
            >
              {error}
            </motion.p>
          )}

          {/* Teclado Numérico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, idx) => (
              <motion.button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num.toString())}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + (idx * 0.05) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={password.length >= 6}
                className="h-16 rounded-2xl bg-white/70 hover:bg-white text-text-primary font-bold text-xl shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-brand-red/30"
              >
                {num}
              </motion.button>
            ))}

            {/* Botão Zero - ocupa coluna inteira */}
            <motion.button
              key="0"
              type="button"
              onClick={() => handleNumberClick('0')}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={password.length >= 6}
              className="col-span-3 h-16 rounded-2xl bg-white/70 hover:bg-white text-text-primary font-bold text-xl shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-brand-red/30"
            >
              0
            </motion.button>
          </motion.div>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="grid grid-cols-2 gap-3"
          >
            <motion.button
              type="button"
              onClick={handleClear}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-14 rounded-2xl bg-white/60 hover:bg-white text-text-secondary font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-red/30"
            >
              Limpar
            </motion.button>

            <motion.button
              type="button"
              onClick={handleBackspace}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={password.length === 0}
              className="h-14 rounded-2xl bg-white/60 hover:bg-white text-text-secondary shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-brand-red/30 flex items-center justify-center"
            >
              <Delete size={20} strokeWidth={2} />
            </motion.button>
          </motion.div>

          {/* Botão Confirmar */}
          <motion.button
            type="submit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={isPasswordComplete ? { scale: 1.02 } : {}}
            whileTap={isPasswordComplete ? { scale: 0.98 } : {}}
            disabled={!isPasswordComplete}
            className="w-full h-16 rounded-2xl bg-brand-red hover:bg-brand-red-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-red/30"
          >
            Confirmar
          </motion.button>
        </form>
      </div>

      {/* Botão Voltar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
        className="w-full flex justify-center pb-4"
      >
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span className="font-medium">Voltar</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
