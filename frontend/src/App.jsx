import React, { useState } from 'react';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import PasswordScreen from './components/PasswordScreen.jsx';
import TimeEntryScreen from './components/TimeEntryScreen.jsx';
import ConfirmationScreen from './components/ConfirmationScreen.jsx';
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
          }
        } catch (erro) {
          console.log('Erro ao buscar histórico:', erro);
        }

        setPasswordError('');
        setCurrentScreen('entry');
      }
    } catch (error) {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  const handlePasswordCancel = () => {
    setCurrentScreen('welcome');
    setPasswordError('');
  };

  const handleSaveEntry = async (type, observation) => {
    try {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Formatar data como YYYY-MM-DD
      const data = now.toISOString().split('T')[0];
      // Formatar hora como HH:MM
      const hora = now.toTimeString().slice(0, 5);

      // Enviar para backend
      await API.post('/ponto/registrar', {
        funcionario_codigo: funcionario?.codigo || '',
        tipo_marcacao: type,
        data: data,
        hora: hora,
        observacao: observation || '',
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
