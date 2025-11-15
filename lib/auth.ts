    import { NextAuthOptions } from "next-auth";
    import CredentialsProvider from "next-auth/providers/credentials";
    import { connectToDB } from "./db";
    import bcrypt from "bcryptjs";
    import User from "@/models/User";

    export const authOptions: NextAuthOptions = {
        providers: [
            CredentialsProvider({
                name: "Credentials",
                credentials: {
                    email: { label: "Email", type: "text" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Missing email or password");
                    }

                    try {
                        await connectToDB();
                        const user = await User.findOne({ email: credentials.email });

                        if (!user) {
                            throw new Error("No user found with this email"); // Fixed typo
                        }

                        const isValid = await bcrypt.compare(
                            credentials.password,
                            user.password
                        );

                        if (!isValid) {
                            throw new Error("Invalid Password");
                        }

                        // <-- UPDATE THE RETURNED OBJECT
                        return {
                            id: user._id.toString(),
                            email: user.email,
                            name: user.name,
                            role: user.role // <-- ADD ROLE
                        };
                    } catch (err) {
                        console.log("Auth error: ", err);
                        throw err;
                    }
                },
            })
        ],
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    // <-- ADD ROLE AND ID TO TOKEN
                    // Note: `user` object comes from the `authorize` callback
                    token.id = user.id;
                    token.role = user.role;
                }
                return token;
            },
            async session({ session, token }) {
                if (session.user) {
                    // <-- ADD ROLE AND ID TO SESSION
                    // `token` object comes from the `jwt` callback
                    session.user.id = token.id;
                    session.user.role = token.role;
                }
                return session;
            },
        },
        pages: {
            signIn: "/login",
            error: "/login"
        },
        session: {
            strategy: "jwt",
            maxAge: 30 * 24 * 60 * 60,
        },
        secret: process.env.NEXTAUTH_SECRET
    };