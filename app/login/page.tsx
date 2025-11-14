"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX, LoaderCircle, Loader, CheckCircle } from "lucide-react";


function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const showToast = (message: string, type: "success" | "error") => {
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
        setIsLoading(true);

        const result = await signIn("credentials", { email, password, redirect: false });

        if (result?.error) {
            console.log(result.error);
            showToast(result.error, "error");
            setIsLoading(false);
        } else {
            showToast("Successfully logged in!", "success");
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#22252F] text-gray-100 p-4">
            <ToastContainer
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
                    " rounded-xl bg-[#272727] text-gray-100 shadow-lg border border-neutral-800 backdrop-blur-sm transition-all duration-500 ease-out"
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
                    Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6  p-5">
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
                            className="w-full p-3 border border-gray-50 focus:outline-none rounded-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-100 placeholder-gray-400"
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

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full p-3 bg-white text-slate-900 rounded-none hover:cursor-pointer  font-semibold text-lg 
  hover:bg-gray-200 transition-colors duration-300 shadow-md flex justify-center items-center gap-2
  ${isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
                        >
                            {isLoading ? (
                                <>
                                    {/* <LoaderCircle className="animate-spin text-slate-900" size={20} /> */}
                                    <Loader className="animate-spin text-slate-900" size={20} />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">
                        Don't have an account?{` `}
                        <Link href="/register" className="text-blue-400 hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage