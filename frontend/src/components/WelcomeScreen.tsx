import React, { useState, useEffect, FC } from 'react';

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
      {/* Logo/Personagem */}
      <div className="welcome-character">
        🧑
      </div>

      {/* Título Principal */}
      <h1 className="welcome-main-title">Registro de Ponto</h1>

      {/* Data e Hora em Destaque */}
      <div className="welcome-datetime-box">
        <p className="welcome-date-text">{formatDate(currentTime)}</p>
        <p className="welcome-time-text">{formatTime(currentTime)}</p>
      </div>

      {/* Mensagem */}
      <p className="welcome-instruction">Toque no botão abaixo para iniciar seu registro</p>

      {/* Botão Principal */}
      <button onClick={onStart} className="welcome-main-button">
        Registrar Ponto
      </button>

      {/* Status */}
      <div className="welcome-status">
        <span className="status-dot"></span>
        <span className="status-text">Sistema online e pronto</span>
      </div>

      {/* Footer com Versão */}
      <div className="welcome-footer">
        <p className="welcome-version">Versão 1.0 — acesso restrito</p>
        <p className="welcome-copyright">© 2025 Impacto Locações de Equipamentos</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
