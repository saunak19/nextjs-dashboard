import NextAuth, { DefaultUser, DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Define the shape of your custom role
type UserRole = 'user' | 'admin' | 'superadmin';

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback */
    interface JWT extends DefaultJWT {
        id: string;
        role: UserRole;
    }
}

declare module "next-auth" {
    /** Returned by the `authorize` callback */
    interface User {
        id: string;
        role: UserRole;
    }

    /** Returned by the `session` callback */
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: UserRole;
        } & DefaultSession["user"]; // Keep other user properties (like email, name)
    }
}