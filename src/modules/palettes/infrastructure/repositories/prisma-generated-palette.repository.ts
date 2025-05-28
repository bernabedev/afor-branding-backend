import type {
  Prisma,
  PrismaClient,
  GeneratedPalette as PrismaGeneratedPalette,
} from "@/generated/prisma";
import type { PaletteColor } from "@/modules/chatbot/domain/palette.entity";
import type { IGeneratedPaletteRepository } from "../../application/ports/generated-palette.repository";
import type {
  GeneratedPalette,
  GeneratedPaletteCreationData,
} from "../../domain/generated-palette.entity";

export class PrismaGeneratedPaletteRepository
  implements IGeneratedPaletteRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(prismaPalette: PrismaGeneratedPalette): GeneratedPalette {
    return {
      id: prismaPalette.id,
      userId: prismaPalette.userId,
      name: prismaPalette.name,
      colors: prismaPalette.colors as unknown as PaletteColor[],
      createdAt: prismaPalette.createdAt,
    };
  }
  async findAll({ userId }: { userId?: string }): Promise<GeneratedPalette[]> {
    const prismaPalettes = await this.prisma.generatedPalette.findMany({
      where: {
        userId,
      },
    });
    return prismaPalettes.map(this.mapToDomain);
  }

  async create(data: GeneratedPaletteCreationData): Promise<GeneratedPalette> {
    const prismaPalette = await this.prisma.generatedPalette.create({
      data: {
        userId: data.userId,
        name: data.name,
        colors: data.colors as unknown as Prisma.JsonArray,
      },
    });
    return this.mapToDomain(prismaPalette);
  }

  async findById(id: string): Promise<GeneratedPalette | null> {
    const prismaPalette = await this.prisma.generatedPalette.findUnique({
      where: { id },
    });
    return prismaPalette ? this.mapToDomain(prismaPalette) : null;
  }
}
