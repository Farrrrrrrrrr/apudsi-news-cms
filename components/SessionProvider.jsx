"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// Export both as named export and default export
export function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}

// Default export for flexibility in importing
export default SessionProvider;
