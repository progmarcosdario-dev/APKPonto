# ⚡ Guia Rápido - Gerar APK em 3 Passos

## Passo 1: Preparar Configurações

Editar arquivo: `APKMobile/api/apiCliente.ts`

**Encontre:**

```typescript
const API_URL = "http://localhost:3001/api";
```

**Mude para:**

```typescript
const API_URL = "http://192.168.1.100:3001/api"; // ← Use seu IP aqui
```

**Como encontrar o IP:**

- Windows: Abrir CMD e digitar `ipconfig`
- Procurar por "IPv4 Address" (algo como 192.168.x.x)

---

## Passo 2: Gerar o APK

**Opção A - MAIS FÁCIL (Recomendado):**

```bash
cd c:\ProjetosNode\APK\APKMobile

# Primeiro: fazer login (apenas uma vez)
eas login

# Depois: gerar o APK
eas build --platform android --profile preview
```

Aguarde 5-10 minutos e você receberá um link para baixar!

**Opção B - Automático (Windows):**

```bash
cd c:\ProjetosNode\APK\APKMobile
.\build-apk.ps1
# Seguir o menu que aparecer
```

---

## Passo 3: Instalar no Tablet

1. **Transferir APK para o tablet** (USB, email, etc)

2. **Habilitar instalação de desconhecidas:**

   - Abrir Configurações
   - Ir em Segurança
   - Ativar "Instalar apps de fontes desconhecidas"

3. **Instalar:**

   - Abrir o Gerenciador de Arquivos
   - Localizar o APK
   - Tocar no arquivo e confirmar instalação

4. **Usar:**
   - Abrir "Scopum - Controle de Ponto"
   - Inserir a senha (numérica)
   - Registrar pontos conforme necessário

---

## ✅ Pronto!

Seu APK está funcionando no tablet e conectado ao backend Express! 🎉

**Dicas:**

- O app se conecta ao servidor pelo IP que você colocou no Passo 1
- Certifique-se que o backend está rodando: `cd BackEnd && npm start`
- Tablet e servidor precisam estar na mesma rede (WiFi)

---

## 🔧 Se tiver problemas

### App não conecta ao servidor

- Verificar IP está correto
- Verificar se backend está rodando
- Verificar se tablet está na mesma rede

### APK não instala

- Confirmar que "Instalar apps desconhecidas" está ativado
- Tentar desinstalar versão anterior
- Verificar espaço livre no tablet

### Senha não funciona

- Verificar se backend está respondendo
- Tentar a senha padrão: 123456 (ou conforme configurado)
- Verificar logs do backend: `BackEnd/logs/error.log`

---

## 📚 Documentação Completa

Para mais detalhes, ver:

- `APK_BUILD_COMPLETE.md` - Guia completo
- `APK_GENERATION_GUIDE.md` - Guia técnico de geração
- `APKMobile/README.md` - Instruções do projeto

---

**Sucesso! 🚀**
