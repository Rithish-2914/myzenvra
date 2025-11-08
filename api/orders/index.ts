import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../../server/supabase';
import { insertOrderSchema } from '../../shared/schema';
import { requireAdmin } from '../../server/lib/auth';

async function createOrder(req: VercelRequest, res: VercelResponse) {
  try {
    const validatedData = insertOrderSchema.parse(req.body);

    const { data, error } = await supabase
      .from('orders')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(400).json({ error: error.message });
  }
}

async function getOrders(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return createOrder(req, res);
  }

  if (req.method === 'GET') {
    return requireAdmin(getOrders)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
