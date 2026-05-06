import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import FaceVerificationCard from './FaceVerificationCard.jsx';

export default function TimeEntryScreen({ employeeName, employeeCode, onSave, onBack, completedEntries }) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error'); // 'error' ou 'warning'
  const [isLoading, setIsLoading] = useState(false);
  const [autoSelectedType, setAutoSelectedType] = useState(null);
  const [typeLabel, setTypeLabel] = useState('');
  const [biometriaValidada, setBiometriaValidada] = useState(null);

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

  // Determinar tipo auto-selecionado usando APENAS lógica local (sem API)
  useEffect(() => {
    console.log('[TimeEntryScreen] completedEntries:', completedEntries);

    // Verificar dia da semana: 6 = sábado
    const diaAtual = new Date().getDay();
    const ehSabado = diaAtual === 6;

    // Lógica local simples e rápida
    const sequencia = ehSabado
      ? { 0: 1, 1: 4 }  // Sábado: apenas 1 (início) e 4 (fim)
      : { 0: 1, 1: 2, 2: 3, 3: 4 };  // Outros dias: 1→2→3→4

    const proximoIdx = completedEntries.length;
    const proximoTipo = sequencia[proximoIdx] || 1;

    console.log(`[TimeEntryScreen] Dia: ${ehSabado ? 'Sábado' : 'Outro'}, Índice: ${proximoIdx}, Tipo: ${proximoTipo}`);

    setAutoSelectedType(proximoTipo);
    setTypeLabel(tipoMarcacaoMap[proximoTipo]?.label || 'Tipo desconhecido');
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
      if (!biometriaValidada?.verificada) {
        setAlertMessage('Validacao facial obrigatoria antes de confirmar.');
        setAlertType('warning');
        return;
      }

      await onSave(autoSelectedType, biometriaValidada);
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
        justifyContent: 'flex-start',
        minHeight: '100vh',
        padding: '1rem 2rem 0.5rem 2rem',
        backgroundColor: '#EBEBEB',
        overflow: 'hidden'
      }}
    >
      {/* Logo */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem', flexShrink: 0 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
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

      {/* Conteúdo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'flex-start',
        maxWidth: '40rem',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Card: Funcionário, Data e Hora */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '1rem',
            padding: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            width: '100%',
            flexShrink: 0
          }}
        >
          {/* Funcionário */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '50%',
              backgroundColor: '#E30613',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <User size={23} strokeWidth={2} color="white" />
            </div>
            <div>
              <p style={{ color: '#5A5A5A', fontSize: '1.17rem', margin: '0.1rem 0' }}>Funcionário</p>
              <p style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '1.56rem', margin: 0 }}>{employeeName}</p>
            </div>
          </div>

          {/* Data e Hora */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '50%',
              backgroundColor: '#FFB800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <Clock size={23} strokeWidth={2} color="white" />
            </div>
            <div>
              <p style={{ color: '#5A5A5A', fontSize: '1.17rem', margin: '0.1rem 0' }}>{dateStr}</p>
              <p style={{ color: '#E30613', fontWeight: 700, fontSize: '1.76rem', fontFamily: 'monospace', margin: 0 }}>{timeStr}</p>
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
              <span style={{ fontSize: '1.95rem' }}>{alertType === 'error' ? '❌' : '⚠️'}</span>
              <span style={{ color: alertType === 'error' ? '#991B1B' : '#B45309', fontWeight: 500, fontSize: '1.5rem' }}>{alertMessage}</span>
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
            gap: '0.3rem',
            width: '100%'
          }}
        >
          <p style={{ color: '#5A5A5A', fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>Tipo de ponto</p>

          {autoSelectedType && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              borderRadius: '1rem',
              padding: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              width: '100%'
            }}>
              <div style={{
                width: '3.9rem',
                height: '3.9rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.95rem',
                backgroundColor: autoSelectedType === 1 ? 'rgba(15, 124, 62, 0.2)' :
                                autoSelectedType === 2 || autoSelectedType === 3 ? 'rgba(217, 119, 6, 0.2)' :
                                autoSelectedType === 4 ? 'rgba(220, 38, 38, 0.2)' : 'rgba(200, 200, 200, 0.2)',
                flexShrink: 0
              }}>
                {tipoMarcacaoMap[autoSelectedType]?.icon || '⚪'}
              </div>
              <div>
                <p style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '1.69rem', margin: 0 }}>{typeLabel}</p>
              </div>
            </div>
          )}

          <FaceVerificationCard
            funcionarioCodigo={employeeCode}
            onVerifiedChange={setBiometriaValidada}
          />

          {/* Botão Confirmar integrado logo abaixo do tipo */}
          <motion.button
            onClick={handleConfirm}
            disabled={!autoSelectedType || isLoading || !biometriaValidada?.verificada}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            style={{
              width: '100%',
              height: '4rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              backgroundColor: '#0F7C3E',
              color: 'white',
              fontWeight: 700,
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '1.95rem',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '0.3rem'
            }}
          >
            {isLoading ? '⏳ Registrando...' : 'Confirmar'}
          </motion.button>

          {/* Botão Cancelar logo abaixo do Confirmar */}
          <motion.button
            onClick={onBack}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#5A5A5A',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '1.43rem',
              fontWeight: 500,
              transition: 'color 0.2s',
              opacity: isLoading ? 0.5 : 1,
              marginTop: '0.2rem'
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.color = '#2A2A2A')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.color = '#5A5A5A')}
          >
            <ArrowLeft size={21} strokeWidth={2} />
            <span>Cancelar</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
