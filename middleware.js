import { NextResponse } from 'next/server';


export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Se for uma requisição para a API
  if (pathname.startsWith('/backend/') || pathname === '/recursos') {
    // Criar uma nova URL para o backend
    const targetPath = pathname.startsWith('/backend/') ? pathname : `/backend/v1${pathname}`;
    const url = new URL(targetPath, 'http://localhost:8000');
    
    // Adicionar os query params, se houver
    const searchParams = request.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log('Middleware: Redirecionando requisição para:', url.toString());
    console.log('Middleware: Método:', request.method);
    console.log('Middleware: Headers originais:', Object.fromEntries(request.headers.entries()));

    // Criar uma nova requisição com os headers necessários
    const headers = new Headers(request.headers);
    headers.set('Origin', request.headers.get('origin') || 'http://localhost:3000');

    try {
      // Se for uma requisição OPTIONS, retornar diretamente com os headers CORS
      if (request.method === 'OPTIONS') {
        console.log('Middleware: Respondendo preflight OPTIONS');
        return new NextResponse(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      // Para outras requisições, encaminhar para o backend
      const response = await fetch(url.toString(), {
        method: request.method,
        headers: headers,
        body: ['GET', 'HEAD', 'OPTIONS'].includes(request.method) ? undefined : await request.text(),
        credentials: 'include',
      });

      console.log('Middleware: Resposta do backend:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Se houver erro, tentar ler o corpo da resposta para mais detalhes
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Middleware: Erro do backend:', errorBody);
      }

      // Criar uma nova resposta com os headers CORS
      const newResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true',
          ...Object.fromEntries(response.headers.entries()),
        },
      });

      return newResponse;
    } catch (error) {
      console.error('Middleware: Erro ao fazer requisição para o backend:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Erro ao conectar com o backend',
          details: error instanceof Error ? error.message : String(error)
        }), 
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true',
          },
        }
      );
    }
  }

  // Para outras requisições, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/backend/:path*',
    '/recursos',
  ],
};
