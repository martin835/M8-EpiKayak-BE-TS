declare module "*";

interface JwtUser {
  _id: string;
  role: string;
}

namespace Express {
  interface Request {
    user?: JwtUser;
  }
}
