export interface User {
  id: string;
  email: string;
  name?: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationData = Omit<
  User,
  "id" | "createdAt" | "updatedAt" | "passwordHash"
> & {
  passwordRaw: string;
};

export type UserProfile = Omit<User, "passwordHash">;
