import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDB();
        const user = await User.findOne({ email: token.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
        return NextResponse.json(orders, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}