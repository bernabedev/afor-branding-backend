# 🎨 **Afor Branding Backend**

> **Plataforma de branding inteligente con IA que genera paletas de colores, conversaciones contextuales y autenticación OAuth2 avanzada.**

[![Bun](https://img.shields.io/badge/Bun-1.2+-000?style=for-the-badge&logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-Framework-blue?style=for-the-badge)](https://elysiajs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![OAuth2](https://img.shields.io/badge/OAuth2-Google_GitHub-green?style=for-the-badge)](https://oauth.net/2/)

**Idiomas:** [🇺🇸 English](README.md) | 🇪🇸 **Español**

---

## 📋 **Descripción General**

**Afor** es una aplicación backend moderna construida con **Bun + Elysia** que combina inteligencia artificial con autenticación OAuth2 para crear una plataforma completa de branding automatizado.

### ✨ **Características Principales**

🔐 **Autenticación OAuth2 Completa**

- Google OAuth 2.0 con OpenID Connect
- GitHub OAuth con REST API v3
- JWT tokens seguros con cookies HTTPOnly
- Verificación CSRF con almacenamiento en memoria

🤖 **Inteligencia Artificial Integrada**

- Chatbot conversacional con Google Gemini AI
- Generación automática de paletas de colores
- Interpretación de lenguaje natural para branding
- Generación de fuentes y elementos visuales

🎨 **Gestión de Paletas Avanzada**

- Creación de paletas basadas en descripciones
- Sistema de favoritos y historial
- Exportación en múltiples formatos
- Gestión completa de usuarios OAuth

📊 **Base de Datos Robusta**

- PostgreSQL con Prisma ORM
- Usuarios multi-proveedor (EMAIL, GOOGLE, GITHUB)
- Historial de conversaciones y paletas
- Migraciones automáticas y schemas tipados

🛡️ **Seguridad y Performance**

- Rate limiting configurable
- CORS avanzado con múltiples orígenes
- Middleware de logging estructurado
- Validación de datos con tipos estrictos

📖 **Documentación Automática**

- Swagger/OpenAPI integrado
- Endpoints autodocumentados
- Tipos TypeScript generados
- Testing endpoints incluidos

---

## 🚀 **Tecnologías Utilizadas**

### **🔧 Backend Core**

- **[Bun](https://bun.sh/)** - Runtime JavaScript ultrarrápido
- **[Elysia](https://elysiajs.com/)** - Framework web moderno para Bun
- **[TypeScript](https://typescriptlang.org/)** - Tipado estático

### **🗄️ Base de Datos**

- **[PostgreSQL](https://postgresql.org/)** - Base de datos relacional
- **[Prisma](https://prisma.io/)** - ORM moderno y type-safe

### **🧠 Inteligencia Artificial**

- **[Google Gemini AI](https://ai.google.dev/)** - Generación de contenido
- **API de Gemini 2.0 Flash** - Modelo de lenguaje avanzado

### **🔐 Autenticación**

- **OAuth 2.0** - Estándar de autenticación
- **OpenID Connect** - Identidad federada
- **JWT** - Tokens seguros

### **🐳 DevOps**

- **[Docker](https://docker.com/)** - Containerización
- **Docker Compose** - Orquestación de servicios

---

## 📚 **Documentación**

<details>
<summary><h2>🚀 Configuración Local</h2></summary>

Esta guía te ayudará a ejecutar el proyecto **Afor** en tu entorno de desarrollo local.

### 📋 Prerrequisitos

Asegúrate de tener instalado:

- **[Bun](https://bun.sh/)** (v1.2 o superior) - Runtime JavaScript ultrarrápido
- **[Node.js](https://nodejs.org/)** (v18 o superior) - Como fallback
- **[Docker](https://www.docker.com/)** y **Docker Compose** - Para la base de datos
- **[Git](https://git-scm.com/)** - Control de versiones

#### 🔧 Verificar instalación de Bun

```bash
bun --version
```

Si no tienes Bun instalado:

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

### 🗂️ Paso 1: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Crear archivo .env
touch .env
```

Agrega las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# Base de datos (PostgreSQL)
DATABASE_URL="postgresql://afor_user:afor_password@localhost:5432/afor_db?schema=public"

# Google Gemini AI
GEMINI_API_KEY="tu_api_key_de_gemini"
GEMINI_MODEL="gemini-2.0-flash"

# Autenticación
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"

# CORS (dominios permitidos)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"

# OAuth Configuration (opcional - ver pestaña OAuth)
OAUTH_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
```

#### 🔑 Obtener API Key de Google Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o usa uno existente
4. Ve a **API Keys** y genera una nueva clave
5. Copia la clave y pégala en `GEMINI_API_KEY`

### 🗄️ Paso 2: Configurar Base de Datos PostgreSQL

#### Opción A: Con Docker (Recomendado)

Crea un archivo `docker-compose.dev.yml` para desarrollo:

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

Ejecutar la base de datos:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### Opción B: PostgreSQL Local

Si prefieres instalar PostgreSQL directamente:

1. Instala PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/)
2. Crea la base de datos:

```sql
CREATE DATABASE afor_db;
CREATE USER afor_user WITH PASSWORD 'afor_password';
GRANT ALL PRIVILEGES ON DATABASE afor_db TO afor_user;
```

### 📦 Paso 3: Instalar Dependencias

```bash
bun install
```

### 🔄 Paso 4: Configurar Prisma y Base de Datos

#### Generar cliente de Prisma

```bash
bun run postinstall
# o directamente:
npx prisma generate
```

#### Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

#### (Opcional) Visualizar la base de datos

```bash
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` para ver y editar datos.

### 🚀 Paso 5: Ejecutar el Proyecto

#### Modo Desarrollo (con hot reload)

```bash
bun run dev
```

#### Modo Producción

```bash
bun run start
```

### ✅ Verificar que Todo Funciona

Una vez ejecutado, deberías ver:

```
🔌 Connected to the database
🦊 Elysia is running at http://localhost:3000
```

#### Probar endpoints:

1. **Health Check**: `GET http://localhost:3000/health`
2. **Documentación**: `GET http://localhost:3000/docs`
3. **API Root**: `GET http://localhost:3000/`

#### Ejemplo con curl:

```bash
# Health check
curl http://localhost:3000/health

# Generar paleta (endpoint público)
curl -X POST http://localhost:3000/generate-palette \
  -H "Content-Type: application/json" \
  -d '{"value": "una empresa de tecnología moderna y minimalista"}'
```

### 🔧 Scripts Disponibles

```bash
# Desarrollo con hot reload
bun run dev

# Producción
bun run start

# Generar cliente Prisma
bun run postinstall

# Resetear base de datos
npx prisma migrate reset

# Ver logs de Docker
docker-compose -f docker-compose.dev.yml logs -f
```

### 🛠️ Solución de Problemas

#### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté ejecutándose:

   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. Verifica la `DATABASE_URL` en `.env`

3. Ejecuta las migraciones:
   ```bash
   npx prisma migrate dev
   ```

#### Error: "Invalid Gemini API Key"

1. Verifica que tu API key sea válida
2. Asegúrate de tener créditos en Google AI Studio
3. Revisa que `GEMINI_MODEL` sea correcto

#### Puerto 3000 ocupado

Cambia el puerto en `.env`:

```env
PORT=3001
```

### 📊 Monitoreo y Desarrollo

#### Ver base de datos

- **Prisma Studio**: `npx prisma studio` (puerto 5555)
- **Adminer**: `http://localhost:8080` (si usas Docker)

#### Logs de la aplicación

Los logs aparecerán en la consola con formato estructurado gracias a **Logestic**.

</details>

<details>
<summary><h2>🔐 Configuración OAuth</h2></summary>

**Estado:** ✅ Implementación completa

### 📋 **Resumen**

Configuración OAuth para autenticación con Google y GitHub en **afor-branding-backend**.

#### ✅ **Proveedores soportados:**

- 🔵 **Google OAuth 2.0** (OpenID Connect)
- ⚫ **GitHub OAuth**

### 🔵 **1. Configuración Google OAuth**

#### **Paso 1: Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Habilita **Google Identity Services**

#### **Paso 2: Crear credenciales OAuth 2.0**

1. Ve a **APIs & Services > Credentials**
2. Clic en **"+ CREATE CREDENTIALS" > "OAuth client ID"**
3. Selecciona **"Web application"**
4. Configura:
   ```
   Nombre: Afor App - OAuth
   JavaScript origins: http://localhost:3000
   Redirect URIs: http://localhost:3000/auth/google/callback
   ```

#### **Paso 3: OAuth consent screen**

1. Ve a **OAuth consent screen**
2. Configura:
   ```
   App name: Afor Branding Platform
   User support email: tu-email@dominio.com
   ```
3. **Scopes:**
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### ⚫ **2. Configuración GitHub OAuth**

#### **Crear OAuth App**

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Clic **"New OAuth App"**
3. Configura:
   ```
   Application name: Afor Branding Platform
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/auth/github/callback
   ```

### 🔧 **3. Variables de Entorno**

Actualiza tu archivo `.env`:

```bash
# OAuth Configuration
OAUTH_BASE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret

# Existing variables...
PORT=3000
DATABASE_URL="postgresql://..."
JWT_SECRET=tu_jwt_secret_muy_seguro
ALLOWED_ORIGINS=http://localhost:3000
```

### 🚀 **4. API Endpoints**

```bash
GET /auth/oauth/status          # Estado de configuración
GET /auth/google               # Iniciar Google OAuth
GET /auth/google/callback      # Callback Google
GET /auth/github               # Iniciar GitHub OAuth
GET /auth/github/callback      # Callback GitHub
```

### 🧪 **5. Pruebas**

```bash
# Estado del servidor
curl http://localhost:3000/health

# Estado OAuth
curl http://localhost:3000/auth/oauth/status

# Flujos OAuth (en navegador)
http://localhost:3000/auth/google
http://localhost:3000/auth/github
```

### 🔧 **6. Configuración de Producción**

#### **Variables de entorno:**

```bash
OAUTH_BASE_URL=https://tu-dominio.com
GOOGLE_CLIENT_ID=prod_google_client_id
GOOGLE_CLIENT_SECRET=prod_google_client_secret
GITHUB_CLIENT_ID=prod_github_client_id
GITHUB_CLIENT_SECRET=prod_github_client_secret
ALLOWED_ORIGINS=https://tu-dominio.com
```

#### **Redirect URIs:**

- Google: `https://tu-dominio.com/auth/google/callback`
- GitHub: `https://tu-dominio.com/auth/github/callback`

### 📚 **Referencias**

- [Google Identity - OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)

</details>

---

## 🏗️ **Arquitectura del Sistema**

```mermaid
flowchart TD
    subgraph "🌐 Cliente"
        User[👤 Usuario] --> UI[🖥️ Frontend]
    end

    subgraph "⚡ Backend API"
        Router[🚦 Router] --> MW[🔧 Middlewares]
        MW --> Auth[🔐 OAuth2 + JWT]
        MW --> Bot[🤖 Chatbot IA]
        MW --> Palettes[🎨 Paletas]
    end

    subgraph "🔐 OAuth"
        Google[🔵 Google]
        GitHub[⚫ GitHub]
    end

    subgraph "🧠 IA"
        Gemini[🤖 Gemini AI]
    end

    subgraph "🗄️ Datos"
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

### **🔐 Autenticación**

| Método | Endpoint                | Descripción                |
| ------ | ----------------------- | -------------------------- |
| `POST` | `/auth/login`           | Login con email/password   |
| `POST` | `/auth/register`        | Registro de usuario        |
| `GET`  | `/auth/google`          | Iniciar OAuth Google       |
| `GET`  | `/auth/google/callback` | Callback OAuth Google      |
| `GET`  | `/auth/github`          | Iniciar OAuth GitHub       |
| `GET`  | `/auth/github/callback` | Callback OAuth GitHub      |
| `GET`  | `/auth/oauth/status`    | Estado configuración OAuth |

### **🤖 Chatbot IA**

| Método | Endpoint           | Descripción               |
| ------ | ------------------ | ------------------------- |
| `POST` | `/bot/:id`         | Enviar mensaje al chatbot |
| `GET`  | `/bot/:id/history` | Historial de conversación |

### **🎨 Paletas de Colores**

| Método   | Endpoint            | Descripción                |
| -------- | ------------------- | -------------------------- |
| `POST`   | `/generate-palette` | Generar paleta con IA      |
| `GET`    | `/palettes`         | Listar paletas del usuario |
| `POST`   | `/palettes`         | Crear paleta personalizada |
| `PUT`    | `/palettes/:id`     | Actualizar paleta          |
| `DELETE` | `/palettes/:id`     | Eliminar paleta            |

### **📊 Sistema**

| Método | Endpoint  | Descripción           |
| ------ | --------- | --------------------- |
| `GET`  | `/health` | Estado del servidor   |
| `GET`  | `/docs`   | Documentación Swagger |

---

## 🚀 **Inicio Rápido**

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/afor-branding-backend.git
cd afor-branding-backend

# 2. Instalar dependencias
bun install

# 3. Configurar variables de entorno
cp env.example .env
# Editar .env con tus credenciales

# 4. Levantar base de datos
docker-compose -f docker-compose.dev.yml up -d

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Iniciar servidor
bun run dev
```

🎉 **¡Listo!** Tu API estará disponible en `http://localhost:3000`

---

## 📞 **Soporte y Contribución**

### 🐛 **Reportar Issues**

Si encuentras algún problema, por favor [crea un issue](https://github.com/tu-usuario/afor-branding-backend/issues).

### 🤝 **Contribuir**

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con ❤️ usando Bun + Elysia + IA**

[![Bun](https://img.shields.io/badge/Built_with-Bun-000?style=flat-square&logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Powered_by-Elysia-blue?style=flat-square)](https://elysiajs.com/)
[![AI](https://img.shields.io/badge/Enhanced_with-AI-purple?style=flat-square)](https://ai.google.dev/)

</div>
