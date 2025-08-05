import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

// Função auxiliar para atualizar o access token
async function refreshAccessToken(token) {
  console.log('[refreshAccessToken] Iniciando refresh do access token...');
  console.log('[refreshAccessToken] Token recebido:', token);
  try {
    const clientId = process.env.AUTH_KEYCLOAK_ID;
    const clientSecret = process.env.AUTH_KEYCLOAK_SECRET;
    const refreshUrl = `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    console.log('[refreshAccessToken] Variáveis de ambiente:', { clientId, clientSecret, refreshUrl });

    const requestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });
    console.log('[refreshAccessToken] Corpo da requisição:', requestBody.toString());

    const response = await fetch(refreshUrl, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      method: "POST",
    });

    const tokens = await response.json();
    console.log('[refreshAccessToken] Resposta da requisição:', tokens);

    if (!response.ok) {
      console.error('[refreshAccessToken] Erro ao atualizar token:', tokens);
      throw tokens;
    }

    return {
      ...token,
      accessToken: tokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + (tokens.expires_in)),
      refreshToken: tokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('[refreshAccessToken] Exception capturada:', error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          refreshToken: account.refresh_token,
          user: token.user,
        };
      }
      // Retorna o token anterior se ainda não expirou
      if (token.expiresAt && Date.now() / 1000 < token.expiresAt) {
        return token;
      }
      // Atualiza o access token se expirou
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});
