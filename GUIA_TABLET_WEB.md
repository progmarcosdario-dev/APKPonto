## 🚀 Acessar Scopum pelo Tablet - Guia Rápido

### Pré-requisitos

✅ Frontend rodando em: `http://192.168.1.76:3000`
✅ Backend rodando em: `http://192.168.1.76:3001`
✅ Tablet e PC na mesma rede WiFi/Ethernet

### Passos para Acessar

1. **No Tablet (Moto Tab G70):**

   - Abra o navegador (Chrome, Firefox, etc)
   - Digite na barra de endereço:
     ```
     http://192.168.1.76:3000
     ```
   - Pressione ENTER

2. **Pronto!** ✅
   - Você verá a tela de login do Scopum
   - Funciona 100% igual ao desktop
   - Todas as funcionalidades disponíveis

### Criar Atalho na Tela Inicial (Opcional)

**Chrome/Edge:**

1. Abra `http://192.168.56.1:3000`
2. Toque nos 3 pontinhos (menu)
3. Selecione "Adicionar à tela inicial"
4. Nomeie como "Scopum Ponto"
5. Toque em "Adicionar"

**Firefox:**

1. Abra `http://192.168.56.1:3000`
2. Toque no menu (≡)
3. Selecione "Instalar aplicativo"
4. Aceite

### Troubleshooting

**Não consegue acessar?**

- Verifique se PC e tablet estão na mesma rede WiFi
- Confirme que `192.168.56.1` é o IP correto do seu PC
  - No PC, abra PowerShell e digite: `ipconfig`
  - Procure por "IPv4 Address" na seção WiFi
- Verifique se o frontend está rodando: `npm start` em `c:\ProjetosNode\APK\frontend`
- Verifique se o backend está rodando: porta 3001

**Conexão lenta?**

- Ambos na mesma rede (WiFi 5GHz é melhor)
- Tablet próximo do roteador

### URLs para Lembrar

```
Frontend:  http://192.168.1.76:3000
Backend:   http://192.168.1.76:3001/api
```

### Próximos Passos

1. ✅ Teste tudo no tablet
2. ✅ Teste login e funcionalidades
3. ✅ Quando estiver OK, criamos APK definitivo
4. ✅ APK terá estas mesmas URLs configuradas

---

**Status dos Builds:**

- Build Local: Em andamento (Pixel 5 API 36)
- Build EAS: Em andamento (~1h30 restante)

Mas com a web, talvez nem precise dos builds! 🎉
