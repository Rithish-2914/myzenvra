import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { supabase, supabaseAdmin } from "./supabase";
import { requireAdmin } from "./middleware/auth";
import { verifyFirebaseToken, initializeFirebaseAdmin } from "./firebase-admin";
import bcrypt from "bcryptjs";
import multer from "multer";
import { ZodError } from "zod";
import {
  insertCategorySchema,
  insertProductSchema,
  updateProductSchema,
  insertOrderSchema,
  insertContactInquirySchema,
  insertBulkOrderSchema,
  insertUserActivitySchema,
  adminLoginSchema,
  insertCartItemSchema,
  insertWishlistItemSchema,
  insertProductReviewSchema,
  insertOrderEventSchema,
  insertCustomerMessageSchema,
  insertUserSchema,
  updateUserRoleSchema,
  insertAnnouncementSchema,
  insertCustomPrintOrderSchema,
  insertCategoryProductSchema,
  insertProductCustomizationSchema,
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
  
  // Initialize Firebase Admin for token verification
  initializeFirebaseAdmin();
  
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

  // Get related products (public)
  app.get("/api/products/:id/related", async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 4;

      const { data: currentProduct } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!currentProduct) {
        return res.json([]);
      }

      const { data: allProducts } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("active", true)
        .neq("id", id);

      if (!allProducts || allProducts.length === 0) {
        return res.json([]);
      }

      const scoredProducts = allProducts.map(product => {
        let score = 0;

        if (product.category_id === currentProduct.category_id) {
          score += 100;
        }

        const currentTags = currentProduct.tags || [];
        const productTags = product.tags || [];
        const tagOverlap = currentTags.filter((tag: string) => productTags.includes(tag)).length;
        score += tagOverlap * 20;

        const currentColors = currentProduct.colors || [];
        const productColors = product.colors || [];
        const colorOverlap = currentColors.filter((color: string) => productColors.includes(color)).length;
        score += colorOverlap * 10;

        const currentSizes = currentProduct.available_sizes || currentProduct.sizes || [];
        const productSizes = product.available_sizes || product.sizes || [];
        const sizeOverlap = currentSizes.filter((size: string) => productSizes.includes(size)).length;
        score += sizeOverlap * 5;

        const priceDiff = Math.abs(product.price - currentProduct.price);
        const priceProximity = Math.max(0, 100 - (priceDiff / currentProduct.price) * 100);
        score += priceProximity * 0.3;

        if (product.featured) {
          score += 15;
        }

        return { ...product, _score: score };
      });

      const sortedProducts = scoredProducts
        .sort((a, b) => b._score - a._score)
        .slice(0, limit)
        .map(({ _score, ...product }) => product);

      res.json(sortedProducts);
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

  // ============ PRODUCT CUSTOMIZATIONS (Type 2) ============
  
  // Create product customization (public)
  app.post("/api/product-customizations", async (req, res) => {
    try {
      const validatedData = insertProductCustomizationSchema.parse(req.body);

      const { data, error } = await supabase
        .from("product_customizations")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get all product customizations (admin only)
  app.get("/api/admin/product-customizations", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("product_customizations")
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

  // ============ USER MANAGEMENT (Firebase Sync) ============
  
  // Sync Firebase user to Supabase
  app.post("/api/users/sync", async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        console.error('❌ User sync: No idToken provided');
        return res.status(400).json({ error: "Firebase ID token is required" });
      }

      console.log('🔄 Attempting to verify Firebase token...');

      // Verify Firebase token
      const decodedToken = await verifyFirebaseToken(idToken);
      if (!decodedToken) {
        console.error('❌ User sync: Invalid Firebase token');
        return res.status(401).json({ error: "Invalid Firebase token" });
      }

      console.log('✅ Firebase token verified for:', decodedToken.email);

      // Extract user data from token
      const userData = {
        firebase_uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        photo_url: decodedToken.picture || null,
      };

      console.log('📝 User data to sync:', { email: userData.email, firebase_uid: userData.firebase_uid });

      // Check if user exists by email (for migrated admins with placeholder firebase_uid)
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", userData.email)
        .single();

      let result;
      if (existingUser && existingUser.firebase_uid.startsWith('admin_')) {
        // Update existing admin user's firebase_uid (migration from admin_users table)
        console.log('🔄 Updating migrated admin user:', userData.email);
        const { data, error } = await supabaseAdmin
          .from("users")
          .update({
            firebase_uid: userData.firebase_uid,
            name: userData.name,
            photo_url: userData.photo_url,
          })
          .eq("email", userData.email)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating admin user:', error);
          throw error;
        }
        console.log('✅ Admin user updated successfully');
        result = data;
      } else if (existingUser) {
        // User already exists, just update their info
        console.log('🔄 Updating existing user:', userData.email);
        const { data, error } = await supabaseAdmin
          .from("users")
          .update({
            name: userData.name,
            photo_url: userData.photo_url,
          })
          .eq("firebase_uid", userData.firebase_uid)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating existing user:', error);
          throw error;
        }
        console.log('✅ Existing user updated successfully');
        result = data;
      } else {
        // Create new user with default 'customer' role
        console.log('✨ Creating new user with customer role:', userData.email);
        const { data, error } = await supabaseAdmin
          .from("users")
          .insert({
            firebase_uid: userData.firebase_uid,
            email: userData.email,
            name: userData.name,
            photo_url: userData.photo_url,
            role: 'customer',
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating new user:', error);
          console.error('Full error details:', JSON.stringify(error, null, 2));
          throw error;
        }
        console.log('✅ New user created successfully with role:', data.role);
        result = data;
      }

      console.log('✅ User sync complete:', { email: result.email, role: result.role });

      res.json({
        success: true,
        user: result
      });
    } catch (error: any) {
      console.error("User sync error:", error);
      handleError(error, res);
    }
  });

  // Get current user profile
  app.post("/api/users/me", async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "Firebase ID token is required" });
      }

      // Verify Firebase token
      const decodedToken = await verifyFirebaseToken(idToken);
      if (!decodedToken) {
        return res.status(401).json({ error: "Invalid Firebase token" });
      }

      // Get user from Supabase
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("id, firebase_uid, email, name, role, photo_url, created_at, updated_at")
        .eq("firebase_uid", decodedToken.uid)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Get user profile error:", error);
      handleError(error, res);
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("id, firebase_uid, email, name, role, photo_url, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update user role (admin only)
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateUserRoleSchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from("users")
        .update({ role: validatedData.role })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
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

  // Firebase user admin authentication (for users promoted to admin)
  app.post("/api/admin/auth-firebase", async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "Firebase ID token is required" });
      }

      // Verify Firebase token
      const decodedToken = await verifyFirebaseToken(idToken);
      if (!decodedToken) {
        return res.status(401).json({ error: "Invalid Firebase token" });
      }

      // Check if user has admin role in users table
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("firebase_uid", decodedToken.uid)
        .single();

      if (error || !user || user.role !== 'admin') {
        return res.status(403).json({ error: "Not authorized as admin" });
      }

      // Set admin session
      if (req.session) {
        req.session.userId = user.id;
        req.session.adminEmail = user.email;
        req.session.adminName = user.name;
        await new Promise<void>((resolve, reject) => {
          req.session!.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Check admin session
  app.get("/api/admin/session", async (req, res) => {
    try {
      // Check legacy admin_users session
      if (req.session?.adminId) {
        return res.json({
          authenticated: true,
          adminId: req.session.adminId,
          adminEmail: req.session.adminEmail,
          adminName: req.session.adminName,
        });
      }

      // Check new users table session
      if (req.session?.userId) {
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", req.session.userId)
          .single();

        if (!error && user && user.role === 'admin') {
          return res.json({
            authenticated: true,
            userId: req.session.userId,
            adminEmail: req.session.adminEmail,
            adminName: req.session.adminName,
          });
        }
      }

      res.json({ authenticated: false });
    } catch (error) {
      res.json({ authenticated: false });
    }
  });

  // ============ ADMIN ANALYTICS ============
  
  // Get analytics data (admin only)
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      // Get counts using count queries
      const [productsResult, ordersResult, customPrintOrdersResult, contactResult, bulkOrdersResult] = await Promise.all([
        supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("custom_print_orders").select("*", { count: "exact", head: true }),
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
          customPrintOrders: customPrintOrdersResult.count || 0,
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

  // ============ CART ITEMS ============
  
  // Get cart items (by user_id or session_id)
  app.get("/api/cart", async (req, res) => {
    try {
      const { user_id, session_id } = req.query;
      
      if (!user_id && !session_id) {
        return res.status(400).json({ error: "user_id or session_id required" });
      }

      let query = supabase
        .from("cart_items")
        .select("*, products(*)");

      if (user_id) {
        query = query.eq("user_id", user_id);
      } else {
        query = query.eq("session_id", session_id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      
      // Check if item already exists in cart
      let query = supabase.from("cart_items").select("*");
      
      if (validatedData.user_id) {
        query = query.eq("user_id", validatedData.user_id);
      } else if (validatedData.session_id) {
        query = query.eq("session_id", validatedData.session_id);
      }
      
      query = query.eq("product_id", validatedData.product_id);
      if (validatedData.size) query = query.eq("size", validatedData.size);
      if (validatedData.color) query = query.eq("color", validatedData.color);

      const { data: existing } = await query.single();

      let result;
      if (existing) {
        // Update quantity if item exists
        const { data, error } = await supabaseAdmin
          .from("cart_items")
          .update({ quantity: existing.quantity + validatedData.quantity })
          .eq("id", existing.id)
          .select("*, products(*)")
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new item
        const { data, error } = await supabaseAdmin
          .from("cart_items")
          .insert(validatedData)
          .select("*, products(*)")
          .single();

        if (error) throw error;
        result = data;
      }

      res.json(result);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update cart item quantity
  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Valid quantity required" });
      }

      const { data, error } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity })
        .eq("id", id)
        .select("*, products(*)")
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Delete cart item
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Clear cart (for user or session)
  app.delete("/api/cart", async (req, res) => {
    try {
      const { user_id, session_id } = req.query;

      if (!user_id && !session_id) {
        return res.status(400).json({ error: "user_id or session_id required" });
      }

      let query = supabaseAdmin.from("cart_items").delete();

      if (user_id) {
        query = query.eq("user_id", user_id);
      } else {
        query = query.eq("session_id", session_id);
      }

      const { error } = await query;

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Sync guest cart to user cart (on login)
  app.post("/api/cart/sync", async (req, res) => {
    try {
      const { user_id, session_id } = req.body;

      if (!user_id || !session_id) {
        return res.status(400).json({ error: "user_id and session_id required" });
      }

      // Update all cart items from session_id to user_id
      const { error } = await supabaseAdmin
        .from("cart_items")
        .update({ user_id, session_id: null })
        .eq("session_id", session_id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ WISHLIST ITEMS ============
  
  // Get user's wishlist
  app.get("/api/wishlist", async (req, res) => {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: "user_id required" });
      }

      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*, products(*)")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Add item to wishlist
  app.post("/api/wishlist", async (req, res) => {
    try {
      const validatedData = insertWishlistItemSchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from("wishlist_items")
        .insert(validatedData)
        .select("*, products(*)")
        .single();

      if (error) {
        // Handle duplicate entry
        if (error.code === '23505') {
          return res.status(400).json({ error: "Item already in wishlist" });
        }
        throw error;
      }

      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Remove item from wishlist
  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("wishlist_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Remove item from wishlist by product_id and user_id
  app.delete("/api/wishlist/product/:product_id", async (req, res) => {
    try {
      const { product_id } = req.params;
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: "user_id required" });
      }

      const { error } = await supabaseAdmin
        .from("wishlist_items")
        .delete()
        .eq("product_id", product_id)
        .eq("user_id", user_id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ PRODUCT REVIEWS ============
  
  // Get reviews for a product
  app.get("/api/products/:product_id/reviews", async (req, res) => {
    try {
      const { product_id } = req.params;

      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", product_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get average rating for a product
  app.get("/api/products/:product_id/rating", async (req, res) => {
    try {
      const { product_id } = req.params;

      const { data, error } = await supabase
        .from("product_ratings_summary")
        .select("*")
        .eq("product_id", product_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      res.json(data || { 
        product_id, 
        review_count: 0, 
        average_rating: 0,
        five_star_count: 0,
        four_star_count: 0,
        three_star_count: 0,
        two_star_count: 0,
        one_star_count: 0
      });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Submit a product review
  app.post("/api/products/:product_id/reviews", async (req, res) => {
    try {
      const { product_id } = req.params;
      const validatedData = insertProductReviewSchema.parse({
        ...req.body,
        product_id,
      });

      const { data, error } = await supabaseAdmin
        .from("product_reviews")
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: "You have already reviewed this product" });
        }
        throw error;
      }

      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update a review
  app.put("/api/reviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const { data, error } = await supabaseAdmin
        .from("product_reviews")
        .update({ rating, comment })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ ORDER ENHANCEMENTS ============
  
  // Get user's orders (My Orders)
  app.get("/api/my-orders", async (req, res) => {
    try {
      const { user_id, user_email } = req.query;

      if (!user_id && !user_email) {
        return res.status(400).json({ error: "user_id or user_email required" });
      }

      let query = supabase.from("orders").select("*");

      if (user_id) {
        query = query.eq("user_id", user_id);
      } else {
        query = query.eq("user_email", user_email);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get order details with events
  app.get("/api/orders/:id/details", async (req, res) => {
    try {
      const { id } = req.params;

      // Get order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      // Get order events
      const { data: events, error: eventsError } = await supabase
        .from("order_events")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: true });

      if (eventsError) throw eventsError;

      res.json({ ...order, events: events || [] });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin: Get all orders with filters
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const { status, search, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from("orders")
        .select("*", { count: 'exact' });

      if (status && status !== 'all') {
        query = query.eq("status", status);
      }

      if (search) {
        query = query.or(`user_email.ilike.%${search}%,user_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      query = query
        .order("created_at", { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      res.json({ orders: data || [], total: count });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin: Update order status
  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      // Update order status
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order event
      const eventData = insertOrderEventSchema.parse({
        order_id: id,
        status,
        notes,
        created_by: req.session?.adminId,
      });

      const { error: eventError } = await supabaseAdmin
        .from("order_events")
        .insert(eventData);

      if (eventError) throw eventError;

      res.json(order);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ CUSTOMIZATION MANAGEMENT ============
  
  // Admin: Get all customization requests
  app.get("/api/admin/customizations", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;

      let query = supabase
        .from("customizations")
        .select("*, products(*)");

      if (status && status !== 'all') {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin: Update customization status
  app.put("/api/admin/customizations/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data, error } = await supabaseAdmin
        .from("customizations")
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

  // ============ CUSTOMER MESSAGES ============
  
  // Submit customer message (enhanced contact form)
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertCustomerMessageSchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from("customer_messages")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin: Get all customer messages
  app.get("/api/admin/messages", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;

      let query = supabase.from("customer_messages").select("*");

      if (status && status !== 'all') {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin: Update message status
  app.put("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      const updateData: any = { status };
      if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
      if (status === 'replied') updateData.replied_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from("customer_messages")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ SEARCH & FILTERS ============
  
  // Search products with filters
  app.get("/api/products/search", async (req, res) => {
    try {
      const { 
        q, 
        category, 
        min_price, 
        max_price, 
        size, 
        color, 
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      let query = supabase
        .from("products")
        .select("*, categories(*)")
        .eq("active", true);

      // Text search
      if (q) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // Category filter
      if (category) {
        query = query.eq("category_id", category);
      }

      // Price range filter
      if (min_price) {
        query = query.gte("price", Number(min_price));
      }
      if (max_price) {
        query = query.lte("price", Number(max_price));
      }

      // Size filter
      if (size) {
        query = query.contains("sizes", [size]);
      }

      // Color filter
      if (color) {
        query = query.contains("colors", [color]);
      }

      // Sorting
      query = query.order(String(sort), { ascending: order === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ ANALYTICS ============
  
  // Admin: Get order statistics
  app.get("/api/admin/analytics/orders", requireAdmin, async (req, res) => {
    try {
      const { period = '30' } = req.query;
      
      // Get orders from the last N days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(period));

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", daysAgo.toISOString());

      if (error) throw error;

      // Calculate statistics
      const orders = data || [];
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Group by status
      const statusCounts = orders.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      res.json({
        total_orders: orders.length,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        status_breakdown: statusCounts,
        orders_by_day: orders,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin: Get daily order stats
  app.get("/api/admin/analytics/daily-stats", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("daily_order_stats")
        .select("*")
        .limit(30)
        .order("order_date", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Admin: Get top products
  app.get("/api/admin/analytics/top-products", requireAdmin, async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      // Get all orders
      const { data: orders, error } = await supabase
        .from("orders")
        .select("items");

      if (error) throw error;

      // Count product sales
      const productSales: any = {};
      orders?.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = {
              product_id: item.product_id,
              name: item.name,
              total_quantity: 0,
              total_revenue: 0,
            };
          }
          productSales[item.product_id].total_quantity += item.quantity;
          productSales[item.product_id].total_revenue += item.price * item.quantity;
        });
      });

      // Convert to array and sort
      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.total_quantity - a.total_quantity)
        .slice(0, Number(limit));

      res.json(topProducts);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ ANNOUNCEMENTS ============
  
  // Get active announcement (public)
  app.get("/api/announcement", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      res.json(data || null);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get all announcements (admin only)
  app.get("/api/admin/announcements", requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Create announcement (admin only)
  app.post("/api/admin/announcements", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update announcement (admin only)
  app.put("/api/admin/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertAnnouncementSchema.partial().parse(req.body);

      const { data, error } = await supabaseAdmin
        .from("announcements")
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

  // Delete announcement (admin only)
  app.delete("/api/admin/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ CUSTOM PRINT ORDERS ============
  
  // Create custom print order (public - customer submission)
  app.post("/api/custom-print-orders", async (req, res) => {
    try {
      const validatedData = insertCustomPrintOrderSchema.parse(req.body);
      
      const { data, error } = await supabase
        .from("custom_print_orders")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get all custom print orders (admin only)
  app.get("/api/admin/custom-print-orders", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      
      let query = supabase
        .from("custom_print_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Get single custom print order (admin only)
  app.get("/api/admin/custom-print-orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("custom_print_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update custom print order (admin only)
  app.put("/api/admin/custom-print-orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data, error } = await supabaseAdmin
        .from("custom_print_orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Delete custom print order (admin only)
  app.delete("/api/admin/custom-print-orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("custom_print_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ CATEGORY-PRODUCT RELATIONSHIPS ============
  
  // Get products for a category (public)
  app.get("/api/categories/:categoryId/products", async (req, res) => {
    try {
      const { categoryId } = req.params;

      const { data, error } = await supabase
        .from("category_products")
        .select(`
          product_id,
          display_order,
          products (*)
        `)
        .eq("category_id", categoryId)
        .order("display_order");

      if (error) throw error;
      
      const products = data?.map((item: any) => item.products) || [];
      res.json(products);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Add product to category (admin only)
  app.post("/api/admin/categories/:categoryId/products", requireAdmin, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { product_id, display_order } = req.body;

      const validatedData = insertCategoryProductSchema.parse({
        category_id: categoryId,
        product_id,
        display_order,
      });

      const { data, error } = await supabaseAdmin
        .from("category_products")
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Remove product from category (admin only)
  app.delete("/api/admin/categories/:categoryId/products/:productId", requireAdmin, async (req, res) => {
    try {
      const { categoryId, productId } = req.params;

      const { error } = await supabaseAdmin
        .from("category_products")
        .delete()
        .eq("category_id", categoryId)
        .eq("product_id", productId);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Update product display order in category (admin only)
  app.put("/api/admin/categories/:categoryId/products/:productId", requireAdmin, async (req, res) => {
    try {
      const { categoryId, productId } = req.params;
      const { display_order } = req.body;

      const { data, error } = await supabaseAdmin
        .from("category_products")
        .update({ display_order })
        .eq("category_id", categoryId)
        .eq("product_id", productId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Serve stock images
  app.use('/assets/stock_images', express.static('attached_assets/stock_images'));

  const httpServer = createServer(app);
  return httpServer;
}
