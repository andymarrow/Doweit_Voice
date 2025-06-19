"use client"
import React, { useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MessagesContext } from './context/MessagesContext';
import Header from './_components/Header';
import ConvexClientProvider from './ConvexClientProvider';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useConvex } from "convex/react"; // Import useQuery
import { api } from '@/convex/_generated/api';
import AppSideBar from './_components/AppSideBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ActionContext } from './context/ActionContext';

function CreateSitesLayout({ children }) {
  const [messages, setMessages] = useState();
  const [userDetail, setUserDetail] = useState();
  const [action,setAction]=useState();


  const { user, isLoaded } = useUser();
  const router = useRouter();
  // const convex = useConvex();

  useEffect(() => {
    if (isLoaded && !user) {

      toast.error("We don't know how you got here, but you shouldn't be. Now get out and sign in again!");
      router.push("/");
    }
  }, [user, isLoaded, router]);

  // Update userDetail only when user changes
  useEffect(() => {
    if (user) {
      setUserDetail({
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        picture: user?.imageUrl || "",
        uid: user?.id,
      });
    }
  }, [user]); // This ensures it runs only when user changes

 

  // Fetch user info when user is available
  // useEffect(() => {
  //   if (user) {
  //     getUserInfo();
  //   }
  // }, [user]);

  // const getUserInfo = async () => {
  //   console.log("am already in")
  //   try {
  //     const result = await convex.query(api.users.GetUser, {
  //       email: user?.primaryEmailAddress?.emailAddress, // Corrected email access
  //     });
  //     setUserDetail(result);
  //     console.log("User info:", result);
  //   } catch (error) {
  //     console.error("Error fetching user info:", error);
  //   }
  // };

  return (
    <div className="flex min-h-screen">
      <ConvexClientProvider>
        <MessagesContext.Provider value={{ messages, setMessages }}>
          <ActionContext.Provider value={{action,setAction}}>
            <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <SidebarProvider defaultOpen={false}>
                <AppSideBar />
                <div className="flex flex-col flex-grow p-3 mt-3">
                  <Header />
                  <div className="flex justify-center items-center w-full">
                    {children}
                  </div>
                </div>
              </SidebarProvider>
            </NextThemesProvider>
            </ActionContext.Provider>
        </MessagesContext.Provider>
      </ConvexClientProvider>
    </div>
  );
  
}

export default CreateSitesLayout;
