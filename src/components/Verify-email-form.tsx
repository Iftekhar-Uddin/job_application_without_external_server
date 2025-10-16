"use client"

import { newVerification } from "@/data/new-verification"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"


const NewVerifyEmailForm = () => {
    const [error, setError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<string | undefined>(undefined);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) {
            return
        }

        if (!token) {
            setError("No token provided")
            return
        }

        newVerification(token).then((data) => {
            if (data.success) {
                setSuccess(data.success)
            }
            if (data.error) {
                setError(data.error)
            }
        }).catch((error) => {
            console.error(error)
            setError("An unexpected error occurred")
        })

    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [])


    return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col gap-8 h-[300px] w-lg bg-amber-100 p-8 rounded-xl">
                <h1 className="text-2xl text-orange-500 font-semibold text-center mt-4">Confirming your email address</h1>
                <Link className="flex items-center justify-center text-2xl text-blue-500 underline" href="/auth/signin">Click to login</Link>
                <div className="flex items-center justify-center">
                    {success && !error && <p className="text-lg font-light text-emerald-600">{success}</p>}
                    {!success && error && <p className="text-lg font-light text-red-500">{error}</p>}
                </div>
            </div>
        </div>
    )
}

export default NewVerifyEmailForm