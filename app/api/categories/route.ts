import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Category from '@/models/Category';
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

        let query = {};
        if (user.role === 'user') {
            query = { user: user._id };
        }

        const categories = await Category.find(query)
            .populate('parent', 'name')
            .sort({ name: 1 });

        return NextResponse.json(categories, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, parent } = await req.json();
        if (!name) {
            return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
        }

        await connectToDB();
        const user = await User.findOne({ email: token.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const existingCategory = await Category.findOne({ name, parent: parent || null, user: user._id });
        if (existingCategory) {
            return NextResponse.json({ message: 'Category already exists' }, { status: 409 });
        }

        const newCategory = new Category({
            name,
            parent: parent || null,
            user: user._id,
        });

        await newCategory.save();
        return NextResponse.json(newCategory, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}