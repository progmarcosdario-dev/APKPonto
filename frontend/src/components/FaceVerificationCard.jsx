import React, { useEffect, useRef, useState } from 'react';
import API from '../api/api';

export default function FaceVerificationCard({ funcionarioCodigo, onVerifiedChange, autoStart = false, autoCapture = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [erro, setErro] = useState('');
  const [status, setStatus] = useState('Aguardando validação facial');
  const [dispositivos, setDispositivos] = useState([]);
  const [deviceIdSelecionado, setDeviceIdSelecionado] = useState('');
  const [contagemRegressiva, setContagemRegressiva] = useState(null);

  const carregarDispositivos = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((d) => d.kind === 'videoinput');
    setDispositivos(cameras);
    if (cameras.length > 0 && !deviceIdSelecionado) {
      setDeviceIdSelecionado(cameras[0].deviceId);
    }
  };

  useEffect(() => {
    if (!navigator.mediaDevices) {
      setErro('Câmera não disponível. Acesse via HTTPS.');
      return;
    }
    carregarDispositivos().catch(() => {});
  }, []);

  useEffect(() => {
    if (cameraAtiva && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraAtiva]);

  useEffect(() => {
    if (autoStart && !cameraAtiva) {
      iniciarCamera();
    }
  }, [autoStart, cameraAtiva]);

  const iniciarContagemCaptura = () => {
    if (!autoCapture || !cameraAtiva) {
      return;
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    let contador = 3;
    setContagemRegressiva(contador);
    setStatus('Posicione o rosto. Captura automática em andamento...');

    countdownRef.current = setInterval(() => {
      contador -= 1;
      if (contador > 0) {
        setContagemRegressiva(contador);
        return;
      }

      clearInterval(countdownRef.current);
      countdownRef.current = null;
      setContagemRegressiva(null);
      capturarEValidar();
    }, 1000);
  };

  const iniciarCamera = async (deviceId) => {
    setErro('');
    try {
      const id = deviceId !== undefined ? deviceId : deviceIdSelecionado;
      const video = id
        ? { deviceId: { exact: id }, width: { ideal: 720 }, height: { ideal: 540 } }
        : { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 540 } };
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
      streamRef.current = stream;
      setCameraAtiva(true);
      await carregarDispositivos();
      setStatus('Camera ativa. Enquadre o rosto e confirme.');
      if (autoCapture) {
        setTimeout(() => iniciarContagemCaptura(), 250);
      }
    } catch (cameraErro) {
      setErro('Nao foi possivel acessar a camera. Verifique permissoes do navegador.');
      setStatus('Validacao facial indisponivel');
    }
  };

  const trocarCamera = async (novoDeviceId) => {
    setDeviceIdSelecionado(novoDeviceId);
    if (cameraAtiva) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      try {
        const video = novoDeviceId
          ? { deviceId: { exact: novoDeviceId }, width: { ideal: 720 }, height: { ideal: 540 } }
          : { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 540 } };
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        if (autoCapture) {
          setTimeout(() => iniciarContagemCaptura(), 250);
        }
      } catch (_e) {
        setErro('Nao foi possivel acessar a camera selecionada.');
      }
    }
  };

  const pararCamera = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setContagemRegressiva(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraAtiva(false);
  };

  const capturarEValidar = async () => {
    if (!videoRef.current || !canvasRef.current || !funcionarioCodigo) {
      return;
    }

    setCapturando(true);
    setErro('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Nao foi possivel obter contexto de captura');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.replace('data:image/jpeg;base64,', '');

      const resposta = await API.post('/biometria/validar', {
        funcionario_codigo: funcionarioCodigo,
        face_base64: base64
      });

      const biometria = resposta?.data?.biometria;
      if (!biometria?.verificada) {
        if (biometria?.motivo === 'ROSTO_NAO_DETECTADO') {
          setStatus('Rosto nao detectado. Melhore a iluminacao e tente novamente.');
        } else if (biometria?.motivo === 'BIOMETRIA_DESATUALIZADA') {
          setStatus('Biometria desatualizada. Faca o recadastro facial para continuar.');
        } else {
          setStatus('Rosto nao validado. Tente novamente.');
        }
        onVerifiedChange(null);
        if (autoCapture && cameraAtiva) {
          iniciarContagemCaptura();
        }
        return;
      }

      setStatus('Rosto validado com sucesso.');
      onVerifiedChange({
        verificada: true,
        score: biometria.score,
        hash: biometria.hash,
        origem: 'web',
        metodo: 'camera'
      });
      pararCamera();
    } catch (validacaoErro) {
      setErro(validacaoErro?.message || 'Falha ao validar biometria');
      onVerifiedChange(null);
      if (autoCapture && cameraAtiva) {
        iniciarContagemCaptura();
      }
    } finally {
      setCapturando(false);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: '1rem', padding: '0.75rem' }}>
      <p style={{ margin: 0, color: '#2A2A2A', fontWeight: 600, fontSize: '1.1rem' }}>Validacao Facial</p>
      <p style={{ margin: '0.25rem 0 0.5rem 0', color: '#5A5A5A', fontSize: '0.95rem' }}>{status}</p>

      {dispositivos.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', color: '#374151', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.85rem' }}>Camera:</label>
          <select
            value={deviceIdSelecionado}
            onChange={(e) => trocarCamera(e.target.value)}
            disabled={dispositivos.length <= 1}
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '0.4rem', border: '1px solid #ddd', fontSize: '0.85rem', backgroundColor: '#f9fafb' }}
          >
            {dispositivos.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {cameraAtiva && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid #ddd', marginBottom: '0.5rem' }}
        />
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {cameraAtiva && autoCapture && contagemRegressiva && (
        <p style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontWeight: 700, fontSize: '1rem' }}>
          Capturando em {contagemRegressiva}...
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {!cameraAtiva && !autoStart && (
          <button
            type="button"
            onClick={() => iniciarCamera()}
            style={{ flex: 1, border: 'none', borderRadius: '0.5rem', backgroundColor: '#1f2937', color: '#fff', padding: '0.65rem', fontWeight: 600 }}
          >
            Abrir camera
          </button>
        )}

        {cameraAtiva && (
          <>
            {!autoCapture && (
              <button
                type="button"
                onClick={capturarEValidar}
                disabled={capturando}
                style={{ flex: 1, border: 'none', borderRadius: '0.5rem', backgroundColor: '#0F7C3E', color: '#fff', padding: '0.65rem', fontWeight: 600, opacity: capturando ? 0.7 : 1 }}
              >
                {capturando ? 'Validando...' : 'Capturar e validar'}
              </button>
            )}
            <button
              type="button"
              onClick={pararCamera}
              style={{ border: '1px solid #ddd', borderRadius: '0.5rem', backgroundColor: '#fff', color: '#333', padding: '0.65rem 0.8rem', fontWeight: 600 }}
            >
              Fechar
            </button>
          </>
        )}
      </div>

      {erro && (
        <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>{erro}</p>
      )}
    </div>
  );
}
