import { html, Html } from "@elysiajs/html";
import Elysia from "elysia";
export const docsRoutes = new Elysia().use(html()).get("/docs", () => (
  <html>
    <head>
      <title>HamBot API Docs</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
      <script
        id="api-reference"
        type="application/json"
        data-url="/swagger/json"
      ></script>
      <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    </body>
  </html>
));
