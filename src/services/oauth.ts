import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OAUTH_BASE_URL,
} from "../helpers/constants";

// Almacenamiento temporal para states OAuth (en memoria)
const oauthStates = new Map<string, { timestamp: number; state: string }>();

// Limpiar states expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStates.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutos
      oauthStates.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Verificar que las credenciales OAuth estén configuradas
const isOAuthConfigured = () => {
  const hasGoogle = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET;
  const hasGitHub = GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET;
  
  return {
    google: hasGoogle,
    github: hasGitHub,
    any: hasGoogle || hasGitHub,
  };
};

// Generar URL de autorización para Google
export const generateGoogleAuthURL = () => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  }
  
  const state = generateState();
  const redirectUri = `${OAUTH_BASE_URL}/auth/google/callback`;
  const scope = "openid profile email";
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    state: state,
    access_type: "offline",
    prompt: "consent",
  });
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return { url, state };
};

// Generar URL de autorización para GitHub  
export const generateGitHubAuthURL = () => {
  if (!GITHUB_CLIENT_ID) {
    throw new Error("GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET");
  }
  
  const state = generateState();
  const redirectUri = `${OAUTH_BASE_URL}/auth/github/callback`;
  const scope = "user:email read:user";
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    state: state,
  });
  
  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  return { url, state };
};

// Intercambiar código por tokens - Google
export const exchangeGoogleCode = async (code: string) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth not configured");
  }
  
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${OAUTH_BASE_URL}/auth/google/callback`,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
      idToken: tokens.id_token,
    };
  } catch (error) {
    console.error("Error exchanging Google code:", error);
    throw new Error("Failed to exchange Google authorization code");
  }
};

// Intercambiar código por tokens - GitHub
export const exchangeGitHubCode = async (code: string) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("GitHub OAuth not configured");
  }
  
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `${OAUTH_BASE_URL}/auth/github/callback`,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      tokenType: tokens.token_type,
      scope: tokens.scope,
    };
  } catch (error) {
    console.error("Error exchanging GitHub code:", error);
    throw new Error("Failed to exchange GitHub authorization code");
  }
};

// Obtener información del usuario de Google usando OpenID Connect userinfo endpoint
export const getGoogleUser = async (accessToken: string) => {
  try {
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch Google user");
    }
    
    const user = await response.json();
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      avatar: user.picture,
      verified: user.email_verified || false,
    };
  } catch (error) {
    console.error("Error fetching Google user:", error);
    throw new Error("Failed to fetch Google user information");
  }
};

// Obtener información del usuario de GitHub
export const getGitHubUser = async (accessToken: string) => {
  try {
    // Obtener información básica del usuario
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Afor-App",
      },
    });
    
    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user");
    }
    
    const userData = await userResponse.json();
    
    // Obtener email del usuario (puede ser privado)
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Afor-App",
      },
    });
    
    let email = userData.email;
    if (!email && emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary);
      email = primaryEmail?.email || emails[0]?.email;
    }
    
    return {
      id: userData.id.toString(),
      email: email,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      verified: !!email, // GitHub emails are generally verified
    };
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    throw new Error("Failed to fetch GitHub user information");
  }
};

// Generar state aleatorio para prevenir CSRF
export const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Guardar state en memoria
export const saveOAuthState = (state: string): void => {
  oauthStates.set(state, {
    timestamp: Date.now(),
    state: state
  });
  console.log("💾 OAuth state saved:", state);
};

// Verificar y consumir state
export const verifyOAuthState = (state: string): boolean => {
  const stored = oauthStates.get(state);
  if (!stored) {
    console.log("❌ OAuth state not found:", state);
    return false;
  }
  
  // Verificar que no haya expirado (10 minutos)
  if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
    console.log("❌ OAuth state expired:", state);
    oauthStates.delete(state);
    return false;
  }
  
  // Consumir el state (uso único)
  oauthStates.delete(state);
  console.log("✅ OAuth state verified and consumed:", state);
  return true;
};

// Verificar configuración OAuth
export const getOAuthStatus = () => {
  const config = isOAuthConfigured();
  
  return {
    configured: config,
    providers: {
      google: {
        enabled: config.google,
        authUrl: config.google ? `${OAUTH_BASE_URL}/auth/google` : null,
        userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
        note: "Using OpenID Connect standard endpoints",
      },
      github: {
        enabled: config.github,
        authUrl: config.github ? `${OAUTH_BASE_URL}/auth/github` : null,
        userInfoEndpoint: "https://api.github.com/user",
        note: "Using GitHub REST API v3",
      },
    },
  };
}; 