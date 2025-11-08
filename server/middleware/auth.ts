import type { Request, Response, NextFunction } from "express";

// Middleware to check if user is authenticated as admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.adminId) {
    return res.status(401).json({ error: "Unauthorized - Admin access required" });
  }
  next();
}
