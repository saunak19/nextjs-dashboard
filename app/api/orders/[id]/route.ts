import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

        const order = await Order.findById(params.id).populate('user', 'name email');
        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Security Check:
        // Allow if user is admin OR if the order's user ID matches the logged-in user's ID
        if (user.role !== 'admin' && user.role !== 'superadmin' && order.user._id.toString() !== user._id.toString()) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(order, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}