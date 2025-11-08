import { z } from "zod";

// Category Schema
export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Product Schema
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  category_id: z.string().uuid().nullable(),
  image_url: z.string(),
  customizable: z.boolean(),
  gift_type: z.enum(['none', 'watches', 'eyewear', 'frames', 'accessories']).nullable(),
  stock_quantity: z.number(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  featured: z.boolean(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category_id: z.string().uuid().optional(),
  image_url: z.string().min(1, "Image URL is required"),
  customizable: z.boolean().default(false),
  gift_type: z.enum(['none', 'watches', 'eyewear', 'frames', 'accessories']).default('none'),
  stock_quantity: z.number().int().nonnegative().default(0),
  sizes: z.array(z.string()).default(["S", "M", "L", "XL"]),
  colors: z.array(z.string()).default(["Beige", "Black", "White"]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Order Schema
export const orderSchema = z.object({
  id: z.string().uuid(),
  user_email: z.string().email(),
  user_name: z.string(),
  phone: z.string(),
  shipping_address: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  items: z.array(z.object({
    product_id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    size: z.string().optional(),
    color: z.string().optional(),
  })),
  total_amount: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertOrderSchema = z.object({
  user_email: z.string().email("Valid email required"),
  user_name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  shipping_address: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(6, "Valid pincode required"),
  }),
  items: z.array(z.object({
    product_id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    size: z.string().optional(),
    color: z.string().optional(),
  })),
  total_amount: z.number().positive("Total amount must be positive"),
  status: z.string().default("pending"),
});

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Customization Schema
export const customizationSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid().nullable(),
  user_email: z.string().nullable(),
  custom_text: z.string().nullable(),
  custom_image_url: z.string().nullable(),
  selected_color: z.string().nullable(),
  selected_size: z.string().nullable(),
  price: z.number(),
  status: z.string(),
  created_at: z.string(),
});

export const insertCustomizationSchema = z.object({
  product_id: z.string().uuid().optional(),
  user_email: z.string().email().optional(),
  custom_text: z.string().optional(),
  custom_image_url: z.string().optional(),
  selected_color: z.string().optional(),
  selected_size: z.string().optional(),
  price: z.number().nonnegative().default(0).optional(),
  status: z.string().default("pending"),
});

export type Customization = z.infer<typeof customizationSchema>;
export type InsertCustomization = z.infer<typeof insertCustomizationSchema>;

// Contact Inquiry Schema
export const contactInquirySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  inquiry_type: z.string(),
  status: z.string(),
  created_at: z.string(),
});

export const insertContactInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  inquiry_type: z.string().default("general"),
});

export type ContactInquiry = z.infer<typeof contactInquirySchema>;
export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;

// Bulk Order Schema
export const bulkOrderSchema = z.object({
  id: z.string().uuid(),
  organization_name: z.string(),
  contact_name: z.string(),
  email: z.string(),
  phone: z.string(),
  quantity: z.number(),
  details: z.string().nullable(),
  status: z.string(),
  created_at: z.string(),
});

export const insertBulkOrderSchema = z.object({
  organization_name: z.string().min(1, "Organization name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  details: z.string().optional(),
});

export type BulkOrder = z.infer<typeof bulkOrderSchema>;
export type InsertBulkOrder = z.infer<typeof insertBulkOrderSchema>;

// User Activity Schema
export const userActivitySchema = z.object({
  id: z.string().uuid(),
  user_email: z.string().nullable(),
  user_id: z.string().nullable(),
  page_visited: z.string().nullable(),
  action: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string(),
});

export const insertUserActivitySchema = z.object({
  user_email: z.string().optional(),
  user_id: z.string().optional(),
  page_visited: z.string().optional(),
  action: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

export type UserActivity = z.infer<typeof userActivitySchema>;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

// Admin User Schema
export const adminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  password_hash: z.string(),
  name: z.string(),
  role: z.string(),
  created_at: z.string(),
});

export const insertAdminUserSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.string().default("admin"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});

export type AdminUser = z.infer<typeof adminUserSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;

// Users Schema (Firebase users synced to Supabase)
export const userSchema = z.object({
  id: z.string().uuid(),
  firebase_uid: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  photo_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertUserSchema = z.object({
  firebase_uid: z.string().min(1, "Firebase UID is required"),
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(['user', 'admin']).default('user'),
  photo_url: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;

// Cart Items Schema
export const cartItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().nullable(),
  session_id: z.string().nullable(),
  product_id: z.string().uuid(),
  quantity: z.number(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  customization: z.object({
    text: z.string().optional(),
    image_url: z.string().optional(),
  }).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertCartItemSchema = z.object({
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive("Quantity must be positive"),
  size: z.string().optional(),
  color: z.string().optional(),
  customization: z.object({
    text: z.string().optional(),
    image_url: z.string().optional(),
  }).optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Wishlist Items Schema
export const wishlistItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  product_id: z.string().uuid(),
  created_at: z.string(),
});

export const insertWishlistItemSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  product_id: z.string().uuid(),
});

export type WishlistItem = z.infer<typeof wishlistItemSchema>;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

// Product Reviews Schema
export const productReviewSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  verified_purchase: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertProductReviewSchema = z.object({
  product_id: z.string().uuid(),
  user_id: z.string().min(1, "User ID is required"),
  user_name: z.string().min(1, "Name is required"),
  user_email: z.string().email("Valid email required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().optional(),
  verified_purchase: z.boolean().default(false),
});

export type ProductReview = z.infer<typeof productReviewSchema>;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;

// Order Events Schema (for status tracking)
export const orderEventSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().nullable(),
  created_by: z.string().nullable(),
  created_at: z.string(),
});

export const insertOrderEventSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
  created_by: z.string().optional(),
});

export type OrderEvent = z.infer<typeof orderEventSchema>;
export type InsertOrderEvent = z.infer<typeof insertOrderEventSchema>;

// Customer Messages Schema (enhanced contact)
export const customerMessageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  inquiry_type: z.string(),
  status: z.enum(['new', 'read', 'replied', 'archived']),
  admin_notes: z.string().nullable(),
  replied_at: z.string().nullable(),
  created_at: z.string(),
});

export const insertCustomerMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  inquiry_type: z.string().default("general"),
});

export type CustomerMessage = z.infer<typeof customerMessageSchema>;
export type InsertCustomerMessage = z.infer<typeof insertCustomerMessageSchema>;
