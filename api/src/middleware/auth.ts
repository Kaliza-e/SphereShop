import { Request, Response, NextFunction } from "express";
import { memoryDb } from "../db";

export interface AuthenticatedRequest extends Request {
  user?: any;
  sessionId?: string;
  cartId?: string;
}

export function sessionMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.session || req.headers.authorization?.replace("Bearer ", "");
  
  if (token) {
    const session = memoryDb.sessions.get(token);
    if (session && new Date(session.expires_at).getTime() > Date.now()) {
      req.sessionId = token;
      req.user = memoryDb.users.get(session.user_id);
      req.cartId = session.cart_id;
    }
  }

  if (!req.cartId) {
    let anonToken = req.headers["x-cart-token"] as string;
    if (!anonToken) {
      anonToken = `cart-anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    req.cartId = anonToken;
    res.setHeader("X-Cart-Token", anonToken);
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Sign-in required",
        referenceId: `REF-${Date.now()}`
      }
    });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Sign-in required",
          referenceId: `REF-${Date.now()}`
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Access denied",
          referenceId: `REF-${Date.now()}`
        }
      });
    }

    next();
  };
}
