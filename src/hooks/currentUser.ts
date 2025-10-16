import { useSession } from "next-auth/react";

export const currentUserClient = () => {
    const session = useSession();
    return session.data?.user
}