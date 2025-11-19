# Sistema de Design - Registro de Ponto Impacto Locações

## 📋 Documentação de Padrões Aplicados

### 🎨 Paleta de Cores

#### Cores Principais
- **Vermelho Primário**: `#E30613` (CTA, elementos de destaque)
- **Vermelho Hover**: `#B30510` (estado hover de botões primários)
- **Amarelo Marca**: `#FFD700` (mascote, elementos secundários)
- **Verde Sucesso**: `#0F7C3E` (confirmações, status positivo)
- **Verde Hover**: `#0C6331` (hover do botão de sucesso)

#### Cores de Texto
- **Título Principal**: `#2A2A2A` (títulos h1, textos principais - WCAG AA)
- **Texto Secundário**: `#5A5A5A` (labels, descrições)
- **Texto Terciário**: `#6A6A6A` (instruções, texto suave)
- **Texto Rodapé**: `#7A7A7A` (copyright, versão)
- **Erro/Alerta**: `#C62828` (mensagens de erro, tom mais suave do vermelho)

#### Cores de Fundo
- **Background Principal**: `#EBEBEB` (fundo das telas)
- **Cards/Containers**: `bg-white/60 backdrop-blur-sm` (glassmorphism sutil)
- **Branco Sólido**: `#FFFFFF` (logo, inputs, botões secundários)
- **Background Erro**: `#FFEBEE` (background de mensagens de erro)

---

### 📐 Estrutura de Layout

#### Container Principal
```tsx
className="flex flex-col items-center justify-between min-h-screen p-8 bg-[#EBEBEB]"
```

#### Logo (Todas as Telas)
```tsx
<div className="w-full flex justify-center pt-4">
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
  >
    <ImageWithFallback
      src={logoImpacto}
      alt="Mascote Impacto - Locações de Equipamentos"
      className="w-32 h-auto rounded-2xl shadow-lg bg-white"
    />
  </motion.div>
</div>
```

#### Conteúdo Central
- **Centralização vertical**: `-mt-16` (aproxima logo do conteúdo)
- **Max-width**: `max-w-md` (welcome/password/confirmation) ou `max-w-3xl` (time-entry)
- **Flex**: `flex-1 flex flex-col justify-center`

#### Rodapé (Todas as Telas)
```tsx
<div className="w-full flex flex-col items-center gap-2 pb-6">
  <p className="text-[#6A6A6A] text-sm">
    Versão 1.0 — acesso restrito
  </p>
  <p className="text-[#7A7A7A] text-xs">
    © 2025 Impacto Locações de Equipamentos
  </p>
</div>
```

---

### 🔘 Componentes de Botões

#### Botão Primário (CTA Principal)
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="w-full h-16 bg-[#E30613] hover:bg-[#B30510] text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#E30613]/30"
>
  Texto do Botão
</motion.button>
```

#### Botão Sucesso (Salvar Registro)
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  disabled={!selectedType}
  className={`w-full h-16 rounded-2xl transition-all shadow-lg ${
    selectedType
      ? "bg-[#0F7C3E] hover:bg-[#0C6331] text-white hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#0F7C3E]/30"
      : "bg-[#E5E5E5] text-[#5A5A5A]/60 cursor-not-allowed"
  }`}
>
  Salvar Registro
</motion.button>
```

#### Botão Secundário (Cancelar/Voltar)
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="w-full h-16 bg-transparent hover:bg-[#F5F5F5] text-[#2A2A2A] rounded-2xl transition-colors flex items-center justify-center gap-2 border-2 border-[#E5E5E5]"
>
  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
  Voltar
</motion.button>
```

#### Botão com Auto Layout (Welcome Screen)
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="inline-flex items-center justify-center gap-3 h-20 px-12 bg-[#E30613] hover:bg-[#B30510] text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#E30613]/30"
>
  <Clock className="w-7 h-7" strokeWidth={2} aria-hidden="true" />
  <span className="leading-none">Registrar Ponto</span>
</motion.button>
```

---

### 📝 Componentes de Formulário

#### Input Text/Password
```tsx
<input
  className="w-full h-16 px-6 bg-white border-2 border-[#E5E5E5] rounded-2xl focus:outline-none focus:border-[#E30613] focus:ring-4 focus:ring-[#E30613]/30 transition-all text-[#2A2A2A] shadow-sm"
/>
```

#### Textarea
```tsx
<textarea
  rows={3}
  className="w-full px-6 py-4 bg-white border-2 border-[#E5E5E5] rounded-2xl focus:outline-none focus:border-[#E30613] focus:ring-4 focus:ring-[#E30613]/30 transition-all text-[#2A2A2A] resize-none shadow-sm"
/>
```

#### Label
```tsx
<label className="block text-[#2A2A2A] pl-1">
  Nome do Campo
</label>
```

---

### 🎴 Cards e Containers

#### Card com Glassmorphism
```tsx
<div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40 space-y-4">
  {/* Conteúdo */}
</div>
```

#### Card Sólido
```tsx
<div className="bg-white rounded-2xl p-6 shadow-md border border-[#E5E5E5] space-y-4">
  {/* Conteúdo */}
</div>
```

---

### 🎭 Animações Motion

#### Animação de Entrada de Tela
```tsx
// Slide horizontal
<motion.div
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -50 }}
  transition={{ duration: 0.3 }}
>

// Fade + Scale (confirmação)
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.4 }}
>
```

#### Animação de Elementos
```tsx
// Fade + slide up
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>

// Scale spring (logo, ícones)
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
>

// Scale from zero (ícone de sucesso)
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
>
```

#### Interações de Botão
```tsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

---

### 🌐 Bordas e Arredondamentos

- **Padrão Principal**: `rounded-2xl` (16px)
- **Elementos Circulares**: `rounded-full` (avatares, badges)

---

### 🎯 Espaçamentos

#### Gaps Principais
- **Entre elementos do form**: `gap-3` ou `gap-5`
- **Entre botões**: `gap-3`
- **Dentro de cards**: `space-y-4`

#### Margens
- **Logo superior**: `pt-4`
- **Centralização conteúdo**: `-mt-16` (welcome/password/confirmation) ou `-mt-12` (time-entry)
- **Rodapé inferior**: `pb-6`
- **Entre seções**: `mb-6`, `mb-8`

---

### ♿ Acessibilidade (WCAG AA/AAA)

#### Contraste de Cores
- Todos os textos mantêm contraste mínimo de 4.5:1 (WCAG AA)
- Títulos principais (#2A2A2A) têm contraste de 10.8:1

#### Focus States
```tsx
focus:outline-none focus:ring-4 focus:ring-[#E30613]/30
```

#### ARIA Labels
- Todos os botões têm `aria-label`
- Inputs com `aria-required`, `aria-invalid`, `aria-describedby`
- Status indicators com `role="status"`, `aria-live="polite"`
- Radio groups com `role="radiogroup"`, `aria-checked`

#### Ícones Decorativos
```tsx
aria-hidden="true"
```

---

### 🔤 Tipografia

#### Títulos
```tsx
<h1 className="text-[#2A2A2A]">Título Principal</h1>
```
**Nota**: Não usar classes de font-size, font-weight ou line-height (definidos em globals.css)

#### Texto Corrente
```tsx
<p className="text-[#5A5A5A]">Texto secundário</p>
<p className="text-[#6A6A6A]">Texto terciário/instrução</p>
```

#### Horários (Monospace)
```tsx
<p className="text-[#E30613] font-mono tracking-wider">14:30:45</p>
```

---

### 🎨 Ícones

#### Tamanhos Padrão
- **Ícones de botão**: `w-7 h-7` com `strokeWidth={2}`
- **Ícones de card**: `w-6 h-6` com `strokeWidth={2}`
- **Ícones pequenos**: `w-5 h-5` com `strokeWidth={2}`
- **Ícones grandes (hero)**: `w-10 h-10` ou `w-14 h-14` com `strokeWidth={2}`

#### Containers de Ícone
```tsx
// Vermelho
<div className="w-12 h-12 bg-[#E30613] rounded-full flex items-center justify-center shadow-sm">
  <User className="w-6 h-6 text-white" strokeWidth={2} aria-hidden="true" />
</div>

// Amarelo
<div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center shadow-sm">
  <Clock className="w-6 h-6 text-[#2A2A2A]" strokeWidth={2} aria-hidden="true" />
</div>

// Verde
<div className="w-24 h-24 bg-[#0F7C3E] rounded-full flex items-center justify-center shadow-xl">
  <CheckCircle className="w-14 h-14 text-white" strokeWidth={2} aria-hidden="true" />
</div>
```

---

### 📱 Responsividade

- **Otimizado para tablets**: 1024x768px
- **Touch-friendly**: Botões mínimo 44x44px (h-16 = 64px)
- **Espaçamento generoso**: padding de 8 (32px) nas telas

---

### ✨ Microinterações

#### Indicadores de Status
```tsx
// Sistema online
<div className="flex items-center gap-3 text-[#5A5A5A] bg-white/40 backdrop-blur-sm rounded-full px-6 py-2.5">
  <div className="w-2.5 h-2.5 bg-[#0F7C3E] rounded-full animate-pulse" aria-hidden="true" />
  <p className="text-sm">Sistema online e pronto</p>
</div>

// Carregamento
<div className="flex items-center gap-2 text-[#5A5A5A]">
  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse" aria-hidden="true" />
  <p className="text-sm">Retornando à tela inicial em 3 segundos...</p>
</div>
```

---

## 📦 Componentes por Tela

### 1. Welcome Screen
- Logo com bg-white
- Título "Registro de Ponto"
- Relógio em tempo real (glassmorphism)
- Instrução sutil
- Botão CTA com auto layout
- Status indicator
- Rodapé

### 2. Password Screen
- Logo com bg-white
- Ícone Lock em círculo vermelho
- Título "Digite sua senha"
- Input password
- Mensagem de erro (condicional)
- Teclado numérico 3x4
- Botão Confirmar + Cancelar
- Rodapé

### 3. Time Entry Screen
- Logo com bg-white
- Título "Selecione o tipo de ponto"
- Card info (funcionário + horário)
- Radio group (4 opções)
- Textarea observação
- Botão Salvar (verde) + Voltar
- Rodapé

### 4. Confirmation Screen
- Logo com bg-white
- Ícone CheckCircle em círculo verde
- Título "Ponto registrado com sucesso!"
- Card resumo (tipo + horário)
- Botão Concluir + Registrar outro
- Indicador auto-retorno
- Rodapé

---

## 🔄 Estados Interativos

### Botões
- **Default**: Estado normal com sombra
- **Hover**: `scale: 1.02` + `shadow-xl`
- **Active/Tap**: `scale: 0.98`
- **Focus**: `ring-4` com cor correspondente
- **Disabled**: `bg-[#E5E5E5]` + `cursor-not-allowed`

### Inputs
- **Default**: border `#E5E5E5`
- **Focus**: border `#E30613` + `ring-4 ring-[#E30613]/30`
- **Error**: border `#C62828` + mensagem de erro

### Cards Selecionáveis
- **Default**: bg-white + border `#E5E5E5`
- **Hover**: border `#E30613]/30` + bg `#FFE5E7]/30`
- **Selected**: bg `#E30613` + text white

---

**Última atualização**: 19/11/2025
**Versão do Sistema**: 1.0
**Responsável**: Impacto Locações de Equipamentos