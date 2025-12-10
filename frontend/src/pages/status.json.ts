// Arquivo para verificar status do frontend
// Acesse: http://localhost:3000/status.json

export default function Status() {
  return new Response(
    JSON.stringify({ active: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
