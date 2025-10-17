"use client"

import { setSession } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Notification from "./Notification";
import { currentUserClient } from "@/hooks/currentUser";



const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const currentUser = currentUserClient();

  useEffect(() => {
    dispatch(setSession(session?.user as any));
  }, []);

  const handleToggleMenu = () => setIsOpen((prev) => !prev);

  // Close navbar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);





  return (
    <nav className="mx-auto bg-amber-100 max-w-7xl ring-1 ring-orange-500 rounded-sm md:rounded-lg h-10 md:h-14 sticky top-0 z-10">
      <div className="flex w-full h-full justify-center items-center px-6">

        <div className="flex items-center justify-between w-full">

          <Link onClick={() => setIsOpen(false)} href={"/"} className="flex items-center gap-1 md:gap-2">
            <Image
              className="w-auto"
              src={"/job.png"}
              alt="Job logo"
              height={32}
              width={32}
            />
            <span className="md:text-lg lg:text-xl font-semibold text-orange-500">
              Job Board
            </span>
          </Link>

          <div ref={navRef} className="flex gap-6 md:gap-4 justify-center items-center">

            {session && <Notification />}

            <button onClick={handleToggleMenu} className="cursor-pointer bg-transparent md:hidden block border-0 z-10">
              <span className={`${isOpen ? "first:transform translate-y-2 rotate-45 bg-orange-500" : ""} block w-6 h-1 my-1 md:bg-orange-500 transition ease-in-out duration-300 bg-orange-500`}></span>
              <span className={`${isOpen ? "even:opacity-0" : ""} block w-6 h-1 my-1 mt-auto md:bg-orange-500 transition ease-in-out duration-300 bg-orange-500`}></span>
              <span className={`${isOpen ? "last:transform -translate-y-2 -rotate-45 bg-orange-500" : ""} block w-6 h-1 my-1 md:bg-orange-500 transition ease-in-out duration-300 bg-orange-500`}></span>
            </button>

            <ul className={`flex flex-col md:flex-row gap-3 md:gap-4 items-center rounded-sm absolute md:static top-10.5 right-0 w-48 md:w-auto bg-amber-100 md:bg-transparent py-2 md:py-0 px-2 md:px-0 shadow-md md:shadow-none transition-all ease-in-out duration-400 ${isOpen ? 'top-10' : 'top-[-490px]'}`}>
              {!session ? (
                <>
                  <Link onClick={handleToggleMenu} href={"/jobs"} className="text-orange-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 transition ease-in-out duration-300 hover:bg-orange-400 hover:text-black cursor-pointer">Browse Jobs</Link>
                  <Link onClick={handleToggleMenu} href={"/auth/signin"} className="text-orange-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 transition ease-in-out duration-300 hover:bg-orange-400 hover:text-black cursor-pointer">Sign In</Link>
                </>
              ) : (
                <>
                  {/* {!isOpen && <Notification/>} */}
                  <Link onClick={handleToggleMenu} href={"/jobs"} className="text-orange-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 transition ease-in-out duration-300 hover:bg-orange-400 hover:text-black cursor-pointer">Browse Jobs</Link>
                  <Link onClick={handleToggleMenu} href={"/jobs/post"} className="text-orange-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 transition ease-in-out duration-300 hover:bg-orange-400 hover:text-black cursor-pointer">Post a job</Link>
                  <Link onClick={handleToggleMenu} href={"/dashboard"} className="text-orange-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 transition ease-in-out duration-300 hover:bg-orange-400 hover:text-black cursor-pointer">Dashboard</Link>
                  <Link onClick={handleToggleMenu} href={"/about"} className="text-orange-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 transition ease-in-out duration-300 hover:bg-orange-400 hover:text-black cursor-pointer">About</Link>
                  <button onClick={() => { signOut(); router.push("/"); handleToggleMenu() }} className="text-orange-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 transition ease-in-out duration-300 hover:bg-orange-400 hover:text-black cursor-pointer">Sign Out</button>
                </>
              )}
            </ul>
          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;