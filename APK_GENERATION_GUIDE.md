# Guia de Geração do APK - Scopum Controle de Ponto

## ✅ Preparação Concluída

O projeto Expo foi criado e configurado em: `c:\ProjetosNode\APK\APKMobile`

### Arquivos Configurados:

- ✅ `app.json` - Configuração do app com brand "Scopum - Controle de Ponto"
- ✅ `app.config.ts` - Arquivo de exportação TypeScript
- ✅ `app/(tabs)/index.tsx` - Interface principal da aplicação
- ✅ `api/apiCliente.ts` - Cliente API conectado ao backend
- ✅ `eas.json` - Configuração de build da EAS
- ✅ `package.json` - Dependências instaladas (axios, etc.)

---

## 🚀 Opção 1: Geração de APK via EAS (Recomendado - Mais Simples)

### Pré-requisitos:

1. Conta Expo (criar em https://expo.dev)
2. eas-cli instalado ✅ (já está)

### Passos:

```bash
# 1. Fazer login na conta Expo
cd c:\ProjetosNode\APK\APKMobile
eas login

# 2. Gerar APK (sem assinar - adequado para teste em tablet)
eas build --platform android --profile preview

# 3. O APK será gerado em poucos minutos
# Você receberá um link para download
```

**Tempo estimado:** 5-10 minutos

---

## 🛠️ Opção 2: Build Local com Gradle (Alternativa)

Se preferir não usar EAS, pode fazer build local:

### Pré-requisitos:

1. Android SDK (não está instalado - seria necessário instalação)
2. Gradle
3. Java 11+ ✅ (você tem)

### Passos:

```bash
cd c:\ProjetosNode\APK\APKMobile

# 1. Preparar o projeto nativo
eas build --local --platform android --profile preview

# 2. O APK será gerado em: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 Instalação no Tablet

### Após gerar o APK:

1. **Transferir para o Tablet:**

   - Via USB
   - Via compartilhamento de arquivo
   - Enviar via email

2. **Habilitar instalação de fontes desconhecidas:**

   - Configurações > Segurança
   - Ativar "Instalar apps de fontes desconhecidas"

3. **Instalar o APK:**
   - Abrir o arquivo no gerenciador de arquivos
   - Tocar em "Instalar"
   - Aguardar conclusão

---

## 🔌 Conexão com Backend

**Importante:** O app precisa conectar ao backend Express na porta 3001

### Configurar URL do API:

Editar `APKMobile/api/apiCliente.ts`:

```typescript
// Alterar a URL para seu servidor:
const API_URL = "http://SEU_IP_DO_SERVIDOR:3001/api";

// Exemplo: se o backend está em 192.168.1.100:
const API_URL = "http://192.168.1.100:3001/api";
```

**Nota:** Não use `localhost` no tablet - use o IP da máquina com o backend!

---

## 📋 Funcionalidades do App

- ✅ Tela de Bem-vindo
- ✅ Autenticação por Senha (teclado numérico)
- ✅ Registro de Ponto (Entrada, Saída, Pausa, Retorno)
- ✅ Integração com Backend Express
- ✅ Mensagens de Erro/Sucesso
- ✅ Suporte a Tablet (Orientação Retrato)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to server"

- Verificar se o backend está rodando (`npm start` em BackEnd/)
- Verificar se o IP do servidor está correto
- Verificar firewall/conexão de rede

### Erro: "Module not found"

- Fazer `npm install` novamente
- Limpar cache: `eas build --clear-cache`

### App carrega mas não conecta

- Certificar que a API URL está correta (use IP, não localhost)
- Verificar se backend está acessível na rede

---

## 📦 Estrutura do Projeto

```
APKMobile/
├── app/
│   └── (tabs)/
│       └── index.tsx           ← Tela principal do app
├── api/
│   └── apiCliente.ts           ← Cliente API
├── app.json                     ← Config Expo (nome, ícone, etc)
├── app.config.ts                ← Config TypeScript
├── eas.json                     ← Config EAS build
└── package.json                 ← Dependências
```

---

## ✨ Próximos Passos

1. ✅ **Gerar APK** (via EAS ou local)
2. ✅ **Testar no Tablet** (confirmar conexão com backend)
3. ✅ **Ajustar URL do Backend** se necessário
4. ✅ **Distribuir** para usuários

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar os logs: `eas build --platform android --profile preview --log`
2. Consultar: https://docs.expo.dev/build-reference/android/
3. Verificar conexão de rede entre tablet e servidor backend
