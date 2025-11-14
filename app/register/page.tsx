"use client";

import { useRouter } from "next/navigation";
// <-- IMPORT React
import React, { useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, CircleX } from "lucide-react";

function RegisterPage() {
    const [name, setName] = useState(""); // <-- ADD NAME STATE
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // ✅ Same toast styles as LoginPage
    const showToast = (message: string, type: "success" | "error") => {
        // ... (your toast function is perfect, no changes needed)
        const isSuccess = type === "success";

        toast(
            <div
                className={`flex items-center gap-3 py-3 px-5 rounded-md shadow-md 
        ${isSuccess ? "bg-[#008000]" : "bg-[#ED4337]"} 
        text-white transition-all duration-500 ease-out`}
            >
                {isSuccess ? (
                    <CheckCircle className="text-white flex-shrink-0" size={20} />
                ) : (
                    <CircleX className="text-white flex-shrink-0" size={20} />
                )}
                <p className="font-semibold text-sm ">{message}</p>
            </div>,
            {
                icon: false,
                closeButton: false,
                autoClose: 4000,
                hideProgressBar: true,
                theme: "dark",
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast("Passwords do not match!", "error");
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // <-- ADD NAME TO THE BODY
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            showToast("Registration successful! Redirecting to login...", "success");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error) {
            showToast((error as Error).message || "An unknown error occurred", 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#22252F] text-gray-100 p-4">

            {/* ✅ ToastContainer same as LoginPage */}
            <ToastContainer
                // ... (no changes needed here)
                position="top-center"
                autoClose={4000}
                hideProgressBar
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="dark"
                closeButton={false}
                toastClassName={() =>
                    "rounded-xl bg-[#272727] text-gray-100 shadow-lg border border-neutral-800 backdrop-blur-sm transition-all duration-500 ease-out"
                }
                bodyClassName={() =>
                    "text-sm font-medium font-sans tracking-wide leading-relaxed"
                }
            />

            <div className="w-full max-w-md p-4">
                <h2
                    className="relative font-serif text-5xl font-semibold text-center mb-12 
    text-gray-100 tracking-wide 
    before:content-[''] before:absolute before:left-1/2 before:-bottom-3 
    before:w-20 before:h-[2px] before:bg-gray-400 before:rounded-full before:-translate-x-1/2 
    transition-all duration-500 ease-out hover:text-white hover:before:w-28 fadeIn"
                >
                    Register
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6  p-5 rounded-md ">

                    {/* <-- ADD NAME INPUT FIELD BLOCK --> */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-400 focus:outline-none rounded-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-100 placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-400 focus:outline-none rounded-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-100 placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-400 focus:outline-none rounded-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-100 placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-400 focus:outline-none rounded-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-100 placeholder-gray-500"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full p-3 bg-white text-slate-900 rounded-none hover:cursor-pointer font-semibold text-lg hover:bg-gray-200 transition-colors duration-300 shadow-md"
                        >
                            Register
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-400 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;