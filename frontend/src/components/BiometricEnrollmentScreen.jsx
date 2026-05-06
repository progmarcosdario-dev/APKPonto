import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api/api';

export default function BiometricEnrollmentScreen({ employeeName, employeeCode, onEnrolled, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const iniciarCamera = async () => {
    setErro('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 540 } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraAtiva(true);
    } catch (_e) {
      setErro('Nao foi possivel acessar a camera. Verifique as permissoes.');
    }
  };

  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraAtiva(false);
  };

  const capturarECadastrar = async () => {
    if (!videoRef.current || !canvasRef.current || !employeeCode) {
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Falha ao capturar imagem');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.replace('data:image/jpeg;base64,', '');

      await API.cadastrarBiometria(String(employeeCode), base64);
      pararCamera();
      onEnrolled();
    } catch (cadastroErro) {
      setErro(cadastroErro?.message || 'Falha ao cadastrar biometria');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBEBEB',
        padding: '1.2rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '44rem', backgroundColor: '#fff', borderRadius: '1rem', padding: '1.2rem', boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginTop: 0, color: '#1f2937' }}>Cadastro de Biometria</h2>
        <p style={{ color: '#4b5563', marginTop: 0 }}>
          {employeeName}, voce ainda nao possui biometria cadastrada. Capture seu rosto para continuar.
        </p>

        {cameraAtiva && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid #d1d5db', marginBottom: '0.8rem' }}
          />
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {!cameraAtiva && (
            <button
              type="button"
              onClick={iniciarCamera}
              style={{ flex: 1, border: 'none', borderRadius: '0.5rem', backgroundColor: '#111827', color: '#fff', padding: '0.75rem', fontWeight: 700 }}
            >
              Abrir camera
            </button>
          )}

          {cameraAtiva && (
            <>
              <button
                type="button"
                onClick={capturarECadastrar}
                disabled={carregando}
                style={{ flex: 1, border: 'none', borderRadius: '0.5rem', backgroundColor: '#0F7C3E', color: '#fff', padding: '0.75rem', fontWeight: 700, opacity: carregando ? 0.75 : 1 }}
              >
                {carregando ? 'Cadastrando...' : 'Capturar e cadastrar'}
              </button>
              <button
                type="button"
                onClick={pararCamera}
                style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: '#fff', color: '#111827', padding: '0.75rem 1rem', fontWeight: 700 }}
              >
                Fechar
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: '#fff', color: '#111827', padding: '0.65rem 0.9rem', fontWeight: 700 }}
          >
            Cancelar
          </button>
          {erro && <span style={{ color: '#b91c1c', fontSize: '0.95rem' }}>{erro}</span>}
        </div>
      </div>
    </motion.div>
  );
}
