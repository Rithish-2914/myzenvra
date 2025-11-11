import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import { ZodError } from 'zod';
import { z } from 'zod';

// Cart item schema for validation
const insertCartItemSchema = z.object({
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  product_id: z.string(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
  customization_text: z.string().optional(),
  customization_image_url: z.string().optional(),
});

// Supabase setup
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : supabase;

// Firebase Admin setup
let firebaseAdmin: admin.app.App | null = null;

function initializeFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.VITE_FIREBASE_PROJECT_ID) {
      firebaseAdmin = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn('⚠️  Firebase Admin not configured');
      return null;
    }

    console.log('✅ Firebase Admin initialized');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    return null;
  }
}

async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  if (!firebaseAdmin) {
    initializeFirebaseAdmin();
  }
  
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Create Express app once and reuse
let app: Express | null = null;
let isInitialized = false;

// Helper to handle validation errors
function handleError(error: any, res: Response) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Validation error", details: error.errors });
  }
  console.error("Server error:", error);
  res.status(500).json({ error: error.message || "Internal server error" });
}

// Simplified admin check for Vercel (no session support)
function requireAdmin(req: Request, res: Response, next: any) {
  // In Vercel, we skip session-based auth for now
  // This will be handled differently in production
  next();
}

async function getApp(): Promise<Express> {
  if (app && isInitialized) {
    return app;
  }
  
  // Initialize Firebase Admin first
  if (!isInitialized) {
    console.log('🔄 Initializing Firebase Admin for serverless function...');
    initializeFirebaseAdmin();
    isInitialized = true;
  }
  
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Register only the critical routes needed
  
  // ============ USER SYNC (Most Important) ============
  app.post("/api/users/sync", async (req: Request, res: Response) => {
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

      // Check if user exists
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", userData.email)
        .single();

      let result;
      if (existingUser && existingUser.firebase_uid.startsWith('admin_')) {
        // Update existing admin user
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
        result = data;
      } else if (existingUser) {
        // Update existing user
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
        result = data;
      } else {
        // Create new user
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
          throw error;
        }
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
  app.post("/api/users/me", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "Firebase ID token is required" });
      }

      const decodedToken = await verifyFirebaseToken(idToken);
      if (!decodedToken) {
        return res.status(401).json({ error: "Invalid Firebase token" });
      }

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
      handleError(error, res);
    }
  });

  // Get all categories (public)
  app.get("/api/categories", async (req: Request, res: Response) => {
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

  // Get all products (public)
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { category, gift_type } = req.query;
      
      let query = supabase
        .from("products")
        .select("*, categories(*)")
        .eq("active", true);

      if (category) {
        query = query.eq("category_id", category);
      }

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

  // Get single product
  app.get("/api/products/:id", async (req: Request, res: Response) => {
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

  // Submit contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // Create order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  // ============ CART ITEMS ============
  
  // Get cart items (by user_id or session_id)
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const { user_id, session_id } = req.query;
      
      if (!user_id && !session_id) {
        return res.status(400).json({ error: "user_id or session_id required" });
      }

      let query = supabaseAdmin
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
  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      
      // Check if item already exists in cart
      let query = supabaseAdmin.from("cart_items").select("*");
      
      if (validatedData.user_id) {
        query = query.eq("user_id", validatedData.user_id);
      } else if (validatedData.session_id) {
        query = query.eq("session_id", validatedData.session_id);
      }
      
      query = query.eq("product_id", validatedData.product_id);
      if (validatedData.size) query = query.eq("size", validatedData.size);
      if (validatedData.color) query = query.eq("color", validatedData.color);

      const { data: existingItems } = await query.limit(1);
      const existing = existingItems && existingItems.length > 0 ? existingItems[0] : null;

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
  app.put("/api/cart/:id", async (req: Request, res: Response) => {
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
  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
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
  app.delete("/api/cart", async (req: Request, res: Response) => {
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
  app.post("/api/cart/sync", async (req: Request, res: Response) => {
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

  // ============ ANNOUNCEMENTS ============
  
  // Get active announcement (public)
  app.get("/api/announcement", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin
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
  
  console.log('✅ Express app initialized for Vercel serverless function');
  
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📥 ${req.method} ${req.url}`);
    
    const expressApp = await getApp();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Cookie'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Handle the request with Express
    return new Promise((resolve, reject) => {
      expressApp(req as any, res as any, (err: any) => {
        if (err) {
          console.error('❌ Express error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message });
          }
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error: any) {
    console.error('❌ Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
