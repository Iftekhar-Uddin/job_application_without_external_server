"use client"

import { getCsrfToken, getSession, useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from 'react-hot-toast';
import { login } from '@/actions/login';
import { loginFormSchema } from '@/schemas';
import Link from 'next/link';


const Signin = ({ csrfToken }: { csrfToken: string }) => {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email already in use with different Provider" : "Account linking problem occured";
  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    setIsSubmitting(true);
    await login(data, callbackUrl).then((res) => {
      if (res?.credentialsSuccess) {
        window.location.reload();
        setIsSubmitting(false);
      }
      if (res?.error) {
        reset();
        setError(res?.error)
        setIsSubmitting(false);
      }

      if (res?.success) {
        reset();
        setSuccess(res?.success)
        setIsSubmitting(false);
        toast.success("Login Successfull")
        return true
      }

      if (res?.twoFactor) {
        setShowTwoFactor(true)
        setIsSubmitting(false);
        return false
      }
    }).catch(() => setError("Something went wrong"));

    setIsSubmitting(false);
  }

  return (
    <div className="grid grid-rows-1 mb-3 md:mb-0 gap-1 max-h-fit md:w-96 bg-white/0 md:rounded-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        {showTwoFactor ? (
          <>
            <h1 className='text-center mx-auto text-slate-700 font-semibold mt-2'>Two Factor Verification!</h1>
            <div className="flex flex-col gap-2">
              <label className="text-sm md:text-base">
                2FA Code
              </label>
              <input
                {...register("code")}
                type="number"
                placeholder="Enter your code"
                className="w-full px-2 md:px-4 py-2 border text-sm md:text-base border-slate-500 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-slate-500"
              />
              {/* {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>} */}
            </div>
            <span className='text-emerald-500 bg-green-50/50 rounded-md text-center px-6 py-1'>A code has been sent your Email</span>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center ${isSubmitting ? "py-3 md:py-4" : "py-1.5 md:py-2 cursor-pointer disabled:cursor-not-allowed"} mt-0.5 md:text-lg bg-slate-900 text-white rounded-md transition-all`}
            >
              {isSubmitting ? (
                <span className="flex space-x-1.5">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-bounce"></span>
                </span>
              ) : (
                'Confirm'
              )}
            </button>
          </>
        ) : (
          <>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <div className="flex flex-col gap-1">
              <label className="text-sm md:text-base font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border text-sm md:text-base border-slate-700 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-1 focus:ring-slate-500"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm md:text-base font-medium text-gray-700">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border text-sm md:text-base border-slate-700 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-1 focus:ring-slate-500"
              />
              <Link className='text-orange-500 text-sm' href="/auth/reset">Forgot password?</Link>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            {error && <div className='flex items-center justify-center'><p className="text-red-600 bg-red-200 rounded-md text-center px-6 py-1">{error || urlError}</p></div>}
            {success && <div className='flex items-center justify-center'><p className="text-emerald-600 bg-emerald-200 rounded-md text-center px-6 py-1">{success}</p></div>}
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
                'Sign In'
              )}
            </button>
          </>
        )}
      </form>
      <div className="flex min-w-full justify-center">
        <p className="w-full text-xs md:text-sm text-end text-gray-600">
          Don't have an account?&nbsp;
          <a href="/auth/register" className="text-blue-600 hover:text-indigo-500">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  )
}
export default Signin;

export const getServerSideProps: GetServerSideProps = async () => {
  const csrfToken = await getCsrfToken();
  return {
    props: {
      csrfToken,
    },
  };
};
