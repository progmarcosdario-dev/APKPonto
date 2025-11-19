import React, { useState } from 'react';
import { Lock, ArrowLeft, Backspace } from 'lucide-react';

export default function PasswordScreen({ onConfirm, onCancel, error }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  };

  const handleNumberClick = (num) => {
    setPassword(prev => prev + num);
  };

  const handleClear = () => {
    setPassword('');
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  return (
    <div className="password-screen">
      {/* Logo */}
      <div className="password-logo-container">
        <div className="password-logo-wrapper">
          <div className="scopum-logo">
            📦
          </div>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="password-content">
        {/* Ícone */}
        <div className="password-icon-container">
          <div className="password-icon-circle">
            <Lock className="password-lock-icon" size={40} />
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="password-form">
          {/* Label */}
          <div className="password-label-container">
            <label className="password-label">
              Digite sua senha
            </label>
          </div>

          {/* Input Display */}
          <div className="password-input-container">
            <input
              type="password"
              value={password}
              onChange={() => {}} // Controlado apenas via botões
              placeholder="●●●●●●"
              className="password-input"
              disabled
            />
          </div>

          {/* Erro */}
          {error && (
            <p className="password-error-text">
              {error}
            </p>
          )}

          {/* Teclado Numérico */}
          <div className="password-keyboard">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num.toString())}
                className="password-number-button"
                disabled={password.length >= 6}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="password-action-buttons">
            <button
              type="button"
              onClick={handleClear}
              className="password-clear-button"
            >
              Limpar
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="password-backspace-button"
              disabled={password.length === 0}
            >
              <Backspace size={20} />
            </button>
          </div>

          {/* Botão Confirmar */}
          <button
            type="submit"
            disabled={password.length < 6}
            className="password-submit-button"
          >
            Confirmar
          </button>
        </form>
      </div>

      {/* Botão Voltar */}
      <div className="password-footer">
        <button
          onClick={onCancel}
          className="password-back-button"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
      </div>
    </div>
  );
}
