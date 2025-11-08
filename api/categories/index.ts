import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../../server/supabase';
import { insertCategorySchema } from '../../shared/schema';
import { requireAdmin } from '../../server/lib/auth';

async function getCategories(req: VercelRequest, res: VercelResponse) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function createCategory(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const validatedData = insertCategorySchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(400).json({ error: error.message || 'Validation error' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return getCategories(req, res);
  }

  if (req.method === 'POST') {
    return requireAdmin(createCategory)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
