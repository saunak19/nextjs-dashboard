import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Order from '@/models/Order';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDB();
        const order = await Order.findById(params.id);

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // This route can be called by anyone logged in, but we'll add admin-only routes for "deliver"
        // In a real app, you'd have more security here from the payment provider

        const paymentResult = await req.json();

        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
            id: paymentResult.id,
            status: paymentResult.status,
            update_time: paymentResult.update_time,
            email_address: paymentResult.payer.email_address,
        };

        const updatedOrder = await order.save();
        return NextResponse.json(updatedOrder, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}