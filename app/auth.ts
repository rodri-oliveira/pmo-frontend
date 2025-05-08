import NextAuth, { User, Account, Profile } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";

// Helper function to refresh the access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const clientId = process.env.AUTH_KEYCLOAK_ID as string;
    const clientSecret = process.env.AUTH_KEYCLOAK_SECRET as string;
    const refreshUrl = `${process.env.AUTH_KEYCLOAK_ISSUER as string}/protocol/openid-connect/token`;

    const response = await fetch(refreshUrl, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string, // Use refreshToken from JWT
      }),
      method: "POST",
    });

    const tokens = await response.json();

    if (!response.ok) throw tokens;

    return {
      ...token, // Spread the original token properties
      accessToken: tokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + (tokens.expires_in as number)),
      refreshToken: tokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    // The error property will be used client-side to handle the error (e.g. signOut user)
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_KEYCLOAK_ID as string,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET as string,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        return {
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          refreshToken: account.refresh_token,
          user: token.user as User & AdapterUser, // Ensure user is correctly typed
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      if (token.user) {
        session.user = token.user as User & AdapterUser;
      }
      return session;
    },
  },
});

