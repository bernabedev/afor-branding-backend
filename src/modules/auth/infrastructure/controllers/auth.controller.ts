import { JWT_SECRET } from "@/helpers/constants";
import { Elysia, t } from "elysia";
import type { ITokenService } from "../../application/ports/token.service";
import type { GetProfileUseCase } from "../../application/use-cases/get-profile.use-case";
import type { LoginUserUseCase } from "../../application/use-cases/login-user.use-case";
import type { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { authPlugin } from "../plugins/auth.plugin";

const registerBodySchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  name: t.Optional(t.String()),
});

const loginBodySchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

interface AuthControllerDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  getProfileUseCase: GetProfileUseCase;
  tokenServiceForVerification: ITokenService;
}

export const authController = (deps: AuthControllerDependencies) => {
  const {
    registerUserUseCase,
    loginUserUseCase,
    getProfileUseCase,
    tokenServiceForVerification,
  } = deps;

  return new Elysia({ prefix: "/auth" })
    .use(authPlugin(JWT_SECRET))
    .post(
      "/register",
      async ({ body, set }) => {
        try {
          const userProfile = await registerUserUseCase.execute({
            email: body.email,
            passwordRaw: body.password,
            name: body.name,
          });
          set.status = 201;
          return { message: "User registered successfully", user: userProfile };
        } catch (error: any) {
          set.status = 400;
          return { error: error.message || "Registration failed" };
        }
      },
      {
        body: registerBodySchema,
        detail: { tags: ["Auth"], summary: "Register" },
      }
    )

    .post(
      "/login",
      async ({ body, cookie, set }) => {
        try {
          const { token, user } = await loginUserUseCase.execute({
            email: body.email,
            passwordRaw: body.password,
          });

          cookie.auth.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 86400, // 7 days
            path: "/",
          });

          return { message: "Login successful", user };
        } catch (error: any) {
          set.status = 401;
          return { error: error.message || "Login failed" };
        }
      },
      { body: loginBodySchema, detail: { tags: ["Auth"], summary: "Login" } }
    )
    .get(
      "/me",
      async ({ userAuth, status }) => {
        console.log({ userAuth });
        if (!userAuth) {
          return status(401, { error: "Unauthorized" });
        }
        try {
          const profile = await getProfileUseCase.execute(userAuth.sub);
          if (!profile) {
            return status(404, { error: "Profile not found" });
          }
          return profile;
        } catch (error: any) {
          return status(500, { error: "Failed to retrieve profile" });
        }
      },
      {
        detail: {
          tags: ["Auth"],
          summary: "Get current user",
        },
      }
    )
    .post(
      "/logout",
      ({ cookie, status }) => {
        cookie.auth.remove();
        return status(200, { message: "Logged out successfully" });
      },
      {
        detail: {
          tags: ["Auth"],
          summary: "Logout",
        },
      }
    );
};
