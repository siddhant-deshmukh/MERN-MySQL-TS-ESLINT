import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import ENV from '@src/common/constants/ENV';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  // Expected format: "Bearer TOKEN"
  const token = authHeader?.split(' ')[1];

  if (token == null) {
    res.status(HttpStatusCodes.FORBIDDEN).json({ msg: 'Authentication token required' }); // No token provided
    return;
  }

  jwt.verify(token, ENV.JwtSecret, (err, str_payload) => {
    if (err || !str_payload) {
      // Token is invalid or expired
      res.status(HttpStatusCodes.FORBIDDEN).json({ msg: 'Invalid or expired token' });
      return;
    }
    let payload: { id: number };
    if(typeof str_payload  === 'string'){
      payload = JSON.parse(str_payload) as { id: number };
    } else if (!str_payload) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ msg: 'Invalid or expired token' });
      return;
    } else {
      payload = str_payload as { id: number };
    }
    
    req.user_id = payload.id;
    next(); 
  });
};