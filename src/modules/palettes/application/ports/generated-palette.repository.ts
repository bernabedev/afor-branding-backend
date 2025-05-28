import type {
  GeneratedPalette,
  GeneratedPaletteCreationData,
} from "../../domain/generated-palette.entity";

export interface IGeneratedPaletteRepository {
  create(data: GeneratedPaletteCreationData): Promise<GeneratedPalette>;
  findById(id: string): Promise<GeneratedPalette | null>;
  findAll({ userId }: { userId?: string }): Promise<GeneratedPalette[]>;
}
