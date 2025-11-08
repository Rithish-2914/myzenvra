import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../../server/supabase';
import { insertProductSchema } from '../../shared/schema';
import { requireAdmin } from '../../server/lib/auth';

async function getProduct(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(404).json({ error: 'Product not found' });
  }
}

async function updateProduct(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { id } = req.query;
    const validatedData = insertProductSchema.partial().parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
}

async function deleteProduct(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { id } = req.query;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return getProduct(req, res);
  }

  if (req.method === 'PUT') {
    return requireAdmin(updateProduct)(req, res);
  }

  if (req.method === 'DELETE') {
    return requireAdmin(deleteProduct)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
