import type {
  FavoritePalette,
  FavoritePaletteCreationData,
} from "../../domain/favorite-palette.entity";

export interface IFavoritePaletteRepository {
  create(data: FavoritePaletteCreationData): Promise<FavoritePalette>;
  findByUserId(userId: string): Promise<FavoritePalette[]>; // Devolverá FavoritePalette con GeneratedPalette incluida
  findUserFavoriteByPaletteId(
    userId: string,
    paletteId: string
  ): Promise<FavoritePalette | null>;
  delete(id: string, userId: string): Promise<boolean>; // Para quitar de favoritos
}
