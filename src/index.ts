import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { ALLOWED_ORIGINS, PORT } from "./helpers/constants";
import { generatePalette } from "./services/gemini";

const app = new Elysia();
app.use(rateLimit());
app.use(
  cors({
    origin: ALLOWED_ORIGINS?.split(",") || [],
  })
);
app.use(
  swagger({
    documentation: {
      info: {
        title: "Afor API",
        version: "1.0.0",
      },
    },
  })
);
// app.use(Logestic.preset("fancy"));

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
      description: "Generate a palette based on a description",
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
                        value: {
                          type: "integer",
                        },
                        name: {
                          type: "string",
                        },
                        color: {
                          type: "string",
                        },
                      },
                    },
                  },
                  message: {
                    type: "string",
                  },
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
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
  }
);

app.get("/health", () => {
  return {
    health: "OK",
  };
});

app.get("/", () => {
  return {
    message: "Welcome to the Afor API",
  };
});

app.listen(PORT || 3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
