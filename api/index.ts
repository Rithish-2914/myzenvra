import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Express } from 'express';
import { registerRoutes } from '../server/routes';
import { initializeFirebaseAdmin } from '../server/firebase-admin';

// Create Express app once and reuse
let app: Express | null = null;
let isInitialized = false;

async function getApp(): Promise<Express> {
  if (app && isInitialized) {
    return app;
  }
  
  // Initialize Firebase Admin first
  if (!isInitialized) {
    console.log('🔄 Initializing Firebase Admin for serverless function...');
    initializeFirebaseAdmin();
    isInitialized = true;
  }
  
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Register routes
  await registerRoutes(app);
  
  console.log('✅ Express app initialized for Vercel serverless function');
  
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📥 ${req.method} ${req.url}`);
    
    const expressApp = await getApp();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Cookie'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Handle the request with Express
    return new Promise((resolve, reject) => {
      expressApp(req as any, res as any, (err: any) => {
        if (err) {
          console.error('❌ Express error:', err);
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
    console.error('❌ Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
