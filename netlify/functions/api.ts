/**
 * Netlify Function: API Handler
 * 
 * This function wraps the Express.js backend server and makes it compatible
 * with Netlify's serverless function environment.
 * 
 * All requests to /api/* are routed through this function via netlify.toml redirects.
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';
import app from '../../server/src/server';

// Create the serverless handler
const serverlessHandler = serverlessExpress({ app });

/**
 * Export the Netlify handler
 * Converts Netlify event format to AWS Lambda format for serverless-express
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Convert Netlify event to AWS Lambda event format
  const lambdaEvent = {
    ...event,
    requestContext: {
      ...event.requestContext,
      elb: undefined, // Remove ELB context if present
    },
    // Ensure httpMethod is set
    httpMethod: event.httpMethod || 'GET',
    // Ensure path is set
    path: event.path || '/',
    // Ensure headers are set
    headers: event.headers || {},
    // Ensure body is set
    body: event.body || null,
    // Ensure isBase64Encoded is set
    isBase64Encoded: event.isBase64Encoded || false,
  };

  // Call the serverless-express handler
  return serverlessHandler(lambdaEvent, context);
};
