import { PrismaClient } from "@/generated/prisma";
import { AddFavoritePaletteUseCase } from "./application/use-cases/add-favorite-palette.use-case";
import { CreateGeneratedPaletteUseCase } from "./application/use-cases/create-generated-palette.use-case";
import { GetPalettesUseCase } from "./application/use-cases/get-palletes.use-case";
import { GetUserFavoritePalettesUseCase } from "./application/use-cases/get-user-favorite-palettes.use-case";
import { RemoveFavoritePaletteUseCase } from "./application/use-cases/remove-favorite-palette.use-case";
import { palettesController } from "./infrastructure/controllers/palettes.controller";
import { PrismaFavoritePaletteRepository } from "./infrastructure/repositories/prisma-favorite-palette.repository";
import { PrismaGeneratedPaletteRepository } from "./infrastructure/repositories/prisma-generated-palette.repository";

interface PalettesModuleDependencies {
  prisma: PrismaClient;
}

export const palettesModule = (deps: PalettesModuleDependencies) => {
  const { prisma } = deps;

  // Infrastructure
  const generatedPaletteRepository = new PrismaGeneratedPaletteRepository(
    prisma
  );
  const favoritePaletteRepository = new PrismaFavoritePaletteRepository(prisma);

  // Application Use Cases
  const createGeneratedPaletteUseCase = new CreateGeneratedPaletteUseCase(
    generatedPaletteRepository
  );
  const addFavoritePaletteUseCase = new AddFavoritePaletteUseCase(
    favoritePaletteRepository,
    generatedPaletteRepository
  );
  const getUserFavoritePalettesUseCase = new GetUserFavoritePalettesUseCase(
    favoritePaletteRepository
  );
  const removeFavoritePaletteUseCase = new RemoveFavoritePaletteUseCase(
    favoritePaletteRepository
  );
  const getPalettesUseCase = new GetPalettesUseCase(generatedPaletteRepository);

  // Controller
  return palettesController({
    createGeneratedPaletteUseCase,
    addFavoritePaletteUseCase,
    getUserFavoritePalettesUseCase,
    removeFavoritePaletteUseCase,
    getPalettesUseCase,
  });
};
