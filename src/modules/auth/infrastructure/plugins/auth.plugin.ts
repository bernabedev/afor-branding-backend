import { JwtAuthPayload } from "@/modules/auth/domain/jwt-payload.interface";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

export const authPlugin = (jwtSecret: string) =>
  new Elysia({ name: "auth" })
    .use(cookie())
    .use(
      jwt({
        name: "jwtAuth",
        secret: jwtSecret,
      })
    )
    .derive({ as: "global" }, async ({ cookie, jwtAuth }) => {
      if (!cookie.auth || !cookie.auth.value) {
        return { userAuth: null as JwtAuthPayload | null };
      }
      try {
        const payload = await jwtAuth.verify(cookie.auth.value);
        if (!payload) {
          cookie.auth.remove();
          return { userAuth: null as JwtAuthPayload | null };
        }
        return { userAuth: payload as unknown as JwtAuthPayload };
      } catch (e) {
        console.error("Error verifying token in derive:", e);
        cookie.auth.remove();
        return { userAuth: null as JwtAuthPayload | null };
      }
    });
