// src/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    MAILERLITE_API_KEY: z.string().min(1),
    MAILERLITE_API_BASE: z.url().default("https://connect.mailerlite.com/api"),
  },
  client: {
    // tu nic wrażliwego
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    MAILERLITE_API_KEY: process.env.MAILERLITE_API_KEY,
    MAILERLITE_API_BASE: process.env.MAILERLITE_API_BASE,
  },
});
