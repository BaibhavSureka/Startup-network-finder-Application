"use client"; // Mark this as a Client Component

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function SessionWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
