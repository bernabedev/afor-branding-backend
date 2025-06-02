import { Elysia, t } from "elysia";
import { PrismaClient } from "../../generated/prisma";
import { JwtSignerVerifier } from "./domain/jwt-payload.interface";
import {
  generateGoogleAuthURL,
  generateGitHubAuthURL,
  exchangeGoogleCode,
  exchangeGitHubCode,
  getGoogleUser,
  getGitHubUser,
  getOAuthStatus,
  saveOAuthState,
  verifyOAuthState,
} from "../../services/oauth";

interface OAuthModuleProps {
  prisma: PrismaClient;
  jwtInstance: JwtSignerVerifier;
}

export const oauthModule = ({ prisma, jwtInstance }: OAuthModuleProps) =>
  new Elysia({ prefix: "/auth" })
    
    // Estado de configuración OAuth
    .get(
      "/oauth/status",
      async () => {
        return getOAuthStatus();
      },
      {
        detail: {
          summary: "OAuth Configuration Status",
          description: "Check which OAuth providers are configured and available",
        },
      }
    )

    // Iniciar flujo OAuth con Google
    .get(
      "/google",
      async ({ set }) => {
        try {
          const { url, state } = generateGoogleAuthURL();
          
          saveOAuthState(state);
          
          set.redirect = url;
          return { redirectUrl: url };
        } catch (error) {
          set.status = 500;
          return { 
            error: "OAuth not configured", 
            message: error instanceof Error ? error.message : "Unknown error" 
          };
        }
      },
      {
        detail: {
          summary: "Start Google OAuth",
          description: "Redirect to Google OAuth authorization",
        },
      }
    )

    // Callback de Google OAuth
    .get(
      "/google/callback",
      async ({ query, set, cookie: { auth } }) => {
        try {
          const { code, state } = query;
          
          if (!code || !state) {
            set.status = 400;
            return { error: "Missing code or state parameter" };
          }
          
          if (!verifyOAuthState(state)) {
            set.status = 400;
            return { error: "Invalid state parameter" };
          }

          // Intercambiar código por tokens
          const tokens = await exchangeGoogleCode(code);
          
          // Obtener información del usuario
          const googleUser = await getGoogleUser(tokens.accessToken);
          
          if (!googleUser.email) {
            set.status = 400;
            return { error: "No email provided by Google" };
          }
          
          // Buscar o crear usuario en la base de datos
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: googleUser.email },
                { 
                  provider: "GOOGLE",
                  providerId: googleUser.id 
                }
              ]
            }
          });
          
          if (!user) {
            // Crear nuevo usuario
            user = await prisma.user.create({
              data: {
                email: googleUser.email,
                name: googleUser.name,
                provider: "GOOGLE",
                providerId: googleUser.id,
                avatar: googleUser.avatar,
                verified: googleUser.verified,
              },
            });
          } else if (user.provider === "EMAIL") {
            // Actualizar usuario existente para agregar Google
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: "GOOGLE",
                providerId: googleUser.id,
                avatar: googleUser.avatar || user.avatar,
                name: googleUser.name || user.name,
                verified: googleUser.verified || user.verified,
              },
            });
          }
          
          // Generar JWT
          const token = await jwtInstance.sign({ 
            sub: user.id,
            email: user.email,
            name: user.name,
          });
          
          // Establecer cookie de autenticación
          auth.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 días
          });
          
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              avatar: user.avatar,
              provider: user.provider,
            },
          };
        } catch (error) {
          console.error("Google OAuth callback error:", error);
          set.status = 500;
          return { 
            error: "Authentication failed", 
            message: error instanceof Error ? error.message : "Unknown error" 
          };
        }
      },
      {
        query: t.Object({
          code: t.String(),
          state: t.String(),
        }),
        detail: {
          summary: "Google OAuth Callback",
          description: "Handle Google OAuth callback and create session",
        },
      }
    )

    // Iniciar flujo OAuth con GitHub
    .get(
      "/github",
      async ({ set }) => {
        try {
          const { url, state } = generateGitHubAuthURL();
          
          saveOAuthState(state);
          
          set.redirect = url;
          return { redirectUrl: url };
        } catch (error) {
          set.status = 500;
          return { 
            error: "OAuth not configured", 
            message: error instanceof Error ? error.message : "Unknown error" 
          };
        }
      },
      {
        detail: {
          summary: "Start GitHub OAuth",
          description: "Redirect to GitHub OAuth authorization",
        },
      }
    )

    // Callback de GitHub OAuth
    .get(
      "/github/callback",
      async ({ query, set, cookie: { auth } }) => {
        try {
          const { code, state } = query;
          
          if (!code || !state) {
            set.status = 400;
            return { error: "Missing code or state parameter" };
          }
          
          if (!verifyOAuthState(state)) {
            set.status = 400;
            return { error: "Invalid state parameter" };
          }

          // Intercambiar código por tokens
          const tokens = await exchangeGitHubCode(code);
          
          // Obtener información del usuario
          const githubUser = await getGitHubUser(tokens.accessToken);
          
          if (!githubUser.email) {
            set.status = 400;
            return { error: "No email provided by GitHub" };
          }
          
          // Buscar o crear usuario en la base de datos
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: githubUser.email },
                { 
                  provider: "GITHUB",
                  providerId: githubUser.id 
                }
              ]
            }
          });
          
          if (!user) {
            // Crear nuevo usuario
            user = await prisma.user.create({
              data: {
                email: githubUser.email,
                name: githubUser.name,
                provider: "GITHUB",
                providerId: githubUser.id,
                avatar: githubUser.avatar,
                verified: githubUser.verified,
              },
            });
          } else if (user.provider === "EMAIL") {
            // Actualizar usuario existente para agregar GitHub
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: "GITHUB",
                providerId: githubUser.id,
                avatar: githubUser.avatar || user.avatar,
                name: githubUser.name || user.name,
                verified: githubUser.verified || user.verified,
              },
            });
          }
          
          // Generar JWT
          const token = await jwtInstance.sign({ 
            sub: user.id,
            email: user.email,
            name: user.name,
          });
          
          // Establecer cookie de autenticación
          auth.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 días
          });
          
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              avatar: user.avatar,
              provider: user.provider,
            },
          };
        } catch (error) {
          console.error("GitHub OAuth callback error:", error);
          set.status = 500;
          return { 
            error: "Authentication failed", 
            message: error instanceof Error ? error.message : "Unknown error" 
          };
        }
      },
      {
        query: t.Object({
          code: t.String(),
          state: t.String(),
        }),
        detail: {
          summary: "GitHub OAuth Callback",
          description: "Handle GitHub OAuth callback and create session",
        },
      }
    ); 