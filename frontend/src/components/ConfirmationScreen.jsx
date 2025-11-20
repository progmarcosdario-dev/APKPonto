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
      {/* Logo com Check */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '1rem', position: 'relative' }}>
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
          {/* Círculo com Check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{
              position: 'absolute',
              bottom: '-0.5rem',
              right: '-0.5rem',
              backgroundColor: '#0F7C3E',
              borderRadius: '50%',
              padding: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white', strokeWidth: 2 }} />
          </motion.div>
        </motion.div>
      </div>

      {/* Conteúdo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        flex: 1,
        justifyContent: 'center',
        maxWidth: '28rem',
        width: '100%'
      }}>
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#2A2A2A',
            textAlign: 'center'
          }}
        >
          Ponto Registrado!
        </motion.h1>

        {/* Card com Informações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Tipo de Entrada */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: currentEntryInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              {currentEntryInfo.emoji}
            </div>
            <div>
              <p style={{ color: '#2A2A2A', fontWeight: 700, fontSize: '1rem', margin: '0.25rem 0' }}>
                {currentEntryInfo.label}
              </p>
              <p style={{ color: '#5A5A5A', fontSize: '0.75rem', margin: 0 }}>
                Registro {currentEntryNumber} do dia
              </p>
            </div>
          </div>

          {/* Detalhes */}
          <div style={{
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#2A2A2A'
              }}
            >
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: '#E30613',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}>
                <User size={16} strokeWidth={2} />
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{employeeName}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#2A2A2A'
              }}
            >
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: '#FFB800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}>
                <Calendar size={16} strokeWidth={2} />
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.95rem', textTransform: 'capitalize' }}>{dateStr}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#2A2A2A'
              }}
            >
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}>
                <Clock size={16} strokeWidth={2} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>{timestamp}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Progresso de Registros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <p style={{ color: '#5A5A5A', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>
            Registros do dia
          </p>
          <div style={{
            width: '100%',
            height: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(4px)',
            borderRadius: '9999px',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              style={{
                height: '100%',
                background: 'linear-gradient(to right, #0F7C3E, #E30613)',
                borderRadius: '9999px'
              }}
            />
          </div>
          <p style={{ color: '#2A2A2A', fontWeight: 700, textAlign: 'center', margin: 0 }}>
            {completedEntries.length} de 4 pontos
          </p>
        </motion.div>
      </div>

      {/* Rodapé */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1rem'
      }}>
        {/* Countdown */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            color: '#5A5A5A',
            fontSize: '0.875rem',
            margin: 0
          }}
        >
          Retornando em <span style={{ fontWeight: 700, color: '#E30613' }}>{countdown}s</span>...
        </motion.p>
      </div>
    </motion.div>
  );
}
