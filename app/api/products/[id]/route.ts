import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Category from '@/models/Category';

async function getUserAndProduct(req: NextRequest, productId: string) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return { user: null, product: null, error: 'Unauthorized', status: 401 };
    }

    await connectToDB();

    const user = await User.findOne({ email: token.email });
    if (!user) {
        return { user: null, product: null, error: 'User not found', status: 404 };
    }

    const product = await Product.findById(productId).populate('categories');
    if (!product) {
        return { user, product: null, error: 'Product not found', status: 404 };
    }

    if (product.user.toString() !== user._id.toString() && user.role === 'user') {
        return { user, product, error: 'Forbidden', status: 403 };
    }

    return { user, product, error: null, status: 200 };
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    const { product, error, status } = await getUserAndProduct(req, id);
    console.log(product);

    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    return NextResponse.json(product, { status: 200 });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    const { user, product, error, status } = await getUserAndProduct(req, id);
    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    const { name, description, price, sku, stockQuantity, categories } = await req.json();

    if (!name || !description || !price || !sku || !stockQuantity || !categories) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
        return NextResponse.json({ message: 'Categories must be a non-empty array' }, { status: 400 });
    }

    const existingCategories = await Category.find({
        _id: { $in: categories },
    });

    if (existingCategories.length !== categories.length) {
        return NextResponse.json({
            message: 'Invalid categories provided'
        }, { status: 400 });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.sku = sku;
    product.stockQuantity = stockQuantity;
    product.categories = categories;

    await product.save();

    return NextResponse.json(product, { status: 200 });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    const { product, error, status } = await getUserAndProduct(req, id);
    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
}