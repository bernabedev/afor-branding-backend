import type { ITokenService } from "../../application/ports/token.service";
import type {
  JwtAuthPayload,
  JwtSignerVerifier,
} from "../../domain/jwt-payload.interface";

export class ElysiaJwtTokenService implements ITokenService {
  constructor(private readonly jwtInstance: JwtSignerVerifier) {}

  async sign(payload: JwtAuthPayload): Promise<string> {
    return this.jwtInstance.sign(payload);
  }

  async verify(token: string): Promise<JwtAuthPayload | null> {
    try {
      const verifiedPayload = await this.jwtInstance.verify(token);
      if (
        !verifiedPayload ||
        typeof verifiedPayload.sub !== "string" ||
        typeof verifiedPayload.email !== "string"
      ) {
        return null;
      }
      return verifiedPayload as JwtAuthPayload;
    } catch (error) {
      return null;
    }
  }
}
