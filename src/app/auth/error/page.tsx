"use client"
import { useRouter } from "next/navigation"; 
import React from 'react'

const AuthErrorPage = () => {
    const router = useRouter();

    return (
        <div className="max-w-xl mx-auto bg-white rounded-sm md:rounded-lg h-72 p-8">
            <div className="flex flex-col justify-center items-center py-12 gap-6">
                <h1 className="text-orange-500 text-xl md:text-3xl">Oops! Something went wrong!</h1>
                <button className="px-3 md:text-xl font-semibold rounded-full py-1 mx-auto text-white bg-cyan-800 cursor-pointer" onClick={()=> router.push("/auth/signin")}>Back to login</button>
            </div>


        </div>
    )
}

export default AuthErrorPage