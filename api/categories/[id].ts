import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../server/supabase';
import { insertCategorySchema } from '../../shared/schema';
import { requireAdmin } from '../../server/lib/auth';

async function updateCategory(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { id } = req.query;
    const validatedData = insertCategorySchema.partial().parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(400).json({ error: error.message });
  }
}

async function deleteCategory(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { id } = req.query;

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    return requireAdmin(updateCategory)(req, res);
  }

  if (req.method === 'DELETE') {
    return requireAdmin(deleteCategory)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
