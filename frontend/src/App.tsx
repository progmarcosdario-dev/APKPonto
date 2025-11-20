import React, { useState } from 'react';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import PasswordScreen from './components/PasswordScreen';
import TimeEntryScreen from './components/TimeEntryScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import API from './api/api';

interface Funcionario {
  codigo: string;
  nome: string;
}

interface RegistrationData {
  type: string;
  timestamp: string;
}

type ScreenType = 'welcome' | 'password' | 'entry' | 'confirmation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [passwordError, setPasswordError] = useState<string>('');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    type: '',
    timestamp: '',
  });
  const [completedEntries, setCompletedEntries] = useState<string[]>([]);
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);

  // Valores para teste/desenvolvimento
  const EMPLOYEE_NAME = 'Funcionário';

  const handleStart = (): void => {
    setCurrentScreen('password');
    setPasswordError('');
  };

  const handlePasswordConfirm = async (password: string): Promise<void> => {
    try {
      const response = await API.post('/auth/login', { senha: password });
      if (response.data) {
        setFuncionario({ codigo: response.data.codigo, nome: response.data.nome });
        setPasswordError('');
        setCurrentScreen('entry');
      }
    } catch (error) {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  const handlePasswordCancel = (): void => {
    setCurrentScreen('welcome');
    setPasswordError('');
  };

  const handleSaveEntry = async (type: string, observation: string): Promise<void> => {
    try {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Enviar para backend
      await API.post('/ponto/registrar', {
        codigo: funcionario?.codigo || '',
        tipo: type,
        observacao: observation,
      });

      setRegistrationData({
        type: type,
        timestamp: timestamp,
      });

      setCurrentScreen('confirmation');
      setCompletedEntries([...completedEntries, type]);
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
    }
  };

  const handleEntryBack = (): void => {
    setCurrentScreen('password');
  };

  const handleComplete = (): void => {
    setCurrentScreen('welcome');
    setRegistrationData({ type: '', timestamp: '' });
    setFuncionario(null);
    setCompletedEntries([]);
  };

  const handleRegisterAnother = (): void => {
    setCurrentScreen('password');
    setPasswordError('');
  };

  return (
    <div className="app-container">
      {currentScreen === 'welcome' && (
        <WelcomeScreen key="welcome" onStart={handleStart} />
      )}

      {currentScreen === 'password' && (
        <PasswordScreen
          key="password"
          onConfirm={handlePasswordConfirm}
          onCancel={handlePasswordCancel}
          error={passwordError}
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
