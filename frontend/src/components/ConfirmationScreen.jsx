import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, User, Calendar } from 'lucide-react';

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
    start: { label: 'Início expediente', emoji: '🟢', color: '#0F7C3E' },
    break_start: { label: 'Saída intervalo', emoji: '🟡', color: '#F59E0B' },
    break_end: { label: 'Retorno intervalo', emoji: '🟡', color: '#F59E0B' },
    end: { label: 'Final expediente', emoji: '🔴', color: '#E30613' },
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

  return (
    <div className="confirmation-screen">
      {/* Logo */}
      <div className="confirmation-logo-container">
        <div className="confirmation-logo-wrapper">
          <div className="scopum-logo">
            📦
          </div>
          {/* Círculo com Check */}
          <div className="confirmation-check-circle">
            <CheckCircle className="confirmation-check-icon" />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="confirmation-content">
        <h1 className="confirmation-title">Ponto Registrado!</h1>

        {/* Card com Informações */}
        <div className="confirmation-card">
          <div className="confirmation-entry-info">
            <span className="confirmation-emoji">{currentEntryInfo.emoji}</span>
            <div>
              <p className="confirmation-entry-type">
                {currentEntryInfo.label}
              </p>
              <p className="confirmation-entry-number">
                Registro {currentEntryNumber} do dia
              </p>
            </div>
          </div>

          <div className="confirmation-details">
            <div className="confirmation-detail-row">
              <User size={18} />
              <span>{employeeName}</span>
            </div>
            <div className="confirmation-detail-row">
              <Calendar size={18} />
              <span>{dateStr}</span>
            </div>
            <div className="confirmation-detail-row">
              <Clock size={18} />
              <span>{timestamp}</span>
            </div>
          </div>
        </div>

        {/* Progresso de Registros */}
        <div className="confirmation-progress">
          <p className="confirmation-progress-label">
            Registros do dia
          </p>
          <div className="confirmation-progress-bar">
            <div
              className="confirmation-progress-fill"
              style={{ width: `${(completedEntries.length / 4) * 100}%` }}
            />
          </div>
          <p className="confirmation-progress-text">
            {completedEntries.length} de 4 pontos
          </p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="confirmation-footer">
        <p className="confirmation-countdown">
          Retornando em {countdown}s...
        </p>

        <div className="confirmation-buttons">
          <button
            onClick={onRegisterAnother}
            className="confirmation-register-button"
          >
            Registrar Outro
          </button>
        </div>
      </div>
    </div>
  );
}
