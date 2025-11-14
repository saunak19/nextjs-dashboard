import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Category from '@/models/Category';

export async function POST(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, sku, stockQuantity, categories } = await req.json();

    if (!name || !description || !price || !sku || !stockQuantity || !categories) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
        return NextResponse.json({ message: 'Categories must be a non-empty array' }, { status: 400 });
    }

    try {
        await connectToDB();

        const user = await User.findOne({ email: token.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const existingProduct = await Product.findOne({ sku: sku, user: user._id });
        if (existingProduct) {
            return NextResponse.json({ message: 'SKU already exists' }, { status: 409 });
        }

        // Validate categories
        const userCategories = await Category.find({
            _id: { $in: categories },
            user: user._id
        });

        if (userCategories.length !== categories.length) {
            return NextResponse.json({
                message: 'Invalid categories provided'
            }, { status: 400 });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            sku,
            stockQuantity,
            user: user._id,
            categories: categories,
        });

        console.log('✅ Product before save:', newProduct);
        await newProduct.save();

        // Verify save
        const savedProduct = await Product.findById(newProduct._id);
        console.log('✅ Product after save:', savedProduct);

        return NextResponse.json(savedProduct, { status: 201 });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}