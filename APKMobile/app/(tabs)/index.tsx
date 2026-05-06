import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [tipoPendente, setTipoPendente] = useState<'entrada' | 'saida' | 'pausa' | 'retorno' | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const iniciar = () => {
    setSenha('');
    setErroSenha('');
    setTelaAtual('senha');
  };

  const confirmarSenha = async () => {
    setCarregando(true);
    try {
      const resposta = await APICliente.autenticar(senha);
      if (resposta.data?.sucesso && resposta.data?.funcionario) {
        setFuncionario({
          codigo: String(resposta.data.funcionario.codigo),
          nome: resposta.data.funcionario.nome,
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

  const iniciarRegistroComBiometria = async (tipo: 'entrada' | 'saida' | 'pausa' | 'retorno') => {
    if (!funcionario) return;

    const permission = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();

    if (!permission?.granted) {
      Alert.alert('Permissao necessaria', 'A camera e obrigatoria para validacao facial.');
      return;
    }

    setTipoPendente(tipo);
  };

  const capturarValidarERegistrar = async () => {
    if (!funcionario || !tipoPendente || !cameraRef.current) {
      return;
    }

    setCarregando(true);
    try {
      const foto = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7
      });

      if (!foto?.base64) {
        throw new Error('Nao foi possivel capturar imagem facial.');
      }

      const respostaBiometria = await APICliente.validarBiometria(funcionario.codigo, foto.base64);
      const biometria = respostaBiometria.data?.biometria;

      if (!biometria?.verificada) {
        Alert.alert('Biometria invalida', 'Rosto nao reconhecido. Tente novamente.');
        return;
      }

      await APICliente.registrarPonto(funcionario.codigo, tipoPendente, {
        verificada: true,
        score: biometria.score,
        hash: biometria.hash,
        origem: 'mobile',
        metodo: 'camera'
      });

      Alert.alert(
        'Sucesso',
        `${tipoPendente.charAt(0).toUpperCase() + tipoPendente.slice(1)} registrada com sucesso!`
      );
      setTipoPendente(null);
    } catch (erro) {
      Alert.alert('Erro', 'Falha ao registrar ponto com biometria. Tente novamente.');
      console.error('Erro ao registrar ponto:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const sair = () => {
    setFuncionario(null);
    setSenha('');
    setErroSenha('');
    setTipoPendente(null);
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

          {tipoPendente && (
            <View style={styles.cardBiometria}>
              <Text style={styles.tituloBiometria}>Validação facial para {tipoPendente}</Text>
              <CameraView
                ref={(ref) => {
                  cameraRef.current = ref;
                }}
                style={styles.camera}
                facing="front"
              />
              <View style={styles.acoesBiometria}>
                <TouchableOpacity
                  style={styles.botaoBiometriaConfirmar}
                  onPress={capturarValidarERegistrar}
                  disabled={carregando}
                >
                  <Text style={styles.textoBotao}>Capturar e validar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoBiometriaCancelar}
                  onPress={() => setTipoPendente(null)}
                  disabled={carregando}
                >
                  <Text style={styles.textoSecundario}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.botoesPonto}>
            <TouchableOpacity
              style={[styles.botaoPonto, styles.botaoEntrada]}
              onPress={() => iniciarRegistroComBiometria('entrada')}
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
              onPress={() => iniciarRegistroComBiometria('saida')}
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
              onPress={() => iniciarRegistroComBiometria('pausa')}
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
              onPress={() => iniciarRegistroComBiometria('retorno')}
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
  cardBiometria: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  tituloBiometria: {
    fontSize: 15,
    color: '#1e3a8a',
    fontWeight: '700',
    marginBottom: 8,
  },
  camera: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  acoesBiometria: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoBiometriaConfirmar: {
    flex: 1,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botaoBiometriaCancelar: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#93c5fd',
    justifyContent: 'center',
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
