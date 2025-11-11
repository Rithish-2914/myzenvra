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
  images: z.array(z.string()),
  color_images: z.record(z.array(z.string())).nullable(),  // Maps color -> image URLs
  customizable: z.boolean(),
  gift_type: z.enum(['none', 'watches', 'eyewear', 'frames', 'accessories']).nullable(),
  stock_quantity: z.number(),
  available_sizes: z.array(z.string()),
  colors: z.array(z.string()),
  tags: z.array(z.string()),
  featured: z.boolean(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"] as const;

export const insertProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category_id: z.string().uuid().optional(),
  images: z.array(z.string().url("Each image must be a valid URL")).min(1, "At least one image is required").max(5, "Maximum 5 images allowed"),
  color_images: z.record(z.array(z.string().url())).optional(),
  customizable: z.boolean().default(false),
  gift_type: z.enum(['none', 'watches', 'eyewear', 'frames', 'accessories']).default('none'),
  stock_quantity: z.number().int().nonnegative().default(0),
  available_sizes: z.array(z.enum(ALL_SIZES)).default(["S", "M", "L", "XL"]),
  colors: z.array(z.string()).default(["Beige", "Black", "White"]),
  tags: z.array(z.string().transform(s => s.trim().toLowerCase())).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  category_id: z.string().uuid().nullable().optional(),
  images: z.array(z.string().url("Each image must be a valid URL")).min(1, "At least one image is required").max(5, "Maximum 5 images allowed").optional(),
  color_images: z.record(z.array(z.string().url())).optional(),
  available_sizes: z.array(z.enum(ALL_SIZES)).optional(),
  colors: z.array(z.string()).optional(),
  tags: z.array(z.string().transform(s => s.trim().toLowerCase())).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

// Order Schema
export const orderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().optional(),
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
  payment_method: z.enum(['cod', 'upi', 'card']).default('cod'),
  payment_status: z.enum(['pending', 'paid', 'failed']).default('pending'),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertOrderSchema = z.object({
  user_id: z.string().optional(),
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
  })).min(1, "At least one item is required"),
  total_amount: z.number().positive("Total amount must be positive"),
  payment_method: z.enum(['cod', 'upi', 'card']).default('cod'),
  payment_status: z.enum(['pending', 'paid', 'failed']).default('pending'),
  status: z.string().default("pending"),
});

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Custom Print Order Schema (Type 1: Upload to Admin for Printing)
export const customPrintOrderSchema = z.object({
  id: z.string().uuid(),
  customer_name: z.string(),
  customer_email: z.string(),
  customer_phone: z.string(),
  category_type: z.enum(['hoodie', 'tshirt', 'sweatshirt', 'jacket', 'shorts', 'pants']),
  custom_text: z.string().nullable(),
  custom_image_url: z.string().nullable(),
  selected_color: z.string(),
  selected_size: z.string(),
  quantity: z.number(),
  special_instructions: z.string().nullable(),
  status: z.enum(['pending', 'reviewing', 'approved', 'printing', 'completed', 'cancelled']),
  admin_notes: z.string().nullable(),
  estimated_price: z.number().nullable(),
  final_price: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertCustomPrintOrderSchema = z.object({
  customer_name: z.string().min(1, "Name is required"),
  customer_email: z.string().email("Valid email required"),
  customer_phone: z.string().min(10, "Valid phone number required"),
  category_type: z.enum(['hoodie', 'tshirt', 'sweatshirt', 'jacket', 'shorts', 'pants']),
  custom_text: z.string().optional(),
  custom_image_url: z.string().optional(),
  selected_color: z.string().min(1, "Color is required"),
  selected_size: z.string().min(1, "Size is required"),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
  special_instructions: z.string().optional(),
});

export type CustomPrintOrder = z.infer<typeof customPrintOrderSchema>;
export type InsertCustomPrintOrder = z.infer<typeof insertCustomPrintOrderSchema>;

// Product Customization Schema (Type 2: On-Site Product Customization)
export const productCustomizationSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  customer_email: z.string().nullable(),
  custom_name: z.string().nullable(),
  custom_image_url: z.string().nullable(),
  selected_size: z.string().nullable(),
  selected_color: z.string().nullable(),
  quantity: z.number(),
  created_at: z.string(),
});

export const insertProductCustomizationSchema = z.object({
  product_id: z.string().uuid(),
  customer_email: z.string().email().optional(),
  custom_name: z.string().optional(),
  custom_image_url: z.string().optional(),
  selected_size: z.string().optional(),
  selected_color: z.string().optional(),
  quantity: z.number().int().positive().default(1),
});

export type ProductCustomization = z.infer<typeof productCustomizationSchema>;
export type InsertProductCustomization = z.infer<typeof insertProductCustomizationSchema>;

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
  role: z.enum(['customer', 'admin']),
  photo_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertUserSchema = z.object({
  firebase_uid: z.string().min(1, "Firebase UID is required"),
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(['customer', 'admin']).default('customer'),
  photo_url: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'admin']),
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

// Announcement Banner Schema
export const announcementSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  enabled: z.boolean(),
  link_url: z.string().nullable(),
  link_text: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertAnnouncementSchema = z.object({
  message: z.string().min(1, "Message is required"),
  enabled: z.boolean().default(true),
  link_url: z.string().optional(),
  link_text: z.string().optional(),
});

export type Announcement = z.infer<typeof announcementSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Category-Product Relationship Schema (for manual assignment)
export const categoryProductSchema = z.object({
  category_id: z.string().uuid(),
  product_id: z.string().uuid(),
  display_order: z.number(),
  created_at: z.string(),
});

export const insertCategoryProductSchema = z.object({
  category_id: z.string().uuid(),
  product_id: z.string().uuid(),
  display_order: z.number().int().nonnegative().default(0),
});

export type CategoryProduct = z.infer<typeof categoryProductSchema>;
export type InsertCategoryProduct = z.infer<typeof insertCategoryProductSchema>;

// Product Images Schema (for color-specific images)
export const productImageSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  color: z.string().nullable(),  // NULL means default/shared image
  image_url: z.string().url(),
  display_order: z.number().int().nonnegative(),
  is_primary: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertProductImageSchema = z.object({
  product_id: z.string().uuid(),
  color: z.string().optional(),  // undefined/null means default/shared
  image_url: z.string().url("Image URL must be valid"),
  display_order: z.number().int().nonnegative().default(0),
  is_primary: z.boolean().default(false),
});

export type ProductImage = z.infer<typeof productImageSchema>;
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
