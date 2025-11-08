import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../../server/supabase';
import { insertContactInquirySchema } from '../../shared/schema';
import { requireAdmin } from '../../server/lib/auth';

async function createInquiry(req: VercelRequest, res: VercelResponse) {
  try {
    const validatedData = insertContactInquirySchema.parse(req.body);

    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    res.status(400).json({ error: error.message });
  }
}

async function getInquiries(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return createInquiry(req, res);
  }

  if (req.method === 'GET') {
    return requireAdmin(getInquiries)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
