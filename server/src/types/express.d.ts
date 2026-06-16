declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      user?: {
        id: string;
        role: string;
        email: string;
        jti: string;
      };
    }
  }
}

export {};
