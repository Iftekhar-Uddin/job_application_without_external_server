"use client";

import Link from "next/link";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { registers } from "@/actions/register";
import toast from "react-hot-toast";


const FormSchema = z.object({
    name: z.string().nonempty("Username is required").min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    email: z.string().nonempty("Email is required").min(1, "Email is required").max(50, "Email must be less than 50 characters").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { data: session, status } = useSession();
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    if (session) {
        redirect("/")
    }

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setLoading(true)
        await registers(data).then((res) => {
            if (res?.error) {
                setError(res.error)
                setLoading(false)
            }
            if (res.success) {
                setSuccess(res.success)
                toast.success("User created successfully!");
                setLoading(false);
                window.location.href = '/auth/signin';
            }
        })
    };

    return (

        <div className="grid grid-rows-1 mb-3 md:mb-0 gap-1 max-h-fit md:w-96 md:rounded-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        {...register("name", { required: "Name is required" })}
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2 border text-sm md:text-base border-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:orange-500"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base font-medium text-gray-700">
                        Email address
                    </label>
                    <input
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                            },
                        })}
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border text-sm md:text-base border-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:orange-500"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                            },
                        })}
                        type="password"
                        placeholder="Create a password"
                        className="w-full px-4 py-2 border text-sm md:text-base border-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:orange-500"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <input
                        {...register("confirmPassword", {
                            required: "Please confirm your password",
                        })}
                        type="password"
                        placeholder="Confirm your password"
                        className="w-full px-4 py-2 border text-sm md:text-base border-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:orange-500"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                </div>

                {error && (
                    <div className="flex items-center justify-center">
                        <p className="text-red-600 bg-red-200 rounded-md text-center px-6 py-1">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="flex items-center justify-center">
                        <p className="text-emerald-500 bg-green-50/50 rounded-md text-center px-6 py-1">{success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center justify-center ${isSubmitting ? "py-3 md:py-4" : "py-1.5 md:py-2 cursor-pointer disabled:cursor-not-allowed"} mt-0.5 md:text-lg bg-slate-700 hover:bg-black text-white rounded-md transition-all`}
                >
                    {isSubmitting ? (
                        <span className="flex space-x-1.5">
                            <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-bounce"></span>
                        </span>
                    ) : (
                        "Register"
                    )}
                </button>
            </form>

            <div className="flex min-w-full justify-center">
                <p className="w-full text-xs md:text-sm text-end text-gray-600">
                    Already have an account?&nbsp;
                    <Link href="/auth/login" className="text-blue-600 hover:text-indigo-500">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>

    );
};
export default SignUp;

