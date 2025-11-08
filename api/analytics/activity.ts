import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../../server/supabase';
import { insertUserActivitySchema } from '../../shared/schema';
import { requireAdmin } from '../../server/lib/auth';

async function trackActivity(req: VercelRequest, res: VercelResponse) {
  try {
    const validatedData = insertUserActivitySchema.parse(req.body);

    // Add IP and user agent from request
    const activityData = {
      ...validatedData,
      ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '',
      user_agent: req.headers['user-agent'] || '',
    };

    const { data, error } = await supabase
      .from('user_activity')
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error tracking activity:', error);
    res.status(400).json({ error: error.message });
  }
}

async function getActivity(req: VercelRequest, res: VercelResponse, admin: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return trackActivity(req, res);
  }

  if (req.method === 'GET') {
    return requireAdmin(getActivity)(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
