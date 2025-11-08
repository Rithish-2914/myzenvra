import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFromRequest } from '../../server/lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = getAdminFromRequest(req);

  if (admin) {
    res.json({
      authenticated: true,
      adminId: admin.adminId,
      adminEmail: admin.adminEmail,
      adminName: admin.adminName,
    });
  } else {
    res.json({ authenticated: false });
  }
}
