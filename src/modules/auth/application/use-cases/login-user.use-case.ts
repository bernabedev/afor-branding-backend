import type { JwtAuthPayload } from "@/modules/auth/domain/jwt-payload.interface";
import type { User } from "@/modules/auth/domain/user.entity";
import type { IPasswordHasher } from "../ports/password-hasher";
import type { ITokenService } from "../ports/token.service";
import type { IUserRepository } from "../ports/user.repository";

interface LoginCredentials {
  email: string;
  passwordRaw: string;
}

interface LoginResult {
  token: string;
  user: Omit<User, "passwordHash">;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await this.passwordHasher.compare(
      credentials.passwordRaw,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const payload: JwtAuthPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await this.tokenService.sign(payload);

    const { passwordHash: _, ...userProfile } = user;
    return { token, user: userProfile };
  }
}
