import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

type Role = 'user' | 'admin' | 'superadmin';

/**
 * Checks for 'admin' or 'superadmin'
 */
export async function checkAdminAuth(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return { user: null, error: 'Unauthorized', status: 401 };
    }

    await connectToDB();
    const user = await User.findOne({ email: token.email }).select('role name email _id');

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return { user: null, error: 'Forbidden', status: 403 };
    }
    return { user, error: null, status: 200 };
}

/**
 * Checks for 'superadmin' ONLY
 */
export async function checkSuperAdminAuth(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return { user: null, error: 'Unauthorized', status: 401 };
    }

    await connectToDB();
    const user = await User.findOne({ email: token.email }).select('role name email _id');

    if (!user || user.role !== 'superadmin') {
        return { user: null, error: 'Forbidden', status: 403 };
    }
    return { user, error: null, status: 200 };
}