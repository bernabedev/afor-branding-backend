import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { Logestic } from "logestic";

import { PrismaClient } from "./generated/prisma";
import { ALLOWED_ORIGINS, JWT_SECRET, PORT } from "./helpers/constants";
import { authModule } from "./modules/auth/auth.module";
import { oauthModule } from "./modules/auth/oauth.module";
import { JwtSignerVerifier } from "./modules/auth/domain/jwt-payload.interface";
import { authPlugin } from "./modules/auth/infrastructure/plugins/auth.plugin";
import { chatbotModule } from "./modules/chatbot/chatbot.module";
import { docsRoutes } from "./modules/docs";
import { palettesModule } from "./modules/palettes/palettes.module";
import { generateContentChatBot, generatePalette } from "./services/gemini";

if (!JWT_SECRET || JWT_SECRET === "afor") {
  console.warn(
    "WARNING: Using default or weak JWT secret. Please set a strong JWT_SECRET environment variable."
  );
}

const prisma = new PrismaClient();

const app = new Elysia();

app
  .use(Logestic.preset("fancy"))
  .use(
    rateLimit({
      max: 100,
      duration: 60 * 10 * 1000, // 10 minutes
    })
  )
  .use(
    cors({
      origin: ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Afor API",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            cookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: "auth",
            },
          },
        },
        security: [
          {
            cookieAuth: [],
          },
        ],
      },
      exclude: ["/docs", "/health", "/"],
    })
  )
  .decorate("prisma", prisma)
  .use(authPlugin(JWT_SECRET))
  .onStart(async () => {
    try {
      await prisma.$connect();
      console.log("🔌 Connected to the database");
    } catch (error) {
      console.error("❌ Failed to connect to the database", error);
    }
  })
  .onStop(async () => {
    await prisma.$disconnect();
    console.log("🚪 Disconnected from the database");
  });

const authRoutes = authModule({
  prisma,
  jwtInstance: (app.decorator as { jwtAuth: JwtSignerVerifier }).jwtAuth,
});
app.use(authRoutes);

const oauthRoutes = oauthModule({
  prisma,
  jwtInstance: (app.decorator as { jwtAuth: JwtSignerVerifier }).jwtAuth,
});
app.use(oauthRoutes);

const chatbotRoutes = chatbotModule({ prisma });
app.use(chatbotRoutes);

const palettesRoutes = palettesModule({ prisma });
app.use(palettesRoutes);

app.use(docsRoutes);

app.post(
  "/generate-palette",
  async ({ set, body }) => {
    const { value } = body;
    const palette = await generatePalette(value);
    set.status = palette ? 200 : 400;
    return {
      palette,
      message: palette
        ? "Palette generated successfully"
        : "Unable to generate palette",
    };
  },
  {
    body: t.Object({
      value: t.String(),
    }),
    detail: {
      summary: "Generate a palette",
      description:
        "Generate a palette based on a description. This endpoint is public.",
      responses: {
        200: {
          description: "Palette generated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  palette: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        value: { type: "integer" },
                        name: { type: "string" },
                        color: { type: "string" },
                      },
                    },
                  },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        400: {
          description: "Unable to generate palette",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  }
);

app.post(
  "/bot/:id",
  async ({ set, body, params }) => {
    const { id } = params;
    const { value } = body;
    const response = await generateContentChatBot(id, value);
    set.status = response ? 200 : 400;
    let type = "text";
    if (Array.isArray(response)) {
      if (response[0] instanceof Object && "key" in response[0]) {
        type = "fonts";
      } else {
        type = "palette";
      }
    }
    return {
      response,
      type,
      message: response
        ? "Response generated successfully"
        : "Unable to generate response",
    };
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      value: t.String(),
    }),
    detail: {
      summary: "Interact with Chatbot",
      description:
        "Send a message to a specific chatbot instance. This endpoint is public.",
    },
  }
);

app.get(
  "/health",
  () => {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
    };
  },
  {
    detail: {
      summary: "Health check",
      description: "Check if the server is running.",
    },
  }
);

app.get(
  "/",
  () => {
    return {
      message: "Welcome to the Afor API",
      version: "1.0.0",
    };
  },
  {
    detail: {
      summary: "Root endpoint",
      description: "Welcome message.",
    },
  }
);

app.listen(PORT || 3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
