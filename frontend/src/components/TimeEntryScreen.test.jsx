import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TimeEntryScreen from '../components/TimeEntryScreen';

describe('TimeEntryScreen Component', () => {
  const mockOnComplete = jest.fn();
  const mockFuncionario = {
    codigo: '12345',
    nome: 'João Silva'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a tela de marcação de ponto', () => {
    render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/marcação de ponto/i)).toBeInTheDocument();
  });

  it('deve exibir informações do funcionário', () => {
    render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
  });

  it('deve permitir clicar no botão de registrar ponto', async () => {
    const user = userEvent.setup();

    render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={mockOnComplete}
      />
    );

    const button = screen.getByRole('button', { name: /registrar/i });
    await user.click(button);

    expect(button).toHaveBeenClicked;
  });

  it('deve mostrar mensagem de sucesso após registrar', async () => {
    render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={mockOnComplete}
      />
    );

    const button = screen.getByRole('button', { name: /registrar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText(/sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar o botão durante o carregamento', async () => {
    const user = userEvent.setup();

    render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={mockOnComplete}
      />
    );

    const button = screen.getByRole('button', { name: /registrar/i });
    await user.click(button);

    expect(button).toBeDisabled();
  });

  it('deve chamar onComplete quando ponto for registrado', async () => {
    render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={mockOnComplete}
      />
    );

    const button = screen.getByRole('button', { name: /registrar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('deve exibir tipo de marcação sugerido', () => {
    render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={mockOnComplete}
        suggestedType={1}
      />
    );

    expect(screen.getByText(/Início expediente/i)).toBeInTheDocument();
  });
});
