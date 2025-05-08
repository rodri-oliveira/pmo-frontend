// Arquivo: app/page.tsx
// Local: C:\weg\automacaopmofrontend\app\page.tsx

import { auth } from "@/app/auth"; // Certifique-se que o caminho para auth está correto
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    // Se o usuário está autenticado
    if (session.error === "RefreshAccessTokenError") {
      // Se houve um erro ao tentar atualizar o token de acesso,
      // o usuário precisa se autenticar novamente.
      // Redireciona para a página de login para reiniciar o fluxo.
      // A página de login cuidará de chamar signIn.
      redirect("/login?error=RefreshAccessTokenError"); // Opcional: passar o erro como query param
    } else {
      // Se não há erro e a sessão é válida, redireciona para o dashboard.
      // A rota do seu dashboard parece ser /dashboard dentro do grupo (admin).
      // O Next.js trata rotas de grupo (admin) de forma transparente para a URL, então /dashboard deve funcionar.
      redirect("/dashboard");
    }
  } else {
    // Se o usuário não está autenticado, redireciona para a página de login.
    redirect("/login");
  }

  // Este retorno não deve ser alcançado na prática devido aos redirecionamentos acima,
  // mas é uma boa prática ter um fallback ou retornar null para Server Components que redirecionam.
  return null;
}

