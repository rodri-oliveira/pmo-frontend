// Arquivo: next-auth.d.ts
// Local: /home/ubuntu/frontend_project/automacaopmofrontend/next-auth.d.ts
// (Se a pasta types existir, pode ser /home/ubuntu/frontend_project/automacaopmofrontend/types/next-auth.d.ts)

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Retornado pelo hook `useSession`, `getSession` e recebido como prop para o `SessionProvider`
   */
  interface Session extends DefaultSession {
    accessToken?: string;
    idToken?: string;
    error?: string; // Para propagar erros de refresh token
    user: {
      id?: string | null | undefined; // Adicionando id ao usuário da sessão
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    // Adicione quaisquer propriedades personalizadas do usuário aqui, se necessário
  }
}

declare module "next-auth/jwt" {
  /** Retornado pelo callback `jwt` e passado para o callback `session` */
  interface JWT extends NextAuthJWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    error?: string; // Para propagar erros de refresh token
    // user?: Session["user"]; // Se precisar de informações do usuário no token JWT
  }
}

