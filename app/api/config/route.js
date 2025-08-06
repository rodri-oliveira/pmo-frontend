import { NextResponse } from 'next/server';

export async function GET() {
  // Esta rota roda no servidor e tem acesso às variáveis de ambiente do pod.
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    console.error('[API Config] Erro: NEXT_PUBLIC_BACKEND_URL não está definida no servidor.');
    return NextResponse.json(
      { error: 'Configuração do servidor incompleta.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    backendUrl,
  });
}
