import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../server/supabase';
import { adminLoginSchema } from '../../shared/schema';
import { createAdminToken, setAdminCookie } from '../../server/lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = adminLoginSchema.parse(req.body);

    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', validatedData.email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      admin.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = createAdminToken({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
    });

    // Set HTTP-only cookie
    setAdminCookie(res, token);

    res.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
