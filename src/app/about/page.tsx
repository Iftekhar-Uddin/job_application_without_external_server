"use client"

import z from 'zod';
import { useRouter } from "next/navigation";
import { settings } from '@/actions/settings';
import { currentUserClient } from '@/hooks/currentUser';
import { SettingsFormSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { redirect } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
// import { useAppSelector } from '@/redux/store';


const settingsPage = () => {
  const router = useRouter();
  const user = currentUserClient()
  const [toggle, setToggle] = useState<boolean | undefined>(user?.isTwoFactorEnabled);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof SettingsFormSchema>>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: undefined,
      newPassword: undefined,
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined
    },
  });
  // const userData: any | null = useAppSelector((state) => state.authReducer.session);


  if (!user) {
    redirect("/auth/signin");
  }

  const onSubmit = (values: z.infer<typeof SettingsFormSchema>) => {
    console.log(values);

    settings(values).then((data) => {
      if (data.error) {
        setError(data.error)
      }

      if (data?.success) {
        setSuccess(data.success);
        reset();
      }
    }).catch(() => setError("Something went wrong!"));

    startTransition(() => {
      router.refresh()
    });
  };


  return (
    <div className='max-w-xl md:max-w-7xl mx-auto rounded-md sm:px-6 lg:px-0 md:h-[calc(100vh-10rem)]'>
      <div className='max-w-7xl ring-1 ring-orange-500 rounded-sm md:rounded-md p-2 md:p-4 flex flex-col space-y-2 md:space-y-0 lg:space-y-0 bg-amber-100'>
        <div className='flex px-8 lg:px-12 rounded-sm h-6 md:h-8 lg:h-12 mx-auto'>
          <h1 className='text-md md:text-lg lg:text-xl flex justify-center items-center mx-auto underline text-orange-500'>User Account Information</h1>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 md:mt-8 w-full h-full md:place-items-end lg:place-items-end lg:px-12 space-y-2 md:space-y-0 lg:space-y-0'>
          <div className="order-1 md:order-2 w-auto grid place-items-center md:place-items-end">
            {/* <p className='w-full bg-slate-100 px-2 py-2 border-1 text-lg rounded-lg'>Id: <span>{user?.id}</span></p> */}
            <p className=''><span><Image className='w-auto md:w-fit h-44' src={user?.image || 'https://www.baumandblume.com/wp-content/uploads/2017/02/no-image-icon-md.png'} height={650} width={366} alt="User Image" priority /></span></p>
          </div>
          <div className="order-2 md:order-1 w-fit lg:w-full gap-1 md:gap-2 grid mx-auto">
            <p className='w-full px-1 md:px-2 py-0.5 border-1 md:text-lg rounded-sm md:rounded-lg text-orange-500'>Name: <span>{user?.name}</span></p>
            <p className='w-full px-1 md:px-2 py-0.5 border-1 md:text-lg rounded-sm md:rounded-lg text-orange-500'>Email: <span>{user?.email}</span></p>
            <p className='w-full px-1 md:px-2 py-0.5 border-1 md:text-lg rounded-sm md:rounded-lg text-orange-500'>Role: <span>{user?.role}</span></p>
            <p className='w-full px-1 md:px-2 py-0.5 border-1 md:text-lg rounded-sm md:rounded-lg text-orange-500'>2FA status: <span>{user?.isTwoFactorEnabled ? "True" : "False"}</span></p>
          </div>
        </div>
      </div>
      <div className='grid grid-rows-1 gap-4 max-h-fit rounded-sm md:rounded-md p-4 ring-1 ring-amber-500 my-2 bg-amber-100'>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1 md:gap-2">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <label className="text-sm md:text-base font-bold md:font-semibold text-gray-700">
              User name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Enter your name"
              className="w-full px-1 md:px-2 py-1 md:py-1.5 border text-sm md:text-base border-gray-300 rounded-sm md:rounded-md focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-cyan-500"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          {!user?.isOAuth &&
            (<>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <label className="text-sm md:text-base font-bold md:font-semibold text-gray-700">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter user email"
                  className="w-full px-1 md:px-2 py-1 md:py-1.5 border text-sm md:text-base border-gray-300 rounded-sm md:rounded-md focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-cyan-500"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <label className="text-sm md:text-base font-bold md:font-semibold text-gray-700">
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Enter you password"
                  className="w-full px-1 md:px-2 py-1 md:py-1.5 border text-sm md:text-base border-gray-300 rounded-sm md:rounded-md focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-cyan-500"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <label className="text-sm md:text-base font-bold md:font-semibold text-gray-700">
                  New password
                </label>
                <input
                  {...register("newPassword")}
                  type="password"
                  placeholder="Minimum length 6 digit required"
                  className="w-full px-1 md:px-2 py-1 md:py-1.5 border text-sm md:text-base border-gray-300 rounded-sm md:rounded-md focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-cyan-500"
                />
                {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
              </div>
            </>)
          }
          <div className='flex gap-x-2 mt-2 items-center'>
            <label className="text-sm md:text-base font-bold md:font-semibold text-gray-700">User Role:</label>
            <div className='inline-flex w-36'>
              <input {...register('role')} type="radio" id="User" name="role" value="User" />
              <label htmlFor="User" className="px-2 text-sm md:text-md">User</label>
              <input {...register('role')} type="radio" id="Admin" name="role" value="Admin" />
              <label htmlFor="Admin" className="px-2 text-sm md:text-md">Admin</label>
            </div>
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>
          {!user?.isOAuth && (
            <div className="flex w-full justify-between items-center">
              <div>
                <label className="text-sm md:text-base font-bold md:font-semibold text-gray-700">
                  Two Factor Authentication
                </label>
                <p className='text-xs text-slate-500'>Enabled 2FA for your account</p>
              </div>
              <label htmlFor="toggle" className={`cursor-pointer relative w-10 h-5 rounded-full  ${toggle ? " bg-blue-200" : " bg-gray-300"} `} >
                <input
                  {...register("isTwoFactorEnabled")}
                  type="checkbox"
                  id="toggle"
                  className="hidden"
                />
                <span onClick={() => setToggle(!toggle)} className={`w-3/9 h-4/6 absolute rounded-full left-1.5 top-1 ${toggle ? " left-5.5 transition-all duration-300 bg-blue-600" : "bg-gray-700 transition-all duration-300"}`}></span>
              </label>
              {errors.isTwoFactorEnabled && <p className="text-red-500 text-sm">{errors.isTwoFactorEnabled.message}</p>}
            </div>
          )}
          <button type="submit" disabled={isPending} className="rounded-md w-full mt-1.5 md:mt-3 py-1 md:py-1.5 md:text-lg bg-orange-500 cursor-pointer md:font-semibold ">{isPending ? 'Updating...' : 'User Update'}</button>
          {error && <p className="text-red-500 text-sm mx-auto justify-center">{error}</p>}
          {success && <p className="text-emerald-600 text-sm mx-auto justify-center md:font-semibold">{success}</p>}
        </form>
      </div>
    </div>

  )
}

export default settingsPage;