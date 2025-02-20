"use client"
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';
import Footer from './footer';
import NavBar from './navbar';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (isSignedIn) {
      storeUser();
    }
  }, [isSignedIn, storeUser]);


  return (
    <>
      <NavBar />
      <main className="flex min-w-screen min-h-screen flex-col pt-[4rem] items-center dark:bg-black bg-white justify-between">
        <div className="absolute z-[-99] pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        {children}
      </main>
      <Footer />
    </>
  )
}