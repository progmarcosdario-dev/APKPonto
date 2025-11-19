# Frontend - Apta Controle de Ponto

Sistema de controle de ponto de funcionários com React.

## Estrutura do Projeto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Menu.js                 # Tela inicial com botão "Ponto"
│   │   ├── PasswordInput.js         # Diálogo de entrada de senha
│   │   ├── PontoRegistration.js     # Formulário de registro de ponto
│   │   └── SuccessModal.js          # Modal de confirmação
│   ├── styles/
│   │   ├── App.css
│   │   ├── Menu.css
│   │   ├── PasswordInput.css
│   │   ├── PontoRegistration.css
│   │   └── SuccessModal.css
│   ├── App.js                      # Componente principal com gerenciamento de telas
│   ├── App.css
│   ├── index.js
│   ├── index.css
│   └── api/                        # Serviços de API (futuro)
├── package.json
└── README.md
```

## Telas Implementadas

### 1. Menu

- Tela inicial com branding "Apta"
- Botão "Ponto" que inicia o fluxo de registro
- Design moderno com gradiente roxo

### 2. Password Input

- Diálogo modal para entrada de 6 dígitos
- Validação de senha contra o endpoint `/api/auth/login`
- Tratamento de erros de autenticação

### 3. Ponto Registration

- Formulário de registro com campos:
  - Tipo de Marcação (radio buttons)
  - Data (com padrão de hoje)
  - Hora (com padrão da hora atual)
  - Observação (opcional)
  - Exibição do nome do funcionário
- Carregamento de tipos do endpoint `/api/ponto/tipos`
- Submissão para `/api/ponto/registrar`

### 4. Success Modal

- Modal de confirmação com animação
- Exibição da mensagem de sucesso
- Retorno à tela inicial após OK

## Instalação

```bash
cd frontend
npm install
```

## Desenvolvimento

```bash
npm start
```

Acessa http://localhost:3000 com reload automático.

## Build para Produção

```bash
npm run build
```

Cria otimizado para produção em `build/`.

## Dependências Principais

- **react**: 19.2.0
- **react-dom**: 19.2.0
- **react-router-dom**: 7.9.6
- **axios**: 1.13.2
- **react-scripts**: 5.0.1

## Configuração de API

O frontend se conecta ao backend em `http://localhost:3001`. Endpoints:

- `POST /api/auth/login` - Autenticação com senha
- `GET /api/ponto/tipos` - Obter tipos de marcação
- `POST /api/ponto/registrar` - Registrar novo ponto

## Estilo e Responsividade

- Design responsivo para mobile e desktop
- Gradientes e sombras para profundidade
- Animações suaves para transições
- Suporte para dark mode (futuro)

## Status

✅ Implementado:

- Estrutura base do React
- 4 componentes principais
- Estilos responsivos
- Integração com API do backend

⏳ Futuro:

- Armazenamento local para offline
- Sincronização automática
- Histórico de pontos
- Temas customizáveis
