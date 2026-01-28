/**
 * Netlify Function: API Handler
 * 
 * This function wraps the Express.js backend server and makes it compatible
 * with Netlify's serverless function environment.
 * 
 * All requests to /api/* are routed through this function via netlify.toml redirects.
 */

import serverlessExpress from '@vendia/serverless-express';
import app from '../../server/src/server';

/**
 * Export the serverless handler
 * This converts Express middleware/routes to AWS Lambda-compatible format
 * which Netlify Functions use under the hood.
 */
export const handler = serverlessExpress({ app });
