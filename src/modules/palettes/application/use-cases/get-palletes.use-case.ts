import { IGeneratedPaletteRepository } from "../ports/generated-palette.repository";

export class GetPalettesUseCase {
  constructor(
    private readonly paletteRepository: IGeneratedPaletteRepository
  ) {}

  execute({ userId }: { userId?: string }) {
    return this.paletteRepository.findAll({ userId });
  }
}
