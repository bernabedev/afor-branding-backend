import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";
import { BunPasswordHasher } from "./infrastructure/services/bun-password-hasher";
import { ElysiaJwtTokenService } from "./infrastructure/services/elysia-jwt.service";

import { GetProfileUseCase } from "./application/use-cases/get-profile.use-case";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";

import { PrismaClient } from "@/generated/prisma";
import { JwtSignerVerifier } from "./domain/jwt-payload.interface";
import { authController } from "./infrastructure/controllers/auth.controller";

interface AuthModuleDependencies {
  prisma: PrismaClient;
  jwtInstance: JwtSignerVerifier;
}

export const authModule = (deps: AuthModuleDependencies) => {
  const { prisma, jwtInstance } = deps;

  // Infrastructure
  const userRepository = new PrismaUserRepository(prisma);
  const passwordHasher = new BunPasswordHasher();
  const tokenService = new ElysiaJwtTokenService(jwtInstance);

  // Application Use Cases
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher
  );
  const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService
  );
  const getProfileUseCase = new GetProfileUseCase(userRepository);

  // Controller (Elysia Routes)
  return authController({
    registerUserUseCase,
    loginUserUseCase,
    getProfileUseCase,
    tokenServiceForVerification: tokenService,
  });
};
