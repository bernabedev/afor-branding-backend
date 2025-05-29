import type { PaletteColor } from "@/modules/chatbot/domain/palette.entity";
import type { GeneratedPalette } from "../../domain/generated-palette.entity";
import type { IGeneratedPaletteRepository } from "../ports/generated-palette.repository";

interface CreateGeneratedPaletteInput {
  userId?: string | null;
  name?: string;
  description?: string;
  colors: PaletteColor[];
}

export class CreateGeneratedPaletteUseCase {
  constructor(
    private readonly generatedPaletteRepository: IGeneratedPaletteRepository
  ) {}

  async execute(input: CreateGeneratedPaletteInput): Promise<GeneratedPalette> {
    if (!input.colors || input.colors.length === 0) {
      throw new Error("Palette colors cannot be empty.");
    }

    return this.generatedPaletteRepository.create({
      userId: input.userId,
      name: input.name,
      description: input.description,
      colors: input.colors,
    });
  }
}
