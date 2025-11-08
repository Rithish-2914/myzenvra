import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAdminCookie } from '../../server/lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearAdminCookie(res);
  res.json({ success: true });
}
