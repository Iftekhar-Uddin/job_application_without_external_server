import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { auth } from "@/auth";
import { ReduxProvider } from "@/redux/provider";

export const metadata: Metadata = {
  title: "Job_Application",
  description: "For My Personal Project",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden">

        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: "url('/bg-picture.png')" }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <SessionProvider session={session}>
          <ReduxProvider>
            <div className="relative z-10 min-h-screen py-2 md:py-4">
              <main className="container mx-auto p-3 space-y-2.5 md:space-y-6">
                <Navbar />
                {children}
              </main>
            </div>

            <Toaster position="top-right" />
          </ReduxProvider>
        </SessionProvider>

      </body>
    </html>
  );
}













// import "./globals.css";
// import type { Metadata } from "next";
// import Navbar from "@/components/Navbar";
// import { SessionProvider } from "next-auth/react";
// import { Toaster } from "react-hot-toast";
// import { ReduxProvider } from "@/redux/provider";

// export const metadata: Metadata = {
//   title: "Job_Application",
//   description: "For My Personal Project",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="relative min-h-screen overflow-x-hidden">

//         <div
//           className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
//           style={{ backgroundImage: "url('/bg-picture.png')" }}
//         >
//           <div className="absolute inset-0 bg-black/50" />
//         </div>

//         <SessionProvider>
//           <ReduxProvider>
//             <div className="relative z-10 min-h-screen py-2 md:py-4">
//               <main className="container mx-auto p-3 space-y-2.5 md:space-y-6">
//                 <Navbar />
//                 {children}
//               </main>
//             </div>

//             <Toaster position="top-right" />
//           </ReduxProvider>
//         </SessionProvider>

//       </body>
//     </html>
//   );
// }
















// import "./globals.css";
// import type { Metadata } from "next";
// import Navbar from "@/components/Navbar";
// import { SessionProvider } from "next-auth/react";
// import { Toaster } from "react-hot-toast";
// import { auth } from "@/auth";
// import { ReduxProvider } from "@/redux/provider";

// export const metadata: Metadata = {
//   title: "Job_Application",
//   description: "For My Personal Project",
// };

// export default async function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   const session = await auth();

//   return (
//     <html lang="en">
//       <body className="relative h-screen overflow-hidden">
//         {/* Background (non-scrollable) */}
//         <div
//           className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
//           style={{ backgroundImage: "url('/bg-picture.png')" }}
//         >
//           <div className="absolute inset-0 bg-black/50" />
//         </div>

//         <SessionProvider session={session}>
//           <ReduxProvider>
//             {/* Fixed Navbar */}
//             <div className="fixed top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md shadow-sm">
//               <div className="container mx-auto p-3">
//                 <Navbar />
//               </div>
//             </div>

//             {/* Scrollable content area */}
//             <main className="relative z-10 pt-[80px] overflow-y-auto h-screen">
//               <div className="container mx-auto p-3 md:p-6">
//                 {children}
//               </div>
//             </main>

//             <Toaster position="top-right" />
//           </ReduxProvider>
//         </SessionProvider>
//       </body>
//     </html>
//   );
// }













//alternate way, this also work

// import './globals.css';
// import type { Metadata } from "next";
// import Image from "next/image";
// import Navbar from "@/components/Navbar";
// import { SessionProvider } from "next-auth/react";
// import { Toaster } from "react-hot-toast";
// import { auth } from "@/auth";
// import { ReduxProvider } from '@/redux/provider';
// import { Fullscreen } from 'lucide-react';

// export const metadata: Metadata = {
//   title: "Job_Application",
//   description: "For My Personal Project",
// };

// export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
//   const session = await auth();

//   return (
//     <html lang="en">
//       <body className="">
//         <SessionProvider session={session}>
//           <ReduxProvider>
//             <div style={{ backgroundImage: "url('/bg-picture.png')", backgroundAttachment: "fixed", }} className="min-h-screen bg-cover bg-center bg-no-repeat relative py-2 md:py-4">
//               <div className="absolute inset-0 bg-black/50" />
//               <main className="relative container mx-auto p-3 space-y-2.5 md:space-y-6">
//                 <Navbar />
//                 {children}
//               </main>
//             </div>
//             <Toaster position="top-right" />
//           </ReduxProvider>
//         </SessionProvider>
//       </body>
//     </html>
//   );
// }


