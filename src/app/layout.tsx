import './globals.css';
import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { auth } from "@/auth";
import { ReduxProvider } from '@/redux/provider';
import { Fullscreen } from 'lucide-react';

export const metadata: Metadata = {
  title: "Job_Application",
  description: "For My Personal Project",
};

export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="">
        <SessionProvider session={session}>
          <ReduxProvider>
            <div style={{ backgroundImage: "url('/bg-picture.png')" }} className="min-h-screen bg-cover bg-center bg-no-repeat relative py-2 md:py-4">
              <div className="absolute inset-0 bg-black/40" />
              <main className="relative container mx-auto p-3 space-y-2.5 md:space-y-6">
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
