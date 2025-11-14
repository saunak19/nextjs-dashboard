import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

async function checkAdminAuth(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
        return { user: null, error: 'Unauthorized', status: 401 };
    }

    await connectToDB();
    const user = await User.findOne({ email: token.email });

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return { user: null, error: 'Forbidden', status: 403 };
    }
    return { user, error: null, status: 200 };
}

// Use this interface for params
interface RouteParams {
    params: {
        id: string;
    };
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const id = params.id;

    await connectToDB();

    const { user: adminUser, error, status } = await checkAdminAuth(req);
    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    try {
        const id = params.id;

        // Validate ID format
        if (!id || id === 'undefined' || id === 'null') {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        const { name, role } = await req.json();

        if (!name || !role) {
            return NextResponse.json({ message: 'Missing name or role' }, { status: 400 });
        }

        // Add better error handling for invalid ObjectId
        let userToUpdate;
        try {
            userToUpdate = await User.findById(id);
        } catch (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
        }

        console.log("User found:", userToUpdate);

        if (!userToUpdate) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (userToUpdate._id.toString() === adminUser._id.toString() && userToUpdate.role !== role) {
            return NextResponse.json({ message: 'You cannot change your own role.' }, { status: 403 });
        }

        userToUpdate.name = name;
        userToUpdate.role = role;
        await userToUpdate.save();

        const updatedUser = userToUpdate.toObject();
        delete updatedUser.password;

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error) {
        console.error("PATCH Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const id = params.id;
    await connectToDB();

    const { user: adminUser, error, status } = await checkAdminAuth(req);
    if (error) {
        return NextResponse.json({ message: error }, { status });
    }

    try {
        const id = params.id;

        // Validate ID format
        if (!id || id === 'undefined' || id === 'null') {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        if (id === adminUser._id.toString()) {
            return NextResponse.json({ message: 'You cannot delete your own account.' }, { status: 403 });
        }

        let userToDelete;
        try {
            userToDelete = await User.findById(id);
        } catch (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
        }

        if (!userToDelete) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await User.findByIdAndDelete(id);
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}