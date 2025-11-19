import React, { useState, useEffect, FC } from 'react';
import { Clock } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: FC<WelcomeScreenProps> = ({ onStart }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Bom dia');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date): string => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="welcome-screen">
      {/* Logo */}
      <div className="welcome-logo-container">
        <div className="welcome-logo-wrapper">
          <div className="scopum-logo">
            📦
          </div>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="welcome-content">
        <div className="welcome-greeting">
          <p className="welcome-greeting-text">{greeting}</p>
        </div>

        <h1 className="welcome-title">Scopum</h1>

        <p className="welcome-subtitle">Controle de Ponto</p>

        {/* Data e Hora */}
        <div className="welcome-datetime">
          <div className="welcome-date-container">
            <Clock className="welcome-clock-icon" />
            <p className="welcome-date">{formatDate(currentTime)}</p>
          </div>
          <p className="welcome-time">{formatTime(currentTime)}</p>
        </div>
      </div>

      {/* Botão */}
      <div className="welcome-button-container">
        <button
          onClick={onStart}
          className="welcome-button"
        >
          Começar
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
