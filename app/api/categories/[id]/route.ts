import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import Category from '@/models/Category';
import User from '@/models/User';
import Product from '@/models/Product';

async function getUserAndCategory(req: NextRequest, categoryId: string) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return { user: null, category: null, error: 'Unauthorized', status: 401 };
    }

    await connectToDB();

    const user = await User.findOne({ email: token.email });
    if (!user) {
        return { user: null, category: null, error: 'User not found', status: 404 };
    }

    const category = await Category.findById(categoryId);
    if (!category) {
        return { user, category: null, error: 'Category not found', status: 404 };
    }

    if (category.user.toString() !== user._id.toString() && user.role === 'user') {
        return { user, category, error: 'Forbidden', status: 403 };
    }

    return { user, category, error: null, status: 200 };
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { category, error, status } = await getUserAndCategory(req, id);

    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    return NextResponse.json(category, { status: 200 });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { user, category, error, status } = await getUserAndCategory(req, id);

    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    const { name, parent } = await req.json();

    if (!name) {
        return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    try {
        const existingCategory = await Category.findOne({
            name,
            parent: parent || null,
            user: category.user,
            _id: { $ne: id }
        });

        if (existingCategory) {
            return NextResponse.json({ message: 'Category name already exists' }, { status: 409 });
        }

        if (parent === id) {
            return NextResponse.json({ message: 'Category cannot be its own parent' }, { status: 400 });
        }

        category.name = name;
        category.parent = parent || null;

        await category.save();
        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { category, error, status } = await getUserAndCategory(req, id);

    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    try {
        const subcategories = await Category.find({ parent: id });
        if (subcategories.length > 0) {
            await Category.updateMany(
                { parent: id },
                { $set: { parent: null } }
            );
        }

        const productsWithCategory = await Product.find({ categories: id });
        if (productsWithCategory.length > 0) {
            const productNames = productsWithCategory.slice(0, 5).map(p => p.name);
            const productCount = productsWithCategory.length;

            return NextResponse.json({
                message: `Cannot delete category. It is currently used by ${productCount} product(s).`,
                details: {
                    productCount,
                    productNames,
                    totalProducts: productCount
                }
            }, { status: 400 });
        }

        await Category.findByIdAndDelete(id);

        return NextResponse.json({
            message: 'Category deleted successfully'
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}