import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { checkAdminAuth } from '@/lib/api-auth'; // We'll use this for GET

export async function POST(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = await req.json();

        if (!orderItems || orderItems.length === 0) {
            return NextResponse.json({ message: 'No order items' }, { status: 400 });
        }

        await connectToDB();
        const user = await User.findOne({ email: token.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const order = new Order({
            user: user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
        });

        const createdOrder = await order.save();

        // After creating the order, update the stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stockQuantity -= item.qty;
                await product.save();
            }
        }

        return NextResponse.json(createdOrder, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // This gets ALL orders for an admin
    const { user, error, status } = await checkAdminAuth(req);
    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}