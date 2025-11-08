import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Express } from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app once and reuse
let app: Express | null = null;

async function getApp(): Promise<Express> {
  if (app) {
    return app;
  }
  
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Register routes
  await registerRoutes(app);
  
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp();
    
    // Handle the request with Express
    return new Promise((resolve, reject) => {
      expressApp(req as any, res as any, (err: any) => {
        if (err) {
          console.error('Express error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message });
          }
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error: any) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
