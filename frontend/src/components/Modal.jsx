import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, title, message, type = 'error', onConfirm, confirmText = 'OK' }) {
  const bgColor = type === 'error' ? 'rgba(220, 38, 38, 0.1)' :
                  type === 'warning' ? 'rgba(217, 119, 6, 0.1)' :
                  type === 'success' ? 'rgba(15, 124, 62, 0.1)' : 'rgba(100, 100, 100, 0.1)';

  const borderColor = type === 'error' ? 'rgb(252, 165, 165)' :
                      type === 'warning' ? 'rgb(251, 191, 126)' :
                      type === 'success' ? 'rgb(134, 239, 172)' : 'rgb(200, 200, 200)';

  const buttonColor = type === 'error' ? '#DC2626' :
                      type === 'warning' ? '#D97706' :
                      type === 'success' ? '#0F7C3E' : '#6B7280';

  const icon = type === 'error' ? '❌' :
               type === 'warning' ? '⚠️' :
               type === 'success' ? '✅' : 'ℹ️';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onConfirm}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: '1.25rem',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              minWidth: '320px',
              maxWidth: '400px',
              border: `2px solid ${borderColor}`
            }}
          >
            {/* Ícone */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1rem'
              }}
            >
              {icon}
            </motion.div>

            {/* Título */}
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  color: '#2A2A2A',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  margin: '0 0 0.75rem',
                  fontFamily: 'inherit'
                }}
              >
                {title}
              </motion.h2>
            )}

            {/* Mensagem */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                color: '#5A5A5A',
                fontSize: '0.95rem',
                textAlign: 'center',
                margin: '0 0 1.5rem',
                lineHeight: '1.5',
                fontFamily: 'inherit'
              }}
            >
              {message}
            </motion.p>

            {/* Botão */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: buttonColor,
                color: 'white',
                fontWeight: 700,
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontFamily: 'inherit'
              }}
            >
              {confirmText}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
