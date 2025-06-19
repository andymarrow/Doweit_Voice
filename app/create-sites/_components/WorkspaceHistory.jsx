"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConvex } from "convex/react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";

function WorkspaceHistory() {
  const { user } = useUser();
  const convex = useConvex();
  const [workspacesList, setWorkspacesList] = useState([]);
  const [loading, setLoading] = useState(true);


  const {toggleSidebar}=useSidebar();

  useEffect(() => {
    user && GetAllWorkspace();
  }, [user]);

  //for the summurization of the chat content to be beautifull with emojis

  const GetAllWorkspace = async () => {
    try {
      setLoading(true);
      // Step 1: Get user from 'users' table using their email
      const userData = await convex.query(api.users.GetUser, {
        email: user?.primaryEmailAddress?.emailAddress,
      });

      if (!userData) {
        console.error("User not found in database");
        return;
      }
      console.log("this is the users data", userData);

      const userId = userData._id; // Get _id from 'users' table

      // console.log("this is the user id",userId)
      // Step 2: Use userId to fetch workspaces
      const workspacesResult = await convex.query(
        api.workspace.GetAllWorkspace,
        {
          userId: userId, // Send 'users' table ID
        }
      );

      console.log("this is the workspace result", workspacesResult);

      setWorkspacesList(workspacesResult);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
        setLoading(false); // Stop loading after fetching
      }
  };

  return (
    <div>
      <h2 className="font-medium text-lg">Your Chats</h2>
      {/* Show skeleton while fetching */}
      {loading ? (
        <div>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-10 w-52 bg-gray-300 dark:bg-gray-600 animate-pulse rounded my-2"></div>
          ))}
        </div>
      ) : workspacesList.length > 0 ? (
        <div>
          {workspacesList.map((workspace, index) => {
            const messageContent = workspace?.messages[0]?.content;
            return (
              <Link key={index} href={"/create-sites/workspace/" + workspace?._id}>
                <h2
                  onClick={toggleSidebar}
                  className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-light cursor-pointer hover:text-black dark:hover:text-white hover:font-semibold"
                >
                  {/* Show skeleton if message content isn't ready */}
                  {messageContent ? (
                    messageContent
                  ) : (
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                  )}
                </h2>
              </Link>
            );
          })}
        </div>
      ) : (
        <p>No workspaces found.</p>
      )}
    </div>
  );
}

export default WorkspaceHistory;
