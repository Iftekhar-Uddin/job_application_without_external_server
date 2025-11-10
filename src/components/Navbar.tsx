"use client";

import { setSession } from "@/redux/authSlice/authSlice";
import { AppDispatch } from "@/redux/store";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Notification from "./Notification";
import { currentUserClient } from "@/hooks/currentUser";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = currentUserClient();

  useEffect(() => {
    dispatch(setSession(session?.user as any));
  }, [session]);

  const handleToggleMenu = () => setIsOpen((prev) => !prev);
  const handleToggleDropdown = () => setDropdownOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <nav className="mx-auto bg-white/70 max-w-7xl ring-1 ring-slate-500 rounded-sm md:rounded-lg h-10 md:h-14 sticky top-0 z-10">
      <div className="flex w-full h-full justify-center items-center px-6">
        <div className="flex items-center justify-between w-full">

          <Link
            onClick={() => setIsOpen(false)}
            href="/"
            className="flex items-center gap-1 md:gap-2"
          >
            <Image
              className="w-auto"
              src="/job.png"
              alt="Job logo"
              height={32}
              width={32}
            />
            <span className="md:text-lg lg:text-xl font-semibold text-slate-600">
              Job Board
            </span>
          </Link>


          <div ref={navRef} className="flex gap-6 md:gap-4 items-center">
            
            {session && <Notification />}

            <button
              onClick={handleToggleMenu}
              className="cursor-pointer bg-transparent md:hidden block border-0 z-10"
            >
              <span
                className={`${isOpen ? "first:transform translate-y-2 rotate-45 bg-slate-500" : "bg-slate-500"
                  } block w-6 h-1 my-1 transition ease-in-out duration-300 `}
              ></span>
              <span
                className={`${isOpen ? "even:opacity-0" : ""
                  } block w-6 h-1 my-1 transition ease-in-out duration-300 bg-slate-500`}
              ></span>
              <span
                className={`${isOpen ? "last:transform -translate-y-2 -rotate-45 bg-slate-500" : "bg-slate-500"
                  } block w-6 h-1 my-1 transition ease-in-out duration-300 `}
              ></span>
            </button>


            <ul
              className={`flex flex-col md:flex-row gap-2 md:gap-4 items-center rounded-md absolute md:static top-10.5 right-0 w-48 md:w-auto bg-white md:bg-transparent  py-2 md:py-0 px-2 md:px-0 shadow-md md:shadow-none transition-all ease-in-out duration-400 ${isOpen ? "top-10" : "top-[-490px]"
                }`}
            >
              {!session ? (
                <>
                  <Link
                    onClick={handleToggleMenu}
                    href="/jobs"
                    className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
                  >
                    Browse Jobs
                  </Link>
                  <Link
                    onClick={handleToggleMenu}
                    href="/auth/signin"
                    className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    onClick={handleToggleMenu}
                    href="/jobs"
                    className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
                  >
                    Browse Jobs
                  </Link>
                  <Link
                    onClick={handleToggleMenu}
                    href="/jobs/post"
                    className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
                  >
                    Post a Job
                  </Link>
                  <Link
                    onClick={handleToggleMenu}
                    href="/dashboard"
                    className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    onClick={handleToggleMenu}
                    href="/contact"
                    className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
                  >
                    Contact
                  </Link>
                  {/* {currentUser?.role === "Admin" && (
                    <Link
                      onClick={handleToggleMenu}
                      href="/about"
                      className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
                    >
                      About
                    </Link>
                  )} */}

                  <div ref={dropdownRef} className="relative hidden md:block">
                    <button
                      onClick={handleToggleDropdown}
                      className="w-9 h-9 flex rounded-full overflow-hidden border border-slate-500 cursor-pointer"
                    >
                      <Image
                        src={session.user?.image || "https://icon-library.com/images/no-profile-pic-icon/no-profile-pic-icon-11.jpg"}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-center"
                      />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          className="absolute text-center -right-6 mt-3 w-36 bg-white shadow-lg rounded-md z-20"
                        >
                          <Link
                            onClick={() => { handleToggleMenu; handleToggleDropdown() }}
                            href="/profile"
                            className="block px-4 py-2 text-slate-500 hover:bg-slate-100"
                          >
                            Profile
                          </Link>
                          {session.user?.role === "Admin" && (
                            <Link
                              onClick={() => { handleToggleMenu; handleToggleDropdown() }}
                              href="/admin"
                              className="block px-4 py-2 text-slate-500 hover:bg-slate-100"
                            >
                              Admin
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleToggleDropdown();
                              signOut();
                              router.push("/");
                            }}
                            className="w-full text-center px-4 py-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
                          >
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex text-center gap-1.5 flex-col md:hidden">
                    <Link
                      onClick={handleToggleMenu}
                      href="/profile"
                      className="text-slate-500 px-3 py-0 hover:bg-slate-400 hover:text-black cursor-pointer transition rounded-full"
                    >
                      Profile
                    </Link>
                    {session.user?.role === "Admin" && (
                      <Link
                        onClick={handleToggleMenu}
                        href="/admin"
                        className="text-slate-500 px-3 py-0 hover:bg-slate-400 hover:text-black cursor-pointer transition rounded-full"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        router.push("/");
                      }}
                      className="text-slate-500 mx-auto px-3 py-0 hover:bg-slate-400 hover:text-black cursor-pointer transition rounded-full"
                    >
                      Logout
                    </button>
                  </div>
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