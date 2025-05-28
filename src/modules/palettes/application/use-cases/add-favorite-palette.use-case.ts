import type { FavoritePalette } from "../../domain/favorite-palette.entity";
import type { IFavoritePaletteRepository } from "../ports/favorite-palette.repository";
import type { IGeneratedPaletteRepository } from "../ports/generated-palette.repository";

interface AddFavoritePaletteInput {
  userId: string;
  generatedPaletteId: string;
  customName?: string;
}

export class AddFavoritePaletteUseCase {
  constructor(
    private readonly favoritePaletteRepository: IFavoritePaletteRepository,
    private readonly generatedPaletteRepository: IGeneratedPaletteRepository
  ) {}

  async execute(input: AddFavoritePaletteInput): Promise<FavoritePalette> {
    const existingGeneratedPalette =
      await this.generatedPaletteRepository.findById(input.generatedPaletteId);
    if (!existingGeneratedPalette) {
      throw new Error(
        `Generated palette with ID ${input.generatedPaletteId} not found.`
      );
    }

    const existingFavorite =
      await this.favoritePaletteRepository.findUserFavoriteByPaletteId(
        input.userId,
        input.generatedPaletteId
      );
    if (existingFavorite) {
      return existingFavorite;
    }

    return this.favoritePaletteRepository.create({
      userId: input.userId,
      paletteId: input.generatedPaletteId,
      name: input.customName,
    });
  }
}
