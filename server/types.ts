import 'express-session';

declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    adminEmail?: string;
    adminName?: string;
    userId?: string; // For Firebase users with admin role
  }
}
