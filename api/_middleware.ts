import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function middleware(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  const origin = req.headers.origin;
  
  // Allow requests from the same origin or Vercel deployment URLs
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Cookie'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  
  // Continue to the actual API route
  return;
}
