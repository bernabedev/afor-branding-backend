# 🎨 **Afor Branding Backend**

> **Intelligent AI-powered branding platform that generates color palettes, contextual conversations, and advanced OAuth2 authentication.**

[![Bun](https://img.shields.io/badge/Bun-1.2+-000?style=for-the-badge&logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-Framework-blue?style=for-the-badge)](https://elysiajs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![OAuth2](https://img.shields.io/badge/OAuth2-Google_GitHub-green?style=for-the-badge)](https://oauth.net/2/)

**Languages:** 🇺🇸 **English** | [🇪🇸 Español](README-es.md)

---

## 📋 **Overview**

**Afor** is a modern backend application built with **Bun + Elysia** that combines artificial intelligence with OAuth2 authentication to create a complete automated branding platform.

### ✨ **Key Features**

🔐 **Complete OAuth2 Authentication**

- Google OAuth 2.0 with OpenID Connect
- GitHub OAuth with REST API v3
- Secure JWT tokens with HTTPOnly cookies
- CSRF verification with in-memory storage

🤖 **Integrated Artificial Intelligence**

- Conversational chatbot with Google Gemini AI
- Automatic color palette generation
- Natural language interpretation for branding
- Font and visual elements generation

🎨 **Advanced Palette Management**

- Palette creation based on descriptions
- Favorites and history system
- Export in multiple formats
- Complete OAuth user management

📊 **Robust Database**

- PostgreSQL with Prisma ORM
- Multi-provider users (EMAIL, GOOGLE, GITHUB)
- Conversation and palette history
- Automatic migrations and typed schemas

🛡️ **Security and Performance**

- Configurable rate limiting
- Advanced CORS with multiple origins
- Structured logging middleware
- Data validation with strict types

📖 **Automatic Documentation**

- Integrated Swagger/OpenAPI
- Auto-documented endpoints
- Generated TypeScript types
- Testing endpoints included

---

## 🚀 **Technologies Used**

### **🔧 Backend Core**

- **[Bun](https://bun.sh/)** - Ultra-fast JavaScript runtime
- **[Elysia](https://elysiajs.com/)** - Modern web framework for Bun
- **[TypeScript](https://typescriptlang.org/)** - Static typing

### **🗄️ Database**

- **[PostgreSQL](https://postgresql.org/)** - Relational database
- **[Prisma](https://prisma.io/)** - Modern and type-safe ORM

### **🧠 Artificial Intelligence**

- **[Google Gemini AI](https://ai.google.dev/)** - Content generation
- **Gemini 2.0 Flash API** - Advanced language model

### **🔐 Authentication**

- **OAuth 2.0** - Authentication standard
- **OpenID Connect** - Federated identity
- **JWT** - Secure tokens

### **🐳 DevOps**

- **[Docker](https://docker.com/)** - Containerization
- **Docker Compose** - Service orchestration

---

## 📚 **Documentation**

<details>
<summary><h2>🚀 Local Setup</h2></summary>

This guide will help you run the **Afor** project in your local development environment.

### 📋 Prerequisites

Make sure you have installed:

- **[Bun](https://bun.sh/)** (v1.2 or higher) - Ultra-fast JavaScript runtime
- **[Node.js](https://nodejs.org/)** (v18 or higher) - As fallback
- **[Docker](https://www.docker.com/)** and **Docker Compose** - For the database
- **[Git](https://git-scm.com/)** - Version control

#### 🔧 Verify Bun installation

```bash
bun --version
```

If you don't have Bun installed:

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

### 🗂️ Step 1: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

Add the following variables:

```env
# Server port
PORT=3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://afor_user:afor_password@localhost:5432/afor_db?schema=public"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL="gemini-2.0-flash"

# Authentication
JWT_SECRET="your_super_secure_jwt_secret_here"

# CORS (allowed domains)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"

# OAuth Configuration (optional - see OAuth tab)
OAUTH_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

#### 🔑 Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new project or use an existing one
4. Go to **API Keys** and generate a new key
5. Copy the key and paste it into `GEMINI_API_KEY`

### 🗄️ Step 2: Configure PostgreSQL Database

#### Option A: With Docker (Recommended)

Create a `docker-compose.dev.yml` file for development:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    container_name: afor-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: afor_db
      POSTGRES_USER: afor_user
      POSTGRES_PASSWORD: afor_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U afor_user -d afor_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer
    container_name: afor-adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run the database:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### Option B: Local PostgreSQL

If you prefer to install PostgreSQL directly:

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create the database:

```sql
CREATE DATABASE afor_db;
CREATE USER afor_user WITH PASSWORD 'afor_password';
GRANT ALL PRIVILEGES ON DATABASE afor_db TO afor_user;
```

### 📦 Step 3: Install Dependencies

```bash
bun install
```

### 🔄 Step 4: Configure Prisma and Database

#### Generate Prisma client

```bash
bun run postinstall
# or directly:
npx prisma generate
```

#### Run migrations

```bash
npx prisma migrate dev --name init
```

#### (Optional) Visualize the database

```bash
npx prisma studio
```

This will open a web interface at `http://localhost:5555` to view and edit data.

### 🚀 Step 5: Run the Project

#### Development mode (with hot reload)

```bash
bun run dev
```

#### Production mode

```bash
bun run start
```

### ✅ Verify Everything Works

Once running, you should see:

```
🔌 Connected to the database
🦊 Elysia is running at http://localhost:3000
```

#### Test endpoints:

1. **Health Check**: `GET http://localhost:3000/health`
2. **Documentation**: `GET http://localhost:3000/docs`
3. **API Root**: `GET http://localhost:3000/`

#### Example with curl:

```bash
# Health check
curl http://localhost:3000/health

# Generate palette (public endpoint)
curl -X POST http://localhost:3000/generate-palette \
  -H "Content-Type: application/json" \
  -d '{"value": "a modern and minimalist technology company"}'
```

### 🔧 Available Scripts

```bash
# Development with hot reload
bun run dev

# Production
bun run start

# Generate Prisma client
bun run postinstall

# Reset database
npx prisma migrate reset

# View Docker logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 🛠️ Troubleshooting

#### Error: "Cannot connect to database"

1. Verify PostgreSQL is running:

   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. Check the `DATABASE_URL` in `.env`

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

#### Error: "Invalid Gemini API Key"

1. Verify your API key is valid
2. Make sure you have credits in Google AI Studio
3. Check that `GEMINI_MODEL` is correct

#### Port 3000 busy

Change the port in `.env`:

```env
PORT=3001
```

### 📊 Monitoring and Development

#### View database

- **Prisma Studio**: `npx prisma studio` (port 5555)
- **Adminer**: `http://localhost:8080` (if using Docker)

#### Application logs

Logs will appear in the console with structured format thanks to **Logestic**.

</details>

<details>
<summary><h2>🔐 OAuth Configuration</h2></summary>

**Status:** ✅ Complete implementation

### 📋 **Summary**

OAuth configuration for authentication with Google and GitHub in **afor-branding-backend**.

#### ✅ **Supported providers:**

- 🔵 **Google OAuth 2.0** (OpenID Connect)
- ⚫ **GitHub OAuth**

### 🔵 **1. Google OAuth Configuration**

#### **Step 1: Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable **Google Identity Services**

#### **Step 2: Create OAuth 2.0 credentials**

1. Go to **APIs & Services > Credentials**
2. Click **"+ CREATE CREDENTIALS" > "OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   ```
   Name: Afor App - OAuth
   JavaScript origins: http://localhost:3000
   Redirect URIs: http://localhost:3000/auth/google/callback
   ```

#### **Step 3: OAuth consent screen**

1. Go to **OAuth consent screen**
2. Configure:
   ```
   App name: Afor Branding Platform
   User support email: your-email@domain.com
   ```
3. **Scopes:**
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### ⚫ **2. GitHub OAuth Configuration**

#### **Create OAuth App**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Configure:
   ```
   Application name: Afor Branding Platform
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/auth/github/callback
   ```

### 🔧 **3. Environment Variables**

Update your `.env` file:

```bash
# OAuth Configuration
OAUTH_BASE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Existing variables...
PORT=3000
DATABASE_URL="postgresql://..."
JWT_SECRET=your_very_secure_jwt_secret
ALLOWED_ORIGINS=http://localhost:3000
```

### 🚀 **4. API Endpoints**

```bash
GET /auth/oauth/status          # Configuration status
GET /auth/google               # Start Google OAuth
GET /auth/google/callback      # Google callback
GET /auth/github               # Start GitHub OAuth
GET /auth/github/callback      # GitHub callback
```

### 🧪 **5. Testing**

```bash
# Server status
curl http://localhost:3000/health

# OAuth status
curl http://localhost:3000/auth/oauth/status

# OAuth flows (in browser)
http://localhost:3000/auth/google
http://localhost:3000/auth/github
```

### 🔧 **6. Production Configuration**

#### **Environment variables:**

```bash
OAUTH_BASE_URL=https://your-domain.com
GOOGLE_CLIENT_ID=prod_google_client_id
GOOGLE_CLIENT_SECRET=prod_google_client_secret
GITHUB_CLIENT_ID=prod_github_client_id
GITHUB_CLIENT_SECRET=prod_github_client_secret
ALLOWED_ORIGINS=https://your-domain.com
```

#### **Redirect URIs:**

- Google: `https://your-domain.com/auth/google/callback`
- GitHub: `https://your-domain.com/auth/github/callback`

### 📚 **References**

- [Google Identity - OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)

</details>

---

## 🏗️ **System Architecture**

```mermaid
flowchart TD
    subgraph "🌐 Client"
        User[👤 User] --> UI[🖥️ Frontend]
    end

    subgraph "⚡ Backend API"
        Router[🚦 Router] --> MW[🔧 Middlewares]
        MW --> Auth[🔐 OAuth2 + JWT]
        MW --> Bot[🤖 AI Chatbot]
        MW --> Palettes[🎨 Palettes]
    end

    subgraph "🔐 OAuth"
        Google[🔵 Google]
        GitHub[⚫ GitHub]
    end

    subgraph "🧠 AI"
        Gemini[🤖 Gemini AI]
    end

    subgraph "🗄️ Data"
        DB[(🗃️ PostgreSQL)]
    end

    UI --> Router
    Auth --> Google
    Auth --> GitHub
    Bot --> Gemini
    Palettes --> Gemini
    Auth --> DB
    Bot --> DB
    Palettes --> DB
```

---

## 🛣️ **API Endpoints**

### **🔐 Authentication**

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| `POST` | `/auth/login`           | Login with email/password  |
| `POST` | `/auth/register`        | User registration          |
| `GET`  | `/auth/google`          | Start Google OAuth         |
| `GET`  | `/auth/google/callback` | Google OAuth callback      |
| `GET`  | `/auth/github`          | Start GitHub OAuth         |
| `GET`  | `/auth/github/callback` | GitHub OAuth callback      |
| `GET`  | `/auth/oauth/status`    | OAuth configuration status |

### **🤖 AI Chatbot**

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| `POST` | `/bot/:id`         | Send message to chatbot |
| `GET`  | `/bot/:id/history` | Conversation history    |

### **🎨 Color Palettes**

| Method   | Endpoint            | Description              |
| -------- | ------------------- | ------------------------ |
| `POST`   | `/generate-palette` | Generate palette with AI |
| `GET`    | `/palettes`         | List user palettes       |
| `POST`   | `/palettes`         | Create custom palette    |
| `PUT`    | `/palettes/:id`     | Update palette           |
| `DELETE` | `/palettes/:id`     | Delete palette           |

### **📊 System**

| Method | Endpoint  | Description           |
| ------ | --------- | --------------------- |
| `GET`  | `/health` | Server status         |
| `GET`  | `/docs`   | Swagger documentation |

---

## 🚀 **Quick Start**

```bash
# 1. Clone repository
git clone https://github.com/your-user/afor-branding-backend.git
cd afor-branding-backend

# 2. Install dependencies
bun install

# 3. Configure environment variables
cp env.example .env
# Edit .env with your credentials

# 4. Start database
docker-compose -f docker-compose.dev.yml up -d

# 5. Run migrations
npx prisma migrate dev

# 6. Start server
bun run dev
```

🎉 **Ready!** Your API will be available at `http://localhost:3000`

---

## 📞 **Support and Contribution**

### 🐛 **Report Issues**

If you find any problems, please [create an issue](https://github.com/your-user/afor-branding-backend/issues).

### 🤝 **Contributing**

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

---

## 📄 **License**

This project is under the MIT License. See [LICENSE](LICENSE) for more details.

---

<div align="center">

**Developed with ❤️ using Bun + Elysia + AI**

[![Bun](https://img.shields.io/badge/Built_with-Bun-000?style=flat-square&logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Powered_by-Elysia-blue?style=flat-square)](https://elysiajs.com/)
[![AI](https://img.shields.io/badge/Enhanced_with-AI-purple?style=flat-square)](https://ai.google.dev/)

</div>
