import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { WelcomeScreen } from "./components/welcome-screen";
import { PasswordScreen } from "./components/password-screen";
import { TimeEntryScreen } from "./components/time-entry-screen";
import { ConfirmationScreen } from "./components/confirmation-screen";

type Screen = "welcome" | "password" | "entry" | "confirmation";
type EntryType = "start" | "break_start" | "break_end" | "end";

// Simulação de autenticação - senha correta: "1234"
const CORRECT_PASSWORD = "1234";
const EMPLOYEE_NAME = "Agnaldo";
const STORAGE_KEY = "impacto_daily_entries";

// Função para obter a data atual no formato YYYY-MM-DD
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("entry"); // TESTE: iniciar direto na tela de seleção
  const [passwordError, setPasswordError] = useState<string>("");
  const [registrationData, setRegistrationData] = useState({
    type: "",
    timestamp: "",
  });
  const [completedEntries, setCompletedEntries] = useState<EntryType[]>([]);

  // Carregar registros do dia do localStorage
  useEffect(() => {
    // TESTE: Limpar registros para começar do zero
    localStorage.removeItem(STORAGE_KEY);
    setCompletedEntries([]);
    
    /* CÓDIGO ORIGINAL - Descomentar após testes
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const { date, entries } = JSON.parse(storedData);
        const today = getCurrentDate();
        
        // Se é o mesmo dia, restaurar os registros
        if (date === today) {
          setCompletedEntries(entries);
        } else {
          // Se é um novo dia, limpar os registros
          localStorage.removeItem(STORAGE_KEY);
          setCompletedEntries([]);
        }
      } catch (error) {
        console.error("Erro ao carregar registros:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    */
  }, []);

  // Salvar registros no localStorage sempre que mudar
  useEffect(() => {
    if (completedEntries.length > 0) {
      const data = {
        date: getCurrentDate(),
        entries: completedEntries,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [completedEntries]);

  const handleStart = () => {
    setCurrentScreen("password");
    setPasswordError("");
  };

  const handlePasswordConfirm = (password: string) => {
    if (password === CORRECT_PASSWORD) {
      setPasswordError("");
      setCurrentScreen("entry");
    } else {
      setPasswordError("Senha incorreta. Tente novamente.");
    }
  };

  const handlePasswordCancel = () => {
    setCurrentScreen("welcome");
    setPasswordError("");
  };

  const handleSaveEntry = (type: string, observation: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    
    const dateStr = now.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Simula salvamento (em produção, aqui seria uma chamada à API)
    console.log({
      employee: EMPLOYEE_NAME,
      type,
      observation,
      timestamp,
      date: now.toISOString(),
    });

    setRegistrationData({ type, timestamp });
    setCurrentScreen("confirmation");
    setCompletedEntries([...completedEntries, type as EntryType]);
  };

  const handleEntryBack = () => {
    setCurrentScreen("password");
  };

  const handleComplete = () => {
    setCurrentScreen("welcome");
    setRegistrationData({ type: "", timestamp: "" });
  };

  const handleRegisterAnother = () => {
    setCurrentScreen("password");
    setPasswordError("");
  };

  return (
    <div className="w-full min-h-screen max-w-[1024px] mx-auto">
      <AnimatePresence mode="wait">
        {currentScreen === "welcome" && (
          <WelcomeScreen key="welcome" onStart={handleStart} />
        )}
        
        {currentScreen === "password" && (
          <PasswordScreen
            key="password"
            onConfirm={handlePasswordConfirm}
            onCancel={handlePasswordCancel}
            error={passwordError}
          />
        )}
        
        {currentScreen === "entry" && (
          <TimeEntryScreen
            key="entry"
            employeeName={EMPLOYEE_NAME}
            onSave={handleSaveEntry}
            onBack={handleEntryBack}
            completedEntries={completedEntries}
          />
        )}
        
        {currentScreen === "confirmation" && (
          <ConfirmationScreen
            key="confirmation"
            employeeName={EMPLOYEE_NAME}
            entryType={registrationData.type}
            timestamp={registrationData.timestamp}
            completedEntries={completedEntries}
            onComplete={handleComplete}
            onRegisterAnother={handleRegisterAnother}
          />
        )}
      </AnimatePresence>
    </div>
  );
}