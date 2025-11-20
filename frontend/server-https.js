const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const selfsigned = require('selfsigned');

const app = express();
const PORT = 3000;

// Servir arquivos estáticos da pasta build
app.use(express.static(path.join(__dirname, 'build')));

// Fallback para SPA - servir index.html para rotas não encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const certDir = path.join(__dirname, '.certs');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Criar pasta de certificados
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Gerar ou carregar certificados
let options;

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✓ Usando certificados existentes');
  options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
} else {
  console.log('Gerando certificados auto-assinados...');

  // Gerar novo certificado auto-assinado
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const { private: privateKey, cert } = selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048
  });

  // Salvar certificados
  fs.writeFileSync(keyPath, privateKey);
  fs.writeFileSync(certPath, cert);

  console.log('✓ Certificados gerados e salvos em .certs/');

  options = {
    key: privateKey,
    cert: cert
  };
}

// Iniciar servidor HTTPS
https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('✓ Servidor HTTPS iniciado com sucesso!');
  console.log('='.repeat(50));
  console.log('');
  console.log('URLs de acesso:');
  console.log(`  🔒 https://192.168.1.76:${PORT}`);
  console.log(`  🔒 https://localhost:${PORT}`);
  console.log('');
  console.log('⚠️  Nota: O certificado é auto-assinado.');
  console.log('   O navegador pode mostrar aviso de segurança.');
  console.log('   Clique em "Avançado" e depois em "Prosseguir" ou');
  console.log('   "Não é seguro" para continuar.');
  console.log('='.repeat(50) + '\n');
});
