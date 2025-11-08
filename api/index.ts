import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let routesRegistered = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Register routes once
  if (!routesRegistered) {
    await registerRoutes(app);
    routesRegistered = true;
  }

  // Handle the request with Express
  return new Promise((resolve) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      resolve(undefined);
    });
  });
}
