import type { IFavoritePaletteRepository } from "../ports/favorite-palette.repository";

interface RemoveFavoritePaletteInput {
  userId: string;
  generatedPaletteId: string;
}

export class RemoveFavoritePaletteUseCase {
  constructor(
    private readonly favoritePaletteRepository: IFavoritePaletteRepository
  ) {}

  async execute(input: RemoveFavoritePaletteInput): Promise<boolean> {
    const favoriteToRemove =
      await this.favoritePaletteRepository.findUserFavoriteByPaletteId(
        input.userId,
        input.generatedPaletteId
      );

    if (!favoriteToRemove) {
      throw new Error(
        "Favorite palette not found or does not belong to the user."
      );
    }

    return this.favoritePaletteRepository.delete(
      favoriteToRemove.id,
      input.userId
    );
  }
}
