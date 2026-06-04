import { UserRole } from '../config/constants';

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
    }

    interface Request {
      currentUser?: AuthenticatedUser;
    }
  }
}

export {};
