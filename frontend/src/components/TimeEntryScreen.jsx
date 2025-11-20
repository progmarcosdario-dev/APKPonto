import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowLeft } from 'lucide-react';
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
    <div className="time-entry-screen">
      {/* Logo */}
      <div className="time-entry-logo-container">
        <div className="time-entry-logo-wrapper">
          <img src={logo} alt="Scopum Logo" className="scopum-logo-image" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="time-entry-content">
        {/* Informações do Usuário */}
        <div className="time-entry-user-info">
          <User size={20} />
          <span>{employeeName}</span>
        </div>

        {/* Data e Hora */}
        <div className="time-entry-datetime">
          <Clock size={20} />
          <div>
            <p className="time-entry-date">{dateStr}</p>
            <p className="time-entry-time">{timeStr}</p>
          </div>
        </div>

        {/* Título */}
        <h1 className="time-entry-title">Selecione o tipo de ponto</h1>

        {/* Alerta de Duplicata */}
        {duplicateAlert && (
          <div className="time-entry-alert">
            <span>⚠️ {duplicateAlert}</span>
          </div>
        )}

        {/* Grid de Tipos */}
        <div className="time-entry-types-grid">
          {entryTypes.map((type) => {
            const isEnabled = isEntryTypeEnabled(type.id);
            const isCompleted = completedEntries.includes(type.id);

            return (
              <button
                key={type.id}
                onClick={() => handleTypeClick(type.id)}
                className={`time-entry-type-card ${
                  selectedType === type.id ? 'active' : ''
                } ${!isEnabled ? 'disabled' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
                disabled={!isEnabled}
                title={isCompleted ? 'Este ponto já foi registrado hoje' : ''}
              >
                <span className="time-entry-type-emoji">{type.icon}</span>
                <span className="time-entry-type-label">{type.label}</span>
                {isCompleted && <span className="time-entry-type-check">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Campo de Observação */}
        {selectedType && (
          <div className="time-entry-observation">
            <label>Observação (opcional)</label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Digite uma observação..."
              className="time-entry-textarea"
              rows="3"
            />
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="time-entry-footer">
        <button
          onClick={onBack}
          className="time-entry-back-button"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {selectedType && (
          <button
            onClick={handleSave}
            className="time-entry-save-button"
          >
            Registrar Ponto
          </button>
        )}
      </div>
    </div>
  );
}
