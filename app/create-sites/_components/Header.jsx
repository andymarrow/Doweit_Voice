"use client"
import ThemeToggle from "@/components/Themetoggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";

import { HiOutlineMenuAlt2, HiOutlineX } from "react-icons/hi";
import { Download, Upload } from "lucide-react";
import { usePathname } from "next/navigation";
import { ActionContext } from "../context/ActionContext";

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const path=usePathname();
  const {action,setAction}=useContext(ActionContext);

  const onActionBtn=(action)=>{
    console.log(action)
      setAction({
        actionType:action,
        timestamp:Date.now()//we are setting this here because the user might click on both the buttons at the same time
      })
  }

  return (
    <div className="m-2 flex justify-between p-3 shadow-md">
      <div className="flex items-center gap-3">
        {/* Toggle Button for Small Screens */}
        <button className="md:hidden p-2 text-gray-700" onClick={toggleSidebar}>
          {isSidebarOpen ? (
            <HiOutlineX size={24} />
          ) : (
            <HiOutlineMenuAlt2 size={24} />
          )}
        </button>
        <Link href={"/dashboard"}>
        <Image src={"/logo.svg"} width={230} height={230} />
          </Link>
      </div>
      <div className="flex flex-row space-x-2 items-center">
        <ThemeToggle />
     
        {/* Export Button */}
        {/* Show buttons only if not on /create-sites */}
        {path !== "/create-sites" && (
          <>
            {/* Export Button */}
            <Button
              onClick={() => onActionBtn("export")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </Button>

            {/* Deploy Button */}
            <Button
              onClick={() => onActionBtn("deploy")}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              Deploy
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
