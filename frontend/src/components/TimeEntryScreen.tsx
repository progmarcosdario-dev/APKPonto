import React, { useState, useEffect, FC } from 'react';
import { Clock, User, ArrowLeft } from 'lucide-react';

interface TimeEntryScreenProps {
  employeeName: string;
  onSave: (type: string, observation: string) => void;
  onBack: () => void;
  completedEntries: string[];
}

type EntryTypeId = 'start' | 'break_start' | 'break_end' | 'end';

interface EntryType {
  id: EntryTypeId;
  label: string;
  icon: string;
  color: string;
}

const TimeEntryScreen: FC<TimeEntryScreenProps> = ({ employeeName, onSave, onBack, completedEntries }) => {
  const [selectedType, setSelectedType] = useState<EntryTypeId | null>(null);
  const [observation, setObservation] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date): { dateStr: string; timeStr: string } => {
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

  const entryTypes: EntryType[] = [
    { id: 'start', label: 'Início expediente', icon: '🟢', color: 'success' },
    { id: 'break_start', label: 'Saída intervalo', icon: '🟡', color: 'warning' },
    { id: 'break_end', label: 'Retorno intervalo', icon: '🟡', color: 'warning' },
    { id: 'end', label: 'Final expediente', icon: '🔴', color: 'error' },
  ];

  const isEntryTypeEnabled = (typeId: EntryTypeId): boolean => {
    if (typeId === 'start') {
      return !completedEntries.includes('start');
    }
    if (typeId === 'break_start') {
      return completedEntries.includes('start') && !completedEntries.includes('break_start');
    }
    if (typeId === 'break_end') {
      return completedEntries.includes('break_start') && !completedEntries.includes('break_end');
    }
    if (typeId === 'end') {
      const hasStart = completedEntries.includes('start');
      const hasBreakStart = completedEntries.includes('break_start');
      const hasBreakEnd = completedEntries.includes('break_end');
      const alreadyEnded = completedEntries.includes('end');

      if (alreadyEnded) return false;
      return hasStart && (!hasBreakStart || hasBreakEnd);
    }
    return false;
  };

  const handleSave = (): void => {
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
          <div className="scopum-logo">
            📦
          </div>
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

        {/* Grid de Tipos */}
        <div className="time-entry-types-grid">
          {entryTypes.map((type) => {
            const isEnabled = isEntryTypeEnabled(type.id);
            const isCompleted = completedEntries.includes(type.id);

            return (
              <button
                key={type.id}
                onClick={() => isEnabled && setSelectedType(type.id)}
                className={`time-entry-type-card ${
                  selectedType === type.id ? 'active' : ''
                } ${!isEnabled ? 'disabled' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
                disabled={!isEnabled}
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
              rows={3}
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
};

export default TimeEntryScreen;
