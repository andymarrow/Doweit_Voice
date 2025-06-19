"use client"
import React, { useEffect, useState } from 'react'
import Lookup from '../../assets_data/Lookup';
import { useUser } from '@clerk/nextjs'
import { useConvex } from 'convex/react';
import { api } from "@/convex/_generated/api";
import PricingModel from '../../_components/PricingModel';


function Pricing () {
    const [tokens, setTokens] = useState();
      const { user } = useUser();
      const convex = useConvex();

    useEffect(()=>{
        user && GetUserTokens();
    },[user])

    const GetUserTokens = async () => {
        try {
          // Step 1: Get user from 'users' table using their email
          const userData = await convex.query(api.users.GetUser, {
            email: user?.primaryEmailAddress?.emailAddress,
          });
    
          if (!userData) {
            console.error("User not found in database");
            return;
          }
          console.log("this is the users data", userData);
    
        //   const userId = userData._id; // Get _id from 'users' table
    
          setTokens(userData.token);
        } catch (error) {
          console.error("Error fetching tokens:", error);
        } 
      };
  return (
    <div className='mt-10 flex flex-col items-center w-full p-10 md:px-32 lg:px-48'>
        <h2 className='font-bold text-5xl'>
        Pricing
        </h2>
        <p className='text-gray-600 dark:text-gray-400 max-w-xl text-center mt-4'>{Lookup?.PRICING_DESC}</p>
       <div className='p-5 border rounded-xl w-full flex justify-between mt-7 items-center'>
            <h2 className='text-lg'><span className='font-bold'>{tokens}</span>Tokens Left</h2>
            <div>
                <h2 className='font-medium'>Need more token?</h2>
                <p>Upgrade your plan below</p>
            </div>
       </div>
        <PricingModel/>
       </div>
  )
}

export default Pricing