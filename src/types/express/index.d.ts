import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: number;
      email: string;
      // Puedes agregar más campos si tu middleware los añade
    };
  }
} 