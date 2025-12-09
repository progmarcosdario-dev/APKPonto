import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function WelcomeScreen({ onStart }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const fullscreenButtonRef = React.useRef(null);

  const handleFullscreen = async () => {
    try {
      const docElement = document.documentElement;

      console.log('Tentando fullscreen...');

      if (docElement.requestFullscreen) {
        await docElement.requestFullscreen({ navigationUI: "hide" });
        console.log('✓ Fullscreen ativado!');
      } else if (docElement.webkitRequestFullscreen) {
        await docElement.webkitRequestFullscreen();
        console.log('✓ Fullscreen (webkit) ativado!');
      }

      // Travar orientação para portrait
      if (window.screen?.orientation?.lock) {
        try {
          await window.screen.orientation.lock('portrait-primary');
          console.log('✓ Orientação travada para portrait');
        } catch (e) {
          console.log('Lock orientação não suportado');
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
        padding: '2rem 2rem 20rem 2rem',
        backgroundColor: '#EBEBEB',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Botão Fullscreen - Canto Superior Direito */}
      <button
        ref={fullscreenButtonRef}
        onClick={handleFullscreen}
        title="Tela Cheia"
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(227, 6, 19, 0.2)',
          border: '1px solid rgba(227, 6, 19, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          transition: 'all 0.2s',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(227, 6, 19, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(227, 6, 19, 0.2)';
        }}
      >
        ⛶
      </button>
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
              backgroundColor: '#FFFFFF'
            }}
          />
        </motion.div>
      </div>

      {/* Conteúdo Central */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        maxWidth: '28rem',
        width: '100%'
      }}>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#2A2A2A' }}>Controle de Ponto</h1>
        </motion.div>

        {/* Data e Hora */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#5A5A5A' }} strokeWidth={2} />
            <p style={{ color: '#5A5A5A', fontSize: '0.875rem' }}>
              {formatDate(currentTime)}
            </p>
          </div>
          <p style={{
            textAlign: 'center',
            color: '#2A2A2A',
            fontSize: '3rem',
            fontFamily: "'Courier New', monospace",
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.025em',
            fontWeight: 700
          }}>
            {formatTime(currentTime)}
          </p>
        </motion.div>

        {/* Instrução */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ color: '#6A6A6A', fontSize: '0.875rem' }}>
            Toque no botão abaixo para iniciar seu registro
          </p>
        </motion.div>

        {/* Botão CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          style={{
            marginTop: '1rem',
            height: '4rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            backgroundColor: '#E30613',
            color: '#FFFFFF',
            borderRadius: '1rem',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#B30510';
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#E30613';
            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 4px rgba(227, 6, 19, 0.3)';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
        >
          <Clock style={{ width: '1.75rem', height: '1.75rem' }} strokeWidth={2} />
          <span style={{ lineHeight: 0 }}>Registrar Ponto</span>
        </motion.button>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#5A5A5A',
            marginTop: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(4px)',
            borderRadius: '9999px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem'
          }}
        >
          <div style={{
            width: '0.625rem',
            height: '0.625rem',
            backgroundColor: '#0F7C3E',
            borderRadius: '9999px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          <p style={{ fontSize: '0.75rem' }}>Sistema online e pronto</p>
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        paddingBottom: '5rem',
        marginTop: '4rem'
      }}>
        <p style={{ color: '#6A6A6A', fontSize: '0.75rem' }}>
          Versão 1.0 — Desenvolvido por <a href="https://www.erikadario.design/" style={{ color: '#E30613', textDecoration: 'none' }}>https://www.erikadario.design/</a>
        </p>
        <p style={{ color: '#7A7A7A', fontSize: '0.75rem' }}>
          © 2025 Impacto Locações de Equipamentos
        </p>
      </div>
    </motion.div>
  );
}
