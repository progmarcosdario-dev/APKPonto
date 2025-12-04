import React, { useState } from 'react';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import PasswordScreen from './components/PasswordScreen.jsx';
import TimeEntryScreen from './components/TimeEntryScreen.jsx';
import ConfirmationScreen from './components/ConfirmationScreen.jsx';
import Modal from './components/Modal.jsx';
import API from './api/api';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [passwordError, setPasswordError] = useState('');
  const [registrationData, setRegistrationData] = useState({
    type: '',
    timestamp: '',
  });
  const [completedEntries, setCompletedEntries] = useState([]);
  const [funcionario, setFuncionario] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    confirmText: 'OK',
    onConfirmCallback: null
  });

  // Valores para teste/desenvolvimento
  const EMPLOYEE_NAME = 'Funcionário';

  const handleStart = () => {
    setCurrentScreen('password');
    setPasswordError('');
  };

  const handlePasswordConfirm = async (password) => {
    try {
      const response = await API.post('/auth/login', { senha: password });
      if (response.data && response.data.funcionario) {
        const codigo = response.data.funcionario.codigo;

        setFuncionario({
          codigo: codigo,
          nome: response.data.funcionario.nome
        });

        // Buscar histórico de hoje
        const hoje = new Date().toISOString().split('T')[0];
        try {
          const historicoResponse = await API.get(`/ponto/historico/${codigo}?data=${hoje}`);
          if (historicoResponse.data && historicoResponse.data.registros) {
            const tipos = historicoResponse.data.registros.map(r => r.tipo_marcacao);
            setCompletedEntries(tipos);

            // Verificar se já tem todos os 4 tipos de ponto
            if (tipos.length >= 4) {
              setModal({
                isOpen: true,
                title: 'Dia Completo',
                message: 'Você já bateu todos os pontos do dia',
                type: 'warning',
                confirmText: 'OK',
                onConfirmCallback: () => {
                  setCurrentScreen('welcome');
                  setFuncionario(null);
                  setCompletedEntries([]);
                  setModal(prev => ({ ...prev, isOpen: false }));
                }
              });
              return;
            }
          }
        } catch (erro) {
          console.log('Erro ao buscar histórico:', erro);
        }

        setPasswordError('');
        setCurrentScreen('entry');
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: 'Senha Incorreta',
        message: 'A senha digitada está incorreta. Tente novamente.',
        type: 'error',
        confirmText: 'OK',
        onConfirmCallback: () => {
          // Fechar modal apenas, voltar a tela de senha
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  const handlePasswordCancel = () => {
    setCurrentScreen('welcome');
    setModal({ isOpen: false, title: '', message: '', type: 'error', confirmText: 'OK' });
  };

  const handleSaveEntry = async (type) => {
    try {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Enviar para backend (tipo_marcacao opcional, será auto-selecionado)
      const response = await API.post('/ponto/registrar', {
        funcionario_codigo: funcionario?.codigo || '',
      });

      // Pegar o tipo de marcação retornado pelo backend
      const tipoRetornado = response.data.tipo_marcacao || type;

      // Verificar se há atraso
      if (response.data.atraso?.mensagem) {
        setModal({
          isOpen: true,
          title: 'Atraso Detectado',
          message: response.data.atraso.mensagem,
          type: 'warning',
          confirmText: 'OK',
          onConfirmCallback: () => {
            setRegistrationData({
              type: tipoRetornado,
              timestamp: timestamp,
            });
            setCurrentScreen('confirmation');
            setCompletedEntries([...completedEntries, tipoRetornado]);
            setModal(prev => ({ ...prev, isOpen: false }));
          }
        });
        return;
      }

      // Sem atraso, sucesso normal
      setRegistrationData({
        type: tipoRetornado,
        timestamp: timestamp,
      });

      setCurrentScreen('confirmation');
      setCompletedEntries([...completedEntries, tipoRetornado]);
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      // Verificar se é erro de duplicata
      if (error.response?.data?.erro === 'DUPLICATA_10_MINUTOS') {
        setModal({
          isOpen: true,
          title: 'Registro Recente',
          message: 'Você já bateu o ponto nos últimos 10 minutos!',
          type: 'warning',
          confirmText: 'OK',
          onConfirmCallback: () => {
            setCurrentScreen('welcome');
            setFuncionario(null);
            setCompletedEntries([]);
            setRegistrationData({ type: '', timestamp: '' });
            setModal(prev => ({ ...prev, isOpen: false }));
          }
        });
      } else {
        setModal({
          isOpen: true,
          title: 'Erro ao Registrar',
          message: error.response?.data?.mensagem || error.message || 'Erro desconhecido',
          type: 'error',
          confirmText: 'OK',
          onConfirmCallback: () => {
            setCurrentScreen('welcome');
            setFuncionario(null);
            setCompletedEntries([]);
            setRegistrationData({ type: '', timestamp: '' });
            setModal(prev => ({ ...prev, isOpen: false }));
          }
        });
      }
    }
  };

  const handleEntryBack = () => {
    setCurrentScreen('password');
  };

  const handleComplete = () => {
    setCurrentScreen('welcome');
    setRegistrationData({ type: '', timestamp: '' });
    setFuncionario(null);
    setCompletedEntries([]);
  };

  const handleRegisterAnother = () => {
    setCurrentScreen('password');
    setPasswordError('');
  };

  return (
    <div className="app-container">
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        onConfirm={() => {
          if (modal.onConfirmCallback) {
            modal.onConfirmCallback();
          } else {
            setModal(prev => ({ ...prev, isOpen: false }));
          }
        }}
      />

      {currentScreen === 'welcome' && (
        <WelcomeScreen key="welcome" onStart={handleStart} />
      )}

      {currentScreen === 'password' && (
        <PasswordScreen
          key="password"
          onConfirm={handlePasswordConfirm}
          onCancel={handlePasswordCancel}
        />
      )}

      {currentScreen === 'entry' && (
        <TimeEntryScreen
          key="entry"
          employeeName={funcionario?.nome || EMPLOYEE_NAME}
          onSave={handleSaveEntry}
          onBack={handleEntryBack}
          completedEntries={completedEntries}
        />
      )}

      {currentScreen === 'confirmation' && (
        <ConfirmationScreen
          key="confirmation"
          employeeName={funcionario?.nome || EMPLOYEE_NAME}
          entryType={registrationData.type}
          timestamp={registrationData.timestamp}
          completedEntries={completedEntries}
          onComplete={handleComplete}
          onRegisterAnother={handleRegisterAnother}
        />
      )}
    </div>
  );
}

export default App;
