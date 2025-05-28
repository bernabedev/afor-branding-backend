import { GeneratedPalette as PrismaGeneratedPalette } from "@/generated/prisma";
import { PaginatedResult } from "@/helpers/paginate";
import type {
  GeneratedPalette,
  GeneratedPaletteCreationData,
} from "../../domain/generated-palette.entity";

export interface IGeneratedPaletteRepository {
  create(data: GeneratedPaletteCreationData): Promise<GeneratedPalette>;
  findById(id: string): Promise<GeneratedPalette | null>;
  findAll({
    userId,
  }: {
    userId?: string;
  }): Promise<PaginatedResult<PrismaGeneratedPalette>>;
}
