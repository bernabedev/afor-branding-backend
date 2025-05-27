import type {
  UserCreationData,
  UserProfile,
} from "@/modules/auth/domain/user.entity";
import type { IPasswordHasher } from "../ports/password-hasher";
import type { IUserRepository } from "../ports/user.repository";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(data: UserCreationData): Promise<UserProfile> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await this.passwordHasher.hash(data.passwordRaw);

    const newUser = await this.userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    const { passwordHash: _, ...profile } = newUser;
    return profile;
  }
}
