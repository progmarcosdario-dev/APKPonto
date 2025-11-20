import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/api';
import logo from '../assets/logo.png';

export default function TimeEntryScreen({ employeeName, onSave, onBack, completedEntries }) {
  const [selectedType, setSelectedType] = useState(null);
  const [observation, setObservation] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [entryTypes, setEntryTypes] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Carregar tipos de marcação do Firebird
  useEffect(() => {
    const carregarTipos = async () => {
      try {
        const response = await API.get('/ponto/tipos');
        if (response.data && response.data.tipos) {
          // Mapear os dados do Firebird para o formato esperado
          const tipos = response.data.tipos.map((tipo) => ({
            id: tipo.CODIGO,
            label: tipo.DESCRICAO,
            icon: getIconForType(tipo.CODIGO),
            color: getColorForType(tipo.CODIGO),
          }));
          setEntryTypes(tipos);
        }
      } catch (erro) {
        console.error('Erro ao carregar tipos de marcação:', erro);
        // Fallback: usar tipos padrão se houver erro
        setEntryTypes([
          { id: 1, label: 'Início expediente', icon: '🟢', color: 'success' },
          { id: 2, label: 'Saída intervalo', icon: '🟡', color: 'warning' },
          { id: 3, label: 'Retorno intervalo', icon: '🟡', color: 'warning' },
          { id: 4, label: 'Final expediente', icon: '🔴', color: 'error' },
        ]);
      }
    };

    carregarTipos();
  }, []);

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

  const getIconForType = (typeId) => {
    const iconMap = {
      1: '🟢',
      2: '🟡',
      3: '🟡',
      4: '🔴',
    };
    return iconMap[typeId] || '⚪';
  };

  const getColorForType = (typeId) => {
    const colorMap = {
      1: 'success',
      2: 'warning',
      3: 'warning',
      4: 'error',
    };
    return colorMap[typeId] || 'neutral';
  };

  const isEntryTypeEnabled = (typeId) => {
    // Não permitir registrar o mesmo tipo duas vezes
    return !completedEntries.includes(typeId);
  };

  const handleTypeClick = (typeId) => {
    const isEnabled = isEntryTypeEnabled(typeId);

    if (!isEnabled) {
      // Mostrar alerta se já foi registrado
      setDuplicateAlert(`Este ponto já foi registrado hoje!`);
      setTimeout(() => setDuplicateAlert(null), 3000);
      return;
    }

    setSelectedType(typeId);
    setDuplicateAlert(null);
  };

  const handleSave = () => {
    if (selectedType) {
      onSave(selectedType, observation);
      setSelectedType(null);
      setObservation('');
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

      {/* Conteúdo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        flex: 1,
        justifyContent: 'center',
        maxWidth: '40rem',
        width: '100%'
      }}>
        {/* Card: Registrar ponto */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            width: '100%'
          }}
        >
          <h3 style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>Registrar ponto</h3>

          {/* Funcionário */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: '#E30613',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem'
            }}>
              <User size={20} strokeWidth={2} color="white" />
            </div>
            <div>
              <p style={{ color: '#5A5A5A', fontSize: '0.75rem', margin: '0.25rem 0' }}>Funcionário</p>
              <p style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '1rem', margin: 0 }}>{employeeName}</p>
            </div>
          </div>

          {/* Data e Hora */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: '#FFB800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700
            }}>
              <Clock size={20} strokeWidth={2} color="white" />
            </div>
            <div>
              <p style={{ color: '#5A5A5A', fontSize: '0.75rem', margin: '0.25rem 0' }}>{dateStr}</p>
              <p style={{ color: '#E30613', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'monospace', margin: 0 }}>{timeStr}</p>
            </div>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            color: '#2A2A2A',
            fontWeight: 700,
            fontSize: '1rem',
            textAlign: 'center',
            margin: '1rem 0'
          }}
        >
          Tipo de ponto
        </motion.h2>

        {/* Alerta de Duplicata */}
        <AnimatePresence>
          {duplicateAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgb(252, 165, 165)',
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <span style={{ color: '#991B1B', fontWeight: 500, fontSize: '0.875rem' }}>{duplicateAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Tipos - Cards Verticais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%'
          }}
        >
          {entryTypes.map((type, idx) => {
            const isEnabled = isEntryTypeEnabled(type.id);
            const isCompleted = completedEntries.includes(type.id);

            return (
              <motion.button
                key={type.id}
                onClick={() => handleTypeClick(type.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (idx * 0.05) }}
                whileHover={isEnabled ? { scale: 1.02 } : {}}
                whileTap={isEnabled ? { scale: 0.98 } : {}}
                disabled={!isEnabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: selectedType === type.id ? 'rgba(227, 6, 19, 0.1)' : 'rgba(255, 255, 255, 0.6)',
                  border: selectedType === type.id ? '2px solid #E30613' : 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  cursor: isEnabled ? 'pointer' : 'not-allowed',
                  opacity: isEnabled ? 1 : 0.5,
                  transition: 'all 0.2s',
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '1rem'
                }}
              >
                {/* Radio Button */}
                <div style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  border: selectedType === type.id ? '2px solid #E30613' : '2px solid #D1D5DB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedType === type.id && (
                    <div style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      borderRadius: '50%',
                      backgroundColor: '#E30613'
                    }} />
                  )}
                </div>

                {/* Ícone */}
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '1.5rem',
                  backgroundColor: type.color === 'success' ? 'rgba(15, 124, 62, 0.2)' :
                                   type.color === 'warning' ? 'rgba(217, 119, 6, 0.2)' :
                                   type.color === 'error' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(200, 200, 200, 0.2)'
                }}>
                  {type.icon}
                </div>

                {/* Label */}
                <span style={{
                  flex: 1,
                  color: '#2A2A2A',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {type.label}
                </span>

                {/* Checkmark ou Lock */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      backgroundColor: '#0F7C3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      flexShrink: 0
                    }}
                  >
                    ✓
                  </motion.div>
                )}
                {!isEnabled && !isCompleted && (
                  <div style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E30613',
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    🔒
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Campo de Observação */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <label style={{ color: '#2A2A2A', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                Observação (opcional)
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Digite uma observação..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  color: '#2A2A2A',
                  resize: 'none',
                  outline: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  minHeight: '5rem'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botões */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'center',
          paddingBottom: '1rem'
        }}
      >
        <motion.button
          onClick={onBack}
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
          <span>Cancelar</span>
        </motion.button>

        {selectedType && (
          <motion.button
            onClick={handleSave}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginLeft: 'auto',
              height: '3.5rem',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              backgroundColor: '#0F7C3E',
              color: 'white',
              fontWeight: 700,
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            Confirmar
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
