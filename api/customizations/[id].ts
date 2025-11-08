import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../server/supabase';
import { requireAdmin } from '../../server/lib/auth';

async function updateCustomizationStatus(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('customizations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating customization:', error);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    return requireAdmin(updateCustomizationStatus)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
