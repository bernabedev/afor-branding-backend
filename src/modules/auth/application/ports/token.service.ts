import type { JwtAuthPayload } from "@/modules/auth/domain/jwt-payload.interface";

export interface ITokenService {
  sign(payload: JwtAuthPayload): Promise<string>;
  verify(token: string): Promise<JwtAuthPayload | null>;
}
