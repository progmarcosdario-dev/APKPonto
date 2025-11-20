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

      {/* Conteúdo */}
      <div className="flex flex-col items-center gap-6 flex-1 justify-center max-w-2xl w-full">
        {/* Informações do Usuário */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg"
        >
          <User size={18} className="text-text-secondary" strokeWidth={2} />
          <span className="text-text-primary font-medium">{employeeName}</span>
        </motion.div>

        {/* Data e Hora */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg w-full"
        >
          <div className="flex items-center gap-4">
            <Clock size={18} className="text-text-secondary flex-shrink-0" strokeWidth={2} />
            <div className="flex-1">
              <p className="text-text-secondary text-sm">{dateStr}</p>
              <p className="text-text-primary text-2xl font-mono tabular-nums font-bold">{timeStr}</p>
            </div>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-text-primary font-bold text-xl text-center mt-2"
        >
          Selecione o tipo de ponto
        </motion.h1>

        {/* Alerta de Duplicata */}
        <AnimatePresence>
          {duplicateAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="w-full bg-red-100/80 backdrop-blur-sm border border-red-300 rounded-2xl p-4 flex items-center gap-3"
            >
              <span className="text-2xl">⚠️</span>
              <span className="text-red-800 font-medium text-sm">{duplicateAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de Tipos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          {entryTypes.map((type, idx) => {
            const isEnabled = isEntryTypeEnabled(type.id);
            const isCompleted = completedEntries.includes(type.id);

            return (
              <motion.button
                key={type.id}
                onClick={() => handleTypeClick(type.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + (idx * 0.05) }}
                whileHover={isEnabled ? { scale: 1.05 } : {}}
                whileTap={isEnabled ? { scale: 0.95 } : {}}
                disabled={!isEnabled}
                className={`relative h-32 rounded-2xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-red/30 ${
                  selectedType === type.id
                    ? 'bg-brand-red text-white ring-4 ring-brand-red/50'
                    : 'bg-white/70 hover:bg-white text-text-primary'
                } ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={isCompleted ? 'Este ponto já foi registrado hoje' : ''}
              >
                {/* Checkmark para completado */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center"
                  >
                    <span className="text-white font-bold text-sm">✓</span>
                  </motion.div>
                )}

                {/* Conteúdo */}
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-5xl">{type.icon}</span>
                  <span className="font-semibold text-sm text-center px-2 leading-tight">
                    {type.label}
                  </span>
                </div>
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
              className="w-full space-y-3"
            >
              <label className="text-text-primary font-semibold text-sm">
                Observação (opcional)
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Digite uma observação..."
                className="w-full p-4 rounded-2xl border-none bg-white/70 text-text-primary placeholder:text-text-secondary/50 resize-none outline-none focus:ring-4 focus:ring-brand-red/30 shadow-lg"
                rows="3"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botões */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full flex items-center gap-4 justify-center pb-4"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span className="font-medium">Voltar</span>
        </motion.button>

        {selectedType && (
          <motion.button
            onClick={handleSave}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="ml-auto h-14 px-8 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-green/30"
          >
            Registrar Ponto
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
