"use client";

import { setSession } from "@/redux/authSlice/authSlice";
import { AppDispatch } from "@/redux/store";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Notification from "./Notification";
import { currentUserClient } from "@/hooks/currentUser";
import { 
  Briefcase, 
  PlusCircle, 
  LayoutDashboard, 
  Contact, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Search,
  Building
} from "lucide-react";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = currentUserClient();

  useEffect(() => {
    dispatch(setSession(session?.user as any));
  }, [session]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setDropdownOpen(false);
  };

  const navItems = [
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/jobs/post", label: "Post a Job", icon: PlusCircle },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contact", label: "Contact", icon: Contact },
  ];

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0 },
  };

  const isActiveRoute = (path: string) => pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50" 
          : "bg-white/90 backdrop-blur-md border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                CareerConnect
              </span>
              <span className="text-xs text-gray-500 font-medium">by JobBoard</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {session ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        isActiveRoute(item.href)
                          ? "text-blue-600 bg-blue-50 shadow-sm"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            ) : (
              <>
                <Link
                  href="/jobs"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <Briefcase size={18} />
                  <span>Browse Jobs</span>
                </Link>
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Section - Notification & Profile */}
          <div className="flex items-center space-x-3">
            {session && (
              <>
                <Notification />
                
                {/* Profile Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={handleToggleDropdown}
                    className="flex items-center space-x-3 p-1 rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Image
                          src={session.user?.image || "https://icon-library.com/images/no-profile-pic-icon/no-profile-pic-icon-11.jpg"}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-xl border-2 border-gray-200 group-hover:border-blue-200 transition-colors duration-200"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-semibold text-gray-900">
                          {session.user?.name?.split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {session.user?.role?.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-400 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`} 
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-sm font-semibold text-gray-900">
                            {session.user?.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {session.user?.email}
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User size={18} />
                          <span>Profile</span>
                        </Link>

                        {session.user?.role === "Admin" && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Settings size={18} />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                          >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={handleToggleMenu}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              {isOpen ? (
                <X size={24} className="text-gray-600" />
              ) : (
                <Menu size={24} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white/95 backdrop-blur-lg shadow-xl z-50 md:hidden border-l border-gray-200/50"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={session?.user?.image || "https://icon-library.com/images/no-profile-pic-icon/no-profile-pic-icon-11.jpg"}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-xl border-2 border-gray-200"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {session?.user?.name || "Welcome"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session?.user?.email || "Guest"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 p-6 space-y-2">
                  {session ? (
                    <>
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                              isActiveRoute(item.href)
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <Icon size={20} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}

                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200"
                        >
                          <User size={20} />
                          <span>Profile Settings</span>
                        </Link>

                        {session.user?.role === "Admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 p-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200"
                          >
                            <Settings size={20} />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 w-full p-3 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        >
                          <LogOut size={20} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/jobs"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200"
                      >
                        <Briefcase size={20} />
                        <span>Browse Jobs</span>
                      </Link>
                      <Link
                        href="/auth/signin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200"
                      >
                        <User size={20} />
                        <span>Sign In</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100">
                  <div className="text-center text-sm text-gray-500">
                    © 2025 Iftekhar Uddin. All rights reserved.
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;


















// "use client";

// import { setSession } from "@/redux/authSlice/authSlice";
// import { AppDispatch } from "@/redux/store";
// import { signOut, useSession } from "next-auth/react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import { useDispatch } from "react-redux";
// import { motion, AnimatePresence } from "framer-motion";
// import Notification from "./Notification";
// import { currentUserClient } from "@/hooks/currentUser";

// const Navbar = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [isOpen, setIsOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const navRef = useRef<HTMLDivElement>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const currentUser = currentUserClient();

//   useEffect(() => {
//     dispatch(setSession(session?.user as any));
//   }, [session]);

//   const handleToggleMenu = () => setIsOpen((prev) => !prev);
//   const handleToggleDropdown = () => setDropdownOpen((prev) => !prev);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (navRef.current && !navRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const dropdownVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -10 },
//   };

//   return (
//     <nav className="mx-auto bg-white/70 max-w-7xl ring-1 ring-slate-500 rounded-sm md:rounded-lg h-10 md:h-14 sticky top-0 z-10">
//       <div className="flex w-full h-full justify-center items-center px-6">
//         <div className="flex items-center justify-between w-full">

//           <Link
//             onClick={() => setIsOpen(false)}
//             href="/"
//             className="flex items-center gap-1 md:gap-2"
//           >
//             <Image
//               className="w-auto"
//               src="/job.png"
//               alt="Job logo"
//               height={32}
//               width={32}
//             />
//             <span className="md:text-lg lg:text-xl font-semibold text-slate-600">
//               Job Board
//             </span>
//           </Link>


//           <div ref={navRef} className="flex gap-6 md:gap-4 items-center">
            
//             {session && <Notification />}

//             <button
//               onClick={handleToggleMenu}
//               className="cursor-pointer bg-transparent md:hidden block border-0 z-10"
//             >
//               <span
//                 className={`${isOpen ? "first:transform translate-y-2 rotate-45 bg-slate-500" : "bg-slate-500"
//                   } block w-6 h-1 my-1 transition ease-in-out duration-300 `}
//               ></span>
//               <span
//                 className={`${isOpen ? "even:opacity-0" : ""
//                   } block w-6 h-1 my-1 transition ease-in-out duration-300 bg-slate-500`}
//               ></span>
//               <span
//                 className={`${isOpen ? "last:transform -translate-y-2 -rotate-45 bg-slate-500" : "bg-slate-500"
//                   } block w-6 h-1 my-1 transition ease-in-out duration-300 `}
//               ></span>
//             </button>


//             <ul
//               className={`flex flex-col md:flex-row gap-2 md:gap-4 items-center rounded-md absolute md:static top-10.5 right-0 w-48 md:w-auto bg-white md:bg-transparent  py-2 md:py-0 px-2 md:px-0 shadow-md md:shadow-none transition-all ease-in-out duration-400 ${isOpen ? "top-10" : "top-[-490px]"
//                 }`}
//             >
//               {!session ? (
//                 <>
//                   <Link
//                     onClick={handleToggleMenu}
//                     href="/jobs"
//                     className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
//                   >
//                     Browse Jobs
//                   </Link>
//                   <Link
//                     onClick={handleToggleMenu}
//                     href="/auth/signin"
//                     className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
//                   >
//                     Sign In
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     onClick={handleToggleMenu}
//                     href="/jobs"
//                     className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
//                   >
//                     Browse Jobs
//                   </Link>
//                   <Link
//                     onClick={handleToggleMenu}
//                     href="/jobs/post"
//                     className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
//                   >
//                     Post a Job
//                   </Link>
//                   <Link
//                     onClick={handleToggleMenu}
//                     href="/dashboard"
//                     className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
//                   >
//                     Dashboard
//                   </Link>
//                   <Link
//                     onClick={handleToggleMenu}
//                     href="/contact"
//                     className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
//                   >
//                     Contact
//                   </Link>
//                   {/* {currentUser?.role === "Admin" && (
//                     <Link
//                       onClick={handleToggleMenu}
//                       href="/about"
//                       className="text-slate-500 md:ring-1 rounded-full px-3.5 md:px-2 lg:px-3 hover:bg-slate-200 cursor-pointer transition"
//                     >
//                       About
//                     </Link>
//                   )} */}

//                   <div ref={dropdownRef} className="relative hidden md:block">
//                     <button
//                       onClick={handleToggleDropdown}
//                       className="w-9 h-9 flex rounded-full overflow-hidden border border-slate-500 cursor-pointer"
//                     >
//                       <Image
//                         src={session.user?.image || "https://icon-library.com/images/no-profile-pic-icon/no-profile-pic-icon-11.jpg"}
//                         alt="Profile"
//                         width={128}
//                         height={128}
//                         className="object-center"
//                       />
//                     </button>

//                     <AnimatePresence>
//                       {dropdownOpen && (
//                         <motion.div
//                           initial="hidden"
//                           animate="visible"
//                           exit="exit"
//                           variants={dropdownVariants}
//                           className="absolute text-center -right-6 mt-3 w-36 bg-white shadow-lg rounded-md z-20"
//                         >
//                           <Link
//                             onClick={() => { handleToggleMenu; handleToggleDropdown() }}
//                             href="/profile"
//                             className="block px-4 py-2 text-slate-500 hover:bg-slate-100"
//                           >
//                             Profile
//                           </Link>
//                           {session.user?.role === "Admin" && (
//                             <Link
//                               onClick={() => { handleToggleMenu; handleToggleDropdown() }}
//                               href="/admin"
//                               className="block px-4 py-2 text-slate-500 hover:bg-slate-100"
//                             >
//                               Admin
//                             </Link>
//                           )}
//                           <button
//                             onClick={() => {
//                               handleToggleDropdown();
//                               signOut();
//                               router.push("/");
//                             }}
//                             className="w-full text-center px-4 py-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
//                           >
//                             Logout
//                           </button>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>

//                   <div className="flex text-center gap-1.5 flex-col md:hidden">
//                     <Link
//                       onClick={handleToggleMenu}
//                       href="/profile"
//                       className="text-slate-500 px-3 py-0 hover:bg-slate-400 hover:text-black cursor-pointer transition rounded-full"
//                     >
//                       Profile
//                     </Link>
//                     {session.user?.role === "Admin" && (
//                       <Link
//                         onClick={handleToggleMenu}
//                         href="/admin"
//                         className="text-slate-500 px-3 py-0 hover:bg-slate-400 hover:text-black cursor-pointer transition rounded-full"
//                       >
//                         Admin
//                       </Link>
//                     )}
//                     <button
//                       onClick={() => {
//                         signOut();
//                         router.push("/");
//                       }}
//                       className="text-slate-500 mx-auto px-3 py-0 hover:bg-slate-400 hover:text-black cursor-pointer transition rounded-full"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 </>
//               )}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;