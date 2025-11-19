import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import APICliente from '@/api/apiCliente';

interface Funcionario {
  codigo: string;
  nome: string;
}

export default function TelaInicial() {
  const [telaAtual, setTelaAtual] = useState<'bem_vindo' | 'senha' | 'entrada'>('bem_vindo');
  const [senha, setSenha] = useState('');
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erroSenha, setErroSenha] = useState('');

  const iniciar = () => {
    setSenha('');
    setErroSenha('');
    setTelaAtual('senha');
  };

  const confirmarSenha = async () => {
    setCarregando(true);
    try {
      const resposta = await APICliente.autenticar(senha);
      if (resposta.data && resposta.data.codigo) {
        setFuncionario({
          codigo: resposta.data.codigo,
          nome: resposta.data.nome,
        });
        setErroSenha('');
        setTelaAtual('entrada');
      } else {
        setErroSenha('Senha incorreta. Tente novamente.');
      }
    } catch (erro) {
      setErroSenha('Erro ao conectar com o servidor. Verifique sua conexão.');
      console.error('Erro de autenticação:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const registrarPonto = async (tipo: 'entrada' | 'saida' | 'pausa' | 'retorno') => {
    if (!funcionario) return;

    setCarregando(true);
    try {
      await APICliente.registrarPonto(funcionario.codigo, tipo);
      Alert.alert(
        'Sucesso',
        `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada com sucesso!`
      );
    } catch (erro) {
      Alert.alert('Erro', 'Falha ao registrar ponto. Tente novamente.');
      console.error('Erro ao registrar ponto:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const sair = () => {
    setFuncionario(null);
    setSenha('');
    setErroSenha('');
    setTelaAtual('bem_vindo');
  };

  return (
    <SafeAreaView style={styles.container}>
      {telaAtual === 'bem_vindo' && (
        <View style={styles.telaBemVindo}>
          <Text style={styles.titulo}>Scopum</Text>
          <Text style={styles.subtitulo}>Controle de Ponto</Text>
          <TouchableOpacity
            style={styles.botao}
            onPress={iniciar}
            disabled={carregando}
          >
            <Text style={styles.textoBotao}>Começar</Text>
          </TouchableOpacity>
        </View>
      )}

      {telaAtual === 'senha' && (
        <View style={styles.telaSenha}>
          <Text style={styles.titulo}>Digite sua Senha</Text>
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.senha,
                {
                  letterSpacing: senha.length > 0 ? 10 : 0,
                },
              ]}
            >
              {'•'.repeat(senha.length)}
            </Text>
            <View style={styles.teclado}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((numero) => (
                <TouchableOpacity
                  key={numero}
                  style={styles.botaoNumero}
                  onPress={() => setSenha(senha + numero.toString())}
                  disabled={carregando}
                >
                  <Text style={styles.textoNumero}>{numero}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.botaoDelete}
                onPress={() => setSenha(senha.slice(0, -1))}
                disabled={carregando}
              >
                <Text style={styles.textoDelete}>⌫</Text>
              </TouchableOpacity>
            </View>
            {erroSenha && <Text style={styles.erro}>{erroSenha}</Text>}
          </View>
          <TouchableOpacity
            style={styles.botao}
            onPress={confirmarSenha}
            disabled={carregando || senha.length === 0}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>Confirmar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {telaAtual === 'entrada' && funcionario && (
        <View style={styles.telaEntrada}>
          <Text style={styles.titulo}>Bem-vindo!</Text>
          <Text style={styles.nomeFuncionario}>{funcionario.nome}</Text>
          <Text style={styles.codigo}>Código: {funcionario.codigo}</Text>

          <View style={styles.botoesPonto}>
            <TouchableOpacity
              style={[styles.botaoPonto, styles.botaoEntrada]}
              onPress={() => registrarPonto('entrada')}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.iconeBotao}>📍</Text>
                  <Text style={styles.textoBotaoPonto}>Entrada</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoPonto, styles.botaoSaida]}
              onPress={() => registrarPonto('saida')}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.iconeBotao}>📍</Text>
                  <Text style={styles.textoBotaoPonto}>Saída</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoPonto, styles.botaoPausa]}
              onPress={() => registrarPonto('pausa')}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.iconeBotao}>⏸</Text>
                  <Text style={styles.textoBotaoPonto}>Pausa</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoPonto, styles.botaoRetorno]}
              onPress={() => registrarPonto('retorno')}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.iconeBotao}>▶</Text>
                  <Text style={styles.textoBotaoPonto}>Retorno</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={sair}
            disabled={carregando}
          >
            <Text style={styles.textoSecundario}>Sair</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  telaBemVindo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  telaSenha: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  telaEntrada: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  nomeFuncionario: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  codigo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  senha: {
    fontSize: 28,
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 20,
    height: 50,
    lineHeight: 50,
  },
  teclado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  botaoNumero: {
    width: '30%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textoNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  botaoDelete: {
    width: '30%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    marginBottom: 10,
  },
  textoDelete: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  erro: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  botao: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botoesPonto: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 20,
    flex: 1,
  },
  botaoPonto: {
    width: '48%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 15,
  },
  botaoEntrada: {
    backgroundColor: '#10b981',
  },
  botaoSaida: {
    backgroundColor: '#ef4444',
  },
  botaoPausa: {
    backgroundColor: '#f59e0b',
  },
  botaoRetorno: {
    backgroundColor: '#3b82f6',
  },
  iconeBotao: {
    fontSize: 30,
    marginBottom: 8,
  },
  textoBotaoPonto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  botaoSecundario: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSecundario: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
