import type { UserProfile } from "@/types/ecommerce";

export type Session =
  | { role: "user"; userId: string }
  | { role: "admin"; userId: string };

export interface AuthState {
  /** False on the server and until client auth hydration completes. */
  ready: boolean;
  session: Session | null;
  profile: UserProfile | null;
}
