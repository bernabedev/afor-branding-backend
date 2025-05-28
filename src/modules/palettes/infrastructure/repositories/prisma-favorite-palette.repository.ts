import type {
  PrismaClient,
  FavoritePalette as PrismaFavoritePalette,
  GeneratedPalette as PrismaGeneratedPalette,
} from "@/generated/prisma";
import { paginate, PaginatedResult } from "@/helpers/paginate";
import type { PaletteColor } from "@/modules/chatbot/domain/palette.entity";
import type { IFavoritePaletteRepository } from "../../application/ports/favorite-palette.repository";
import type {
  FavoritePalette,
  FavoritePaletteCreationData,
} from "../../domain/favorite-palette.entity";
import type { GeneratedPalette } from "../../domain/generated-palette.entity";

export class PrismaFavoritePaletteRepository
  implements IFavoritePaletteRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  private mapGeneratedToDomain(
    prismaPalette: PrismaGeneratedPalette
  ): GeneratedPalette {
    return {
      id: prismaPalette.id,
      userId: prismaPalette.userId,
      name: prismaPalette.name,
      colors: prismaPalette.colors as unknown as PaletteColor[],
      createdAt: prismaPalette.createdAt,
    };
  }

  private mapToDomain(
    prismaFavorite: PrismaFavoritePalette & { palette?: PrismaGeneratedPalette }
  ): FavoritePalette {
    return {
      id: prismaFavorite.id,
      userId: prismaFavorite.userId,
      paletteId: prismaFavorite.paletteId,
      name: prismaFavorite.name,
      createdAt: prismaFavorite.createdAt,
      palette: prismaFavorite.palette
        ? this.mapGeneratedToDomain(prismaFavorite.palette)
        : undefined,
    };
  }

  async create(data: FavoritePaletteCreationData): Promise<FavoritePalette> {
    const generatedPaletteExists =
      await this.prisma.generatedPalette.findUnique({
        where: { id: data.paletteId },
      });
    if (!generatedPaletteExists) {
      throw new Error(`GeneratedPalette with ID ${data.paletteId} not found.`);
    }

    const prismaFavorite = await this.prisma.favoritePalette.create({
      data: {
        userId: data.userId,
        paletteId: data.paletteId,
        name: data.name,
      },
      include: {
        palette: true,
      },
    });
    return this.mapToDomain(prismaFavorite);
  }

  async findByUserId(
    userId: string
  ): Promise<PaginatedResult<FavoritePalette>> {
    return paginate(this.prisma.favoritePalette, {
      where: { userId },
      include: {
        palette: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findUserFavoriteByPaletteId(
    userId: string,
    paletteId: string
  ): Promise<FavoritePalette | null> {
    const prismaFavorite = await this.prisma.favoritePalette.findUnique({
      where: { userId_paletteId: { userId, paletteId } },
      include: { palette: true },
    });
    return prismaFavorite ? this.mapToDomain(prismaFavorite) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.favoritePalette.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }

  async deleteByPaletteId(userId: string, paletteId: string): Promise<boolean> {
    const result = await this.prisma.favoritePalette.delete({
      where: { userId_paletteId: { userId, paletteId } },
    });
    return !!result;
  }
}
