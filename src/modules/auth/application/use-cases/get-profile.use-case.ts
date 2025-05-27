import type { UserProfile } from "../../domain/user.entity";
import type { IUserRepository } from "../ports/user.repository";

export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserProfile | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    const { passwordHash: _, ...profile } = user;
    return profile;
  }
}
