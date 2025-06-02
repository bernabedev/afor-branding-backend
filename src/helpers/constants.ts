export const {
  PORT,
  ALLOWED_ORIGINS,
  GEMINI_API_KEY,
  GEMINI_MODEL = "gemini-2.0-flash",
  JWT_SECRET = "afor",
  // OAuth Configuration
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OAUTH_BASE_URL = "http://localhost:3000",
} = process.env;
