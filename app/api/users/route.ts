import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { checkSuperAdminAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    const { user, error, status } = await checkSuperAdminAuth(req);
    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    try {
        await connectToDB();
        const currentUser = await User.findOne({ email: token.email });

        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json(users, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}