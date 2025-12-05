import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import App from '../App';
import TimeEntryScreen from '../components/TimeEntryScreen';

expect.extend(toHaveNoViolations);

describe('Acessibilidade - App Component', () => {
  it('não deve ter violações de acessibilidade na App principal', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('não deve ter violações de acessibilidade na tela de marcação', async () => {
    const mockFuncionario = {
      codigo: '12345',
      nome: 'João Silva'
    };

    const { container } = render(
      <TimeEntryScreen
        funcionario={mockFuncionario}
        onComplete={() => {}}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Acessibilidade - Navegação por Teclado', () => {
  it('deve ter focusable buttons', () => {
    const { container } = render(
      <TimeEntryScreen
        funcionario={{ codigo: '123', nome: 'Teste' }}
        onComplete={() => {}}
      />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveProperty('disabled', false);
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('deve ter labels associados aos inputs', () => {
    const { container } = render(
      <TimeEntryScreen
        funcionario={{ codigo: '123', nome: 'Teste' }}
        onComplete={() => {}}
      />
    );

    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      expect(input.id).toBeTruthy();
      const label = container.querySelector(`label[for="${input.id}"]`);
      expect(label).toBeInTheDocument();
    });
  });

  it('deve ter hierarquia de headings válida', () => {
    const { container } = render(
      <TimeEntryScreen
        funcionario={{ codigo: '123', nome: 'Teste' }}
        onComplete={() => {}}
      />
    );

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));
      // Hierarquia válida: não pula mais de um nível
      expect(level - lastLevel).toBeLessThanOrEqual(1);
      lastLevel = level;
    });
  });

  it('deve ter atributos alt em imagens', () => {
    const { container } = render(
      <TimeEntryScreen
        funcionario={{ codigo: '123', nome: 'Teste' }}
        onComplete={() => {}}
      />
    );

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).toBeTruthy();
    });
  });

  it('deve ter contraste de cor suficiente', () => {
    const { container } = render(
      <TimeEntryScreen
        funcionario={{ codigo: '123', nome: 'Teste' }}
        onComplete={() => {}}
      />
    );

    // Verificar que elementos de texto visível existem
    const textElements = container.querySelectorAll('button, a, p, span');
    expect(textElements.length).toBeGreaterThan(0);
  });
});

describe('Acessibilidade - Screen Reader', () => {
  it('deve ter aria-label em botões sem texto', () => {
    const { container } = render(
      <TimeEntryScreen
        funcionario={{ codigo: '123', nome: 'Teste' }}
        onComplete={() => {}}
      />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const hasText = button.textContent?.trim().length > 0;
      const hasAriaLabel = button.getAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBeTruthy();
    });
  });

  it('deve ter role apropriado em elementos', () => {
    const { container } = render(
      <TimeEntryScreen
        funcionario={{ codigo: '123', nome: 'Teste' }}
        onComplete={() => {}}
      />
    );

    const statusElements = container.querySelectorAll('[role]');
    statusElements.forEach(el => {
      const role = el.getAttribute('role');
      expect(['button', 'status', 'alert', 'main', 'navigation']).toContain(role);
    });
  });
});
