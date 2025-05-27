import type { IPasswordHasher } from "../../application/ports/password-hasher";

export class BunPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return Bun.password.hash(password, { algorithm: "bcrypt" });
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return Bun.password.verify(plain, hashed);
  }
}
