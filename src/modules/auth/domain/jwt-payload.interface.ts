export interface JwtAuthPayload {
  sub: string;
  email: string;
  name?: string | null;
}

export type JwtSignerVerifier = {
  sign: (payload: JwtAuthPayload) => Promise<string>;
  verify: (token?: string) => Promise<JwtAuthPayload | false>;
};
