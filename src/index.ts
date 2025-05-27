import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { Logestic } from "logestic";

import { PrismaClient } from "./generated/prisma";
import { ALLOWED_ORIGINS, JWT_SECRET, PORT } from "./helpers/constants";
import { authModule } from "./modules/auth/auth.module";
import { JwtSignerVerifier } from "./modules/auth/domain/jwt-payload.interface";
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
  .use(rateLimit())
  .use(
    cors({
      origin: ALLOWED_ORIGINS?.split(",") || [],
      credentials: true,
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
    })
  )
  .decorate("prisma", prisma)
  .use(cookie())
  .use(
    jwt({
      name: "jwtAuth",
      secret: JWT_SECRET,
    })
  )
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
  })
  .onError(({ code, error, set }) => {
    console.error(`Error: ${code} - ${error.stack || error.message}`);
    if (code === "VALIDATION") {
      set.status = 400;
      return { message: "Validation Error", errors: error.all };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { message: "Resource not found" };
    }
    set.status = 500;
    return { message: "Internal Server Error" };
  });

const authRoutes = authModule({
  prisma,
  jwtInstance: (app.decorator as { jwtAuth: JwtSignerVerifier }).jwtAuth,
});
app.use(authRoutes);

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
