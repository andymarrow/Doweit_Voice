"use client";

import Button from "@/components/custom/button";
import { HelpCircle, LogOut, Settings, Wallet } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

function SideBarFooter() {
  const router=useRouter(); 
  const options = [
    {
      name: "Settings",
      icon: Settings,
    },
    {
      name: "Help",
      icon: HelpCircle,
    },
    {
      name: "My Subscription",
      icon: Wallet,
      path:'/create-sites/pricing'
    },
    {
      name: "Sign Out",
      icon: LogOut,
    },
  ];

  const onOptionClick=(option)=>{
    router.push(option.path)
  }

  //the icon is from lucide react which makes them a component so we can use them as a component
  return (
    <div className="p-2 mb-10">
      {options.map((option, index) => (
        <Button
          onClick={() => onOptionClick(option)}
          className="px-4 py-2 my-2"
          key={index}
        >
            <div className="text-lg flex items-center">

          <option.icon className="mr-3" />
          {option.name}
            </div>
        </Button>
      ))}
    </div>
  );
}

export default SideBarFooter;
