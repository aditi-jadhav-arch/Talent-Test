import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: number;
    role: "admin" | "candidate";
    name: string;
    email?: string;
  }
}
