import { AddFavoritePaletteUseCase } from "@/modules/palettes/application/use-cases/add-favorite-palette.use-case";
import { CreateGeneratedPaletteUseCase } from "@/modules/palettes/application/use-cases/create-generated-palette.use-case";
import { GetPalettesUseCase } from "@/modules/palettes/application/use-cases/get-palletes.use-case";
import { GetUserFavoritePalettesUseCase } from "@/modules/palettes/application/use-cases/get-user-favorite-palettes.use-case";
import { RemoveFavoritePaletteUseCase } from "@/modules/palettes/application/use-cases/remove-favorite-palette.use-case";
import { Elysia, t } from "elysia";

const addFavoritePaletteBodySchema = t.Object({
  generatedPaletteId: t.String({ format: "uuid" }),
  customName: t.Optional(t.String()),
});

interface PalettesControllerDependencies {
  createGeneratedPaletteUseCase: CreateGeneratedPaletteUseCase;
  addFavoritePaletteUseCase: AddFavoritePaletteUseCase;
  getUserFavoritePalettesUseCase: GetUserFavoritePalettesUseCase;
  removeFavoritePaletteUseCase: RemoveFavoritePaletteUseCase;
  getPalettesUseCase: GetPalettesUseCase;
}

export const palettesController = (deps: PalettesControllerDependencies) => {
  const {
    addFavoritePaletteUseCase,
    getUserFavoritePalettesUseCase,
    removeFavoritePaletteUseCase,
    getPalettesUseCase,
  } = deps;

  return new Elysia({ prefix: "/palettes" })
    .get(
      "/",
      ({ userAuth }) => {
        const userId = userAuth?.sub;
        return getPalettesUseCase.execute({
          userId,
        });
      },
      {
        detail: {
          tags: ["Palettes"],
          summary: "Get All Palettes",
          security: [{ cookieAuth: [] }],
        },
      }
    )
    .onBeforeHandle(({ userAuth, status, request }) => {
      if (request.method !== "GET" && !userAuth) {
        return status(401, { error: "Unauthorized" });
      }

      if (
        request.url.endsWith("/favorites") &&
        request.method === "GET" &&
        !userAuth
      ) {
        return status(401, { error: "Unauthorized" });
      }
    })
    .post(
      "/favorites",
      async ({ body, userAuth, status, set }) => {
        if (!userAuth) {
          return status(401, { error: "Unauthorized" });
        }
        try {
          const favoritePalette = await addFavoritePaletteUseCase.execute({
            userId: userAuth.sub,
            generatedPaletteId: body.generatedPaletteId,
            customName: body.customName,
          });
          set.status = 201;
          return favoritePalette;
        } catch (error: any) {
          console.error("Add favorite error:", error);
          if (error.message.includes("not found")) set.status = 404;
          else if (error.message.includes("already in your favorites"))
            set.status = 409;
          else set.status = 400;
          return { error: error.message || "Failed to add favorite palette" };
        }
      },
      {
        body: addFavoritePaletteBodySchema,
        detail: {
          tags: ["Palettes"],
          summary: "Add a generated palette to favorites",
          security: [{ cookieAuth: [] }],
        },
      }
    )

    .get(
      "/favorites",
      async ({ userAuth, status }) => {
        if (!userAuth) {
          return status(401, { error: "Unauthorized" });
        }
        try {
          const palettes = await getUserFavoritePalettesUseCase.execute({
            userId: userAuth.sub,
          });
          return palettes;
        } catch (error: any) {
          console.error("Get favorites error:", error);
          return status(500, {
            error: "Failed to retrieve favorite palettes",
          });
        }
      },
      {
        detail: {
          tags: ["Palettes"],
          summary: "Get all favorite palettes for the current user",
          security: [{ cookieAuth: [] }],
        },
      }
    )

    .delete(
      "/favorites/:generatedPaletteId",
      async ({ params, userAuth, status }) => {
        if (!userAuth) {
          return status(401, { error: "Unauthorized" });
        }
        try {
          const success = await removeFavoritePaletteUseCase.execute({
            userId: userAuth.sub,
            generatedPaletteId: params.generatedPaletteId,
          });
          if (success) {
            return status(204);
          } else {
            return status(404, {
              error: "Favorite not found or could not be removed.",
            });
          }
        } catch (error: any) {
          console.error("Remove favorite error:", error);
          if (error.message.includes("not found")) return status(404);
          else return status(400);
        }
      },
      {
        params: t.Object({
          generatedPaletteId: t.String({ format: "uuid" }),
        }),
        detail: {
          tags: ["Palettes"],
          summary: "Remove a generated palette from favorites",
          security: [{ cookieAuth: [] }],
        },
      }
    );
};
