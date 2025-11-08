import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase, supabaseAdmin } from "./supabase";
import { requireAdmin } from "./middleware/auth";
import bcrypt from "bcryptjs";
import multer from "multer";
import { ZodError } from "zod";
import {
  insertCategorySchema,
  insertProductSchema,
  insertOrderSchema,
  insertCustomizationSchema,
  insertContactInquirySchema,
  insertBulkOrderSchema,
  insertUserActivitySchema,
  adminLoginSchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper to handle validation errors
function handleError(error: any, res: any) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Validation error", details: error.errors });
  }
  console.error("Server error:", error);
  res.status(500).json({ error: error.message || "Internal server error" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============ CATEGORIES ============
  
  // Get all categories (public)
  app.get("/api/categories", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Create category (admin only)
  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      
      const { data, error } = await supabaseAdmin
        .from("categories")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update category (admin only)
  app.put("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCategorySchema.partial().parse(req.body);

      const { data, error } = await supabaseAdmin
        .from("categories")
        .update(validatedData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Delete category (admin only)
  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ PRODUCTS ============
  
  // Get all products (public - returns only active products for non-admin)
  app.get("/api/products", async (req, res) => {
    try {
      const { category, all, gift_type } = req.query;
      const isAdmin = req.session?.adminId;
      
      let query = supabase
        .from("products")
        .select("*, categories(*)");

      // Only show active products to non-admin users
      if (!isAdmin || all !== 'true') {
        query = query.eq("active", true);
      }

      if (category) {
        query = query.eq("category_id", category);
      }

      // Filter by gift type if specified
      if (gift_type && gift_type !== 'null') {
        query = query.eq("gift_type", gift_type);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get single product (public)
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Create product (admin only)
  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from("products")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update product (admin only)
  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductSchema.partial().parse(req.body);

      const { data, error } = await supabaseAdmin
        .from("products")
        .update(validatedData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Delete product (admin only)
  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ ORDERS ============
  
  // Create order (public)
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);

      const { data, error } = await supabase
        .from("orders")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get all orders (admin only)
  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update order status (admin only)
  app.put("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const { data, error } = await supabaseAdmin
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ CUSTOMIZATIONS ============
  
  // Create customization (public)
  app.post("/api/customizations", async (req, res) => {
    try {
      const validatedData = insertCustomizationSchema.parse(req.body);

      const { data, error } = await supabase
        .from("customizations")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get all customizations (admin only)
  app.get("/api/customizations", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("customizations")
        .select("*, products(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ CONTACT & INQUIRIES ============
  
  // Submit contact form (public)
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactInquirySchema.parse(req.body);

      const { data, error } = await supabase
        .from("contact_inquiries")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get all contact inquiries (admin only)
  app.get("/api/contact", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ BULK ORDERS ============
  
  // Submit bulk order request (public)
  app.post("/api/bulk-orders", async (req, res) => {
    try {
      const validatedData = insertBulkOrderSchema.parse(req.body);

      const { data, error } = await supabase
        .from("bulk_orders")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get all bulk orders (admin only)
  app.get("/api/bulk-orders", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("bulk_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ USER ACTIVITY TRACKING ============
  
  // Log user activity (public)
  app.post("/api/activity", async (req, res) => {
    try {
      const validatedData = insertUserActivitySchema.parse(req.body);
      
      // Add IP and user agent from request
      const activityData = {
        ...validatedData,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      };

      const { data, error } = await supabase
        .from("user_activity")
        .insert(activityData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get user activity (admin only)
  app.get("/api/activity", requireAdmin, async (req, res) => {
    try {
      const { limit = 100 } = req.query;

      const { data, error } = await supabaseAdmin
        .from("user_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(Number(limit));

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ ADMIN AUTHENTICATION ============
  
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const validatedData = adminLoginSchema.parse(req.body);

      const { data: admin, error } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("email", validatedData.email)
        .single();

      if (error || !admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        admin.password_hash
      );

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      if (req.session) {
        req.session.adminId = admin.id;
        req.session.adminEmail = admin.email;
        req.session.adminName = admin.name;
        await new Promise<void>((resolve, reject) => {
          req.session!.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      res.json({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  // Check admin session
  app.get("/api/admin/session", (req, res) => {
    if (req.session?.adminId) {
      res.json({
        authenticated: true,
        adminId: req.session.adminId,
        adminEmail: req.session.adminEmail,
        adminName: req.session.adminName,
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // ============ ADMIN ANALYTICS ============
  
  // Get analytics data (admin only)
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      // Get counts using count queries
      const [productsResult, ordersResult, customizationsResult, contactResult, bulkOrdersResult] = await Promise.all([
        supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("customizations").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("contact_inquiries").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("bulk_orders").select("*", { count: "exact", head: true }),
      ]);

      // Get recent orders
      const { data: recentOrders } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Get revenue (sum of all orders)
      const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("total_amount");
      
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Get recent activity
      const { data: recentActivity } = await supabaseAdmin
        .from("user_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      res.json({
        counts: {
          products: productsResult.count || 0,
          orders: ordersResult.count || 0,
          customizations: customizationsResult.count || 0,
          contactInquiries: contactResult.count || 0,
          bulkOrders: bulkOrdersResult.count || 0,
        },
        totalRevenue,
        recentOrders: recentOrders || [],
        recentActivity: recentActivity || [],
      });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ FILE UPLOAD ============
  
  // Upload image to Supabase Storage (admin only)
  app.post("/api/upload", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { bucket = 'product-images' } = req.body;
      const fileName = `${Date.now()}-${req.file.originalname}`;
      
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path);

      res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Upload base64 image (admin only)
  app.post("/api/upload-base64", requireAdmin, async (req, res) => {
    try {
      const { file, bucket = 'product-images', fileName } = req.body;
      
      if (!file || !fileName) {
        return res.status(400).json({ error: "File and fileName required" });
      }

      // Convert base64 to buffer
      const base64Data = file.split(',')[1] || file;
      const buffer = Buffer.from(base64Data, 'base64');
      
      const uniqueFileName = `${Date.now()}-${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(uniqueFileName, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path);

      res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Upload customer design (public - for logged-in customers)
  app.post("/api/upload-customer-design", async (req, res) => {
    try {
      const { file, fileName } = req.body;
      
      if (!file || !fileName) {
        return res.status(400).json({ error: "File and fileName required" });
      }

      // Convert base64 to buffer
      const base64Data = file.split(',')[1] || file;
      const buffer = Buffer.from(base64Data, 'base64');
      
      const uniqueFileName = `${Date.now()}-${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from('customer-designs')
        .upload(uniqueFileName, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('customer-designs')
        .getPublicUrl(data.path);

      res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
