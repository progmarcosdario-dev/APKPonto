import React, { useState } from 'react';
import { Lock, ArrowLeft, Delete } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function PasswordScreen({ onConfirm, onCancel }) {
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#EBEBEB'
      }}
    >
      {/* Logo */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
          style={{ position: 'relative' }}
        >
          <img
            src={logo}
            alt="Scopum Logo"
            style={{
              width: '8rem',
              height: 'auto',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white'
            }}
          />
        </motion.div>
      </div>

      {/* Conteúdo Central */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        flex: 1,
        justifyContent: 'center',
        maxWidth: '28rem',
        width: '100%'
      }}>
        {/* Ícone */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 150 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '5rem',
            height: '5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Lock style={{ width: '2.5rem', height: '2.5rem', color: '#E30613', strokeWidth: 2 }} />
        </motion.div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: 'center' }}
          >
            <label style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '1.125rem' }}>
              Digite sua senha
            </label>
          </motion.div>

          {/* Input Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              borderRadius: '1rem',
              padding: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: password.length > 0 ? '2px solid #E30613' : 'none'
            }}
          >
            <input
              type="password"
              value={password}
              onChange={() => {}}
              placeholder="●●●●●●"
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '1.875rem',
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
                color: '#2A2A2A',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                paddingRight: '1rem'
              }}
              disabled
            />
          </motion.div>

          {/* Teclado Numérico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem'
            }}
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
                style={{
                  height: '4rem',
                  borderRadius: '1rem',
                  backgroundColor: password.length >= 6 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                  color: '#2A2A2A',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: password.length >= 6 ? 'not-allowed' : 'pointer',
                  opacity: password.length >= 6 ? 0.4 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {num}
              </motion.button>
            ))}

            {/* Linha com Limpar, 0 e Delete */}
            <motion.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                height: '4rem',
                borderRadius: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                color: '#E30613',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Limpar
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleNumberClick('0')}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={password.length >= 6}
              style={{
                height: '4rem',
                borderRadius: '1rem',
                backgroundColor: password.length >= 6 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                color: '#2A2A2A',
                fontWeight: 700,
                fontSize: '1.25rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: password.length >= 6 ? 'not-allowed' : 'pointer',
                opacity: password.length >= 6 ? 0.4 : 1,
                transition: 'all 0.2s'
              }}
            >
              0
            </motion.button>

            <motion.button
              type="button"
              onClick={handleBackspace}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={password.length === 0}
              style={{
                height: '4rem',
                borderRadius: '1rem',
                backgroundColor: password.length === 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                color: '#5A5A5A',
                fontWeight: 600,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: password.length === 0 ? 'not-allowed' : 'pointer',
                opacity: password.length === 0 ? 0.4 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Delete size={20} strokeWidth={2} />
            </motion.button>
          </motion.div>

          {/* Botão Confirmar */}
          <motion.button
            type="submit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            whileHover={isPasswordComplete ? { scale: 1.02 } : {}}
            whileTap={isPasswordComplete ? { scale: 0.98 } : {}}
            disabled={!isPasswordComplete}
            style={{
              width: '100%',
              height: '4rem',
              borderRadius: '1rem',
              backgroundColor: isPasswordComplete ? '#E30613' : 'rgba(227, 6, 19, 0.4)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.125rem',
              boxShadow: isPasswordComplete ? '0 10px 15px -3px rgba(227, 6, 19, 0.3)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: isPasswordComplete ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Confirmar
          </motion.button>
        </form>
      </div>

      {/* Botão Voltar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: '1rem' }}
      >
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#5A5A5A',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2A2A2A'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#5A5A5A'}
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span>Voltar</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
