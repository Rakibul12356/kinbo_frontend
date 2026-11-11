export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

export type Session =
  | { role: "user"; userId: string }
  | { role: "admin"; userId: string };

export interface AuthState {
  /** False on the server and during hydration; guards must wait for it. */
  ready: boolean;
  session: Session | null;
}
