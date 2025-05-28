import { PaginatedResult } from "@/helpers/paginate";
import type { FavoritePalette } from "../../domain/favorite-palette.entity";
import type { IFavoritePaletteRepository } from "../ports/favorite-palette.repository";

interface GetUserFavoritePalettesInput {
  userId: string;
}

export class GetUserFavoritePalettesUseCase {
  constructor(
    private readonly favoritePaletteRepository: IFavoritePaletteRepository
  ) {}

  async execute(
    input: GetUserFavoritePalettesInput
  ): Promise<PaginatedResult<FavoritePalette>> {
    return this.favoritePaletteRepository.findByUserId(input.userId);
  }
}
