"use client";

import { createAuthClient } from "better-auth/react";

// Use the current site at runtime instead of allowing the browser bundle to
// infer a base URL from deployment environment variables.
export const authClient = createAuthClient({
  baseURL: typeof window === "undefined" ? "http://localhost:3000" : window.location.origin,
});
