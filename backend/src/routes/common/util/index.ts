import { parseObject, TSchema } from 'jet-validators/utils';

import { RouteError, ValidationError } from '@src/common/util/route-errors';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';


/******************************************************************************
                              Functions
******************************************************************************/

/**
 * Throw a "ParseObjError" when "parseObject" fails. Also extract a nested 
 * "ParseObjError" and add it to the nestedErrors array.
 */
export function parseReq<U extends TSchema>(schema: U) {
  return parseObject(schema, errors => {
    throw new ValidationError(errors);
  });
}

// Middleware to handle validation errors
export const expressRouterValidator = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) 
    throw new RouteError(400, (errors.array().map(ele => (ele.msg as string) ?? '')).join(', '));
  next();
};