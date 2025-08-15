// src/server/mailerLite.ts
import "server-only";

import ky from "ky";
import { env } from "@/env";

export const ml = ky.create({
  prefixUrl: env.MAILERLITE_API_BASE,
  hooks: {
    beforeRequest: [
      (req) => {
        req.headers.set("Authorization", `Bearer ${env.MAILERLITE_API_KEY}`);
        req.headers.set("Content-Type", "application/json");
        req.headers.set("Accept", "application/json");
      },
    ],
  },
  retry: { limit: 2, methods: ["get", "post", "put", "patch"] },
  timeout: 15_000,
});
