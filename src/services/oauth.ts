import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OAUTH_BASE_URL,
} from "../helpers/constants";

// Temporary storage for OAuth states (in memory)
const oauthStates = new Map<string, { timestamp: number; state: string }>();

// Clean expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStates.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      oauthStates.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Verify that OAuth credentials are configured
const isOAuthConfigured = () => {
  const hasGoogle = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET;
  const hasGitHub = GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET;
  
  return {
    google: hasGoogle,
    github: hasGitHub,
    any: hasGoogle || hasGitHub,
  };
};

// Generate authorization URL for Google
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

// Generate authorization URL for GitHub  
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

// Exchange code for tokens - Google
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

// Exchange code for tokens - GitHub
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

// Get Google user information using OpenID Connect userinfo endpoint
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

// Get GitHub user information
export const getGitHubUser = async (accessToken: string) => {
  try {
    // Get basic user information
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
    
    // Get user email (may be private)
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

// Generate random state to prevent CSRF
export const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Save state in memory
export const saveOAuthState = (state: string): void => {
  oauthStates.set(state, {
    timestamp: Date.now(),
    state: state
  });
  console.log("💾 OAuth state saved:", state);
};

// Verify and consume state
export const verifyOAuthState = (state: string): boolean => {
  const stored = oauthStates.get(state);
  if (!stored) {
    console.log("❌ OAuth state not found:", state);
    return false;
  }
  
  // Verify it hasn't expired (10 minutes)
  if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
    console.log("❌ OAuth state expired:", state);
    oauthStates.delete(state);
    return false;
  }
  
  // Consume the state (single use)
  oauthStates.delete(state);
  console.log("✅ OAuth state verified and consumed:", state);
  return true;
};

// Verify OAuth configuration
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