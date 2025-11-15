import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs"; // <-- You can remove this import

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log("REQUEST BODY:", body);

        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, Password, and Name are required" },
                { status: 400 }
            );
        }
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?!.*\s).{8,}$/;

        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character" },
                { status: 400 }
            );
        }

        await connectToDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "User already register" },
                { status: 400 }
            );
        }

        // const hashedPassword = await bcrypt.hash(password, 10); // <-- DELETE THIS LINE

        await User.create({
            email,
            password: password, // <-- PASS THE PLAIN PASSWORD
            name,
        });

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Register Error:", err);
        return NextResponse.json(
            { error: "Failed to register" },
            { status: 500 }
        );
    }
}