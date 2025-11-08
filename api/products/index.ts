import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../../server/supabase';
import { insertProductSchema } from '../../shared/schema';
import { requireAdmin, getAdminFromRequest } from '../../server/lib/auth';

async function getProducts(req: VercelRequest, res: VercelResponse) {
  try {
    const { category, all } = req.query;
    const admin = getAdminFromRequest(req);

    let query = supabase
      .from('products')
      .select('*, categories(*)');

    // Only show active products to non-admin users
    if (!admin || all !== 'true') {
      query = query.eq('active', true);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
}

async function createProduct(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const validatedData = insertProductSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return getProducts(req, res);
  }

  if (req.method === 'POST') {
    return requireAdmin(createProduct)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
