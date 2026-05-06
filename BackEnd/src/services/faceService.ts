import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';

// Usar build WASM (não requer @tensorflow/tfjs-node com bindings nativos)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');

const MODELS_PATH = path.join(__dirname, '../../models');
const THRESHOLD = 0.5; // distância máxima para considerar o mesmo rosto

let modelosCarregados = false;

/**
 * Inicializa os modelos face-api uma única vez.
 * Deve ser chamado no startup do servidor.
 */
export async function inicializarModelos(): Promise<void> {
  if (modelosCarregados) return;

  // Inicializar backend WASM antes de usar face-api
  await tf.setBackend('wasm');
  await tf.ready();

  // Usar implementação canvas para Node.js
  const { Canvas, Image, ImageData } = createCanvas(1, 1).constructor as any;
  (faceapi.env as any).monkeyPatch({ Canvas, Image, ImageData });

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

  modelosCarregados = true;
  console.log('Modelos face-api carregados ✅');
}

/**
 * Extrai o face descriptor (vetor Float32Array de 128 valores) de uma imagem base64.
 * Retorna null se nenhum rosto for detectado.
 */
export async function extrairDescriptor(base64: string): Promise<Float32Array | null> {
  const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const img = await loadImage(buffer);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img as any, 0, 0);

  const detection = await faceapi
    .detectSingleFace(canvas as any, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return detection.descriptor;
}

/**
 * Serializa o descriptor para armazenar no banco (JSON array).
 */
export function serializarDescriptor(descriptor: Float32Array): string {
  return JSON.stringify(Array.from(descriptor));
}

/**
 * Desserializa o descriptor armazenado no banco.
 */
export function deserializarDescriptor(json: string): Float32Array {
  return new Float32Array(JSON.parse(json));
}

/**
 * Calcula a distância euclidiana entre dois descriptors.
 * Retorna um score de similaridade entre 0 e 1 (1 = idêntico).
 */
export function calcularSimilaridade(a: Float32Array, b: Float32Array): { distancia: number; score: number; verificada: boolean } {
  const distancia = faceapi.euclideanDistance(a, b);
  const score = Math.max(0, 1 - distancia / THRESHOLD);
  return {
    distancia,
    score: parseFloat(score.toFixed(4)),
    verificada: distancia <= THRESHOLD
  };
}
