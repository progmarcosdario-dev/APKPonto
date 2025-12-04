import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/api';
import logo from '../assets/logo.png';

export default function TimeEntryScreen({ employeeName, onSave, onBack, completedEntries }) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error'); // 'error' ou 'warning'
  const [isLoading, setIsLoading] = useState(false);
  const [autoSelectedType, setAutoSelectedType] = useState(null);
  const [typeLabel, setTypeLabel] = useState('');

  // Mapa de tipos para labels
  const tipoMarcacaoMap = {
    1: { label: 'Início expediente', icon: '🟢', color: 'success' },
    2: { label: 'Saída intervalo', icon: '🟡', color: 'warning' },
    3: { label: 'Retorno intervalo', icon: '🟡', color: 'warning' },
    4: { label: 'Final expediente', icon: '🔴', color: 'error' }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Determinar tipo auto-selecionado baseado no histórico
  useEffect(() => {
    const determinarTipo = () => {
      const sequencia = {
        0: 1, // Nenhum registro = Início
        1: 2, // Início -> Saída intervalo
        2: 3, // Saída intervalo -> Retorno intervalo
        3: 4, // Retorno intervalo -> Final
        4: 1  // Final -> Início (novo dia)
      };

      // Ordenar completedEntries e pegar o último
      const proximoIdx = completedEntries.length;
      const proximoTipo = sequencia[proximoIdx] || 1;

      setAutoSelectedType(proximoTipo);
      setTypeLabel(tipoMarcacaoMap[proximoTipo]?.label || 'Tipo desconhecido');
    };

    determinarTipo();
  }, [completedEntries]);

  const formatDateTime = (date) => {
    const dateStr = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime(currentDateTime);

  const handleConfirm = async () => {
    // Não permitir confirmar se o dia está completo
    if (completedEntries.length >= 4 || !autoSelectedType) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(autoSelectedType);
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      setAlertMessage(error.message || 'Erro ao registrar ponto');
      setAlertType('error');
    } finally {
      setIsLoading(false);
    }
  };

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
        padding: '0.75rem 2rem',
        backgroundColor: '#EBEBEB',
        overflow: 'hidden'
      }}
    >
      {/* Logo */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '0', flexShrink: 0 }}>
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
              width: '4.5rem',
              height: 'auto',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white'
            }}
          />
        </motion.div>
      </div>

      {/* Conteúdo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        justifyContent: 'center',
        maxWidth: '40rem',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Card: Informações */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '1rem',
            padding: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            width: '100%',
            flexShrink: 0
          }}
        >
          {/* Funcionário */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: '#E30613',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <User size={18} strokeWidth={2} color="white" />
            </div>
            <div>
              <p style={{ color: '#5A5A5A', fontSize: '0.65rem', margin: '0.1rem 0' }}>Funcionário</p>
              <p style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{employeeName}</p>
            </div>
          </div>

          {/* Data e Hora */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: '#FFB800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <Clock size={18} strokeWidth={2} color="white" />
            </div>
            <div>
              <p style={{ color: '#5A5A5A', fontSize: '0.65rem', margin: '0.1rem 0' }}>{dateStr}</p>
              <p style={{ color: '#E30613', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace', margin: 0 }}>{timeStr}</p>
            </div>
          </div>
        </motion.div>

        {/* Alerta de Mensagem */}
        <AnimatePresence>
          {alertMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                width: '100%',
                backgroundColor: alertType === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                backdropFilter: 'blur(4px)',
                border: `1px solid ${alertType === 'error' ? 'rgb(252, 165, 165)' : 'rgb(251, 191, 126)'}`,
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{alertType === 'error' ? '❌' : '⚠️'}</span>
              <span style={{ color: alertType === 'error' ? '#991B1B' : '#B45309', fontWeight: 500, fontSize: '0.875rem' }}>{alertMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tipo Auto-Selecionado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%'
          }}
        >
          <p style={{ color: '#5A5A5A', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>Tipo de ponto</p>

          {autoSelectedType && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              borderRadius: '1rem',
              padding: '1.25rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              width: '100%'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                backgroundColor: autoSelectedType === 1 ? 'rgba(15, 124, 62, 0.2)' :
                                autoSelectedType === 2 || autoSelectedType === 3 ? 'rgba(217, 119, 6, 0.2)' :
                                autoSelectedType === 4 ? 'rgba(220, 38, 38, 0.2)' : 'rgba(200, 200, 200, 0.2)',
                flexShrink: 0
              }}>
                {tipoMarcacaoMap[autoSelectedType]?.icon || '⚪'}
              </div>
              <div>
                <p style={{ color: '#5A5A5A', fontSize: '0.75rem', margin: '0.1rem 0' }}>Próximo ponto</p>
                <p style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{typeLabel}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Botões */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center',
          paddingTop: '0.5rem',
          flexShrink: 0
        }}
      >
        <motion.button
          onClick={onBack}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: '#5A5A5A',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'color 0.2s',
            opacity: isLoading ? 0.5 : 1
          }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.color = '#2A2A2A')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.color = '#5A5A5A')}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span>Cancelar</span>
        </motion.button>

        <motion.button
          onClick={handleConfirm}
          disabled={!autoSelectedType || isLoading}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          style={{
            marginLeft: 'auto',
            height: '2.6rem',
            paddingLeft: '1.25rem',
            paddingRight: '1.25rem',
            backgroundColor: '#0F7C3E',
            color: 'white',
            fontWeight: 700,
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? '⏳ Registrando...' : 'Confirmar'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
