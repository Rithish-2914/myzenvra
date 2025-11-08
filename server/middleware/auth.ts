import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../supabase";

// Middleware to check if user is authenticated as admin
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if admin is authenticated via session
    const adminId = req.session?.adminId;
    const userId = req.session?.userId;

    // First check: Legacy admin_users table (for backwards compatibility)
    if (adminId) {
      return next();
    }

    // Second check: New users table with role-based access
    if (userId) {
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (!error && user && user.role === 'admin') {
        return next();
      }
    }

    // If neither check passed, deny access
    return res.status(401).json({ error: "Unauthorized - Admin access required" });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized - Admin access required" });
  }
}
