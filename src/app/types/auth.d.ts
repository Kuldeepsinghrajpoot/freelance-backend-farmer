// types/express/index.d.ts
import { Request } from 'express'
export interface userRequest extends Request {
  user?: any;
}