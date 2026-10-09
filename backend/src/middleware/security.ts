import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizes an object recursively to prevent NoSQL injection (keys starting with $ or containing .)
 * and prototype pollution (__proto__, constructor, prototype).
 */
function sanitizeInput(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInput(item));
  }

  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Block prototype pollution & MongoDB operator injection keys ($gt, $ne, $where, etc.)
      const lowerKey = key.toLowerCase();
      if (
        key.startsWith('$') ||
        key.includes('.') ||
        lowerKey === '__proto__' ||
        lowerKey === 'constructor' ||
        lowerKey === 'prototype'
      ) {
        console.warn(`[SECURITY] Blocked suspicious key or injection attempt: "${key}"`);
        continue;
      }

      const val = obj[key];
      clean[key] = sanitizeInput(val);
    }
    return clean;
  }

  if (typeof obj === 'string') {
    // Strip dangerous HTML script tags & javascript: protocols
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onerror\s*=/gi, '');
  }

  return obj;
}

/**
 * Security Middleware:
 * 1. Sets protective security HTTP headers
 * 2. Neutralizes NoSQL Injection & Prototype Pollution & Reflected XSS
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Protective HTTP Security Headers (Helmet standard)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');

  // 2. Sanitize request body, query, and params against NoSQL injections
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeInput(req.params);
  }

  next();
}
