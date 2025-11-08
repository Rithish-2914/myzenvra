import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../../server/supabase';
import { insertCustomizationSchema } from '../../shared/schema';
import { requireAdmin } from '../../server/lib/auth';

async function createCustomization(req: VercelRequest, res: VercelResponse) {
  try {
    const validatedData = insertCustomizationSchema.parse(req.body);

    const { data, error} = await supabase
      .from('customizations')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating customization:', error);
    res.status(400).json({ error: error.message });
  }
}

async function getCustomizations(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('customizations')
      .select('*, products(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching customizations:', error);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return createCustomization(req, res);
  }

  if (req.method === 'GET') {
    return requireAdmin(getCustomizations)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
