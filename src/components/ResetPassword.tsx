"use client"

import { useSession } from 'next-auth/react';
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  useState } from "react";
import { ResetFormSchema } from '@/schemas';
import Link from 'next/link';
import { reset } from '@/actions/reset';



const ResetPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, update } = useSession();



  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof ResetFormSchema>>({
    resolver: zodResolver(ResetFormSchema),
    defaultValues: {
      email: ""
    },
  });


  const onSubmit = async (data: z.infer<typeof ResetFormSchema>) => {

    setIsSubmitting(true);
    await reset(data).then((res) => {
      if (res?.error) {
        setError(res?.error);
      } else {
        setSuccess(res?.success as string)
      }
    });

    setIsSubmitting(false);

  };


  return (
    <div className="flex justify-center items-center min-h-[500px]">
      <div className="grid grid-rows-1 md:gap-4 max-h-fit w-sm md:w-md bg-white/70 p-4 md:p-8 rounded-md md:rounded-xl">
        <h1 className='flex text-center mx-auto text-slate-700 md:text-2xl font-semibold text-lg mb-4'>Forgot your Password?</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1 md:gap-2">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <label className="text-sm md:text-base font-bold md:font-semibold text-gray-700">
              Email address
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="w-full px-1 md:px-2 py-1 md:py-1.5 border text-sm md:text-base border-slate-500 rounded-sm md:rounded-md focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-slate-700"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <button type="submit" className="rounded-md w-full mt-1.5 md:mt-3 py-1 md:py-2.5 md:text-lg bg-black text-white cursor-pointer">{isSubmitting ? 'Sending...' : 'Send reset email'}</button>
          {error && <p className="text-red-500 text-sm mx-auto justify-center">{error}</p>}
          {success && <p className="text-emerald-600 text-sm mx-auto justify-center md:font-semibold">{success}</p>}

        </form>
        <Link href="/auth/signin" className="text-center mx-auto w-full text-sm md:text-base cursor-pointer mt-3 md:mt-2">Back to login</Link>
      </div>
    </div>

  )
}
export default ResetPassword;