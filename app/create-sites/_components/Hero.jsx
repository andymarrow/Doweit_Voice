"use client";

import React, { useContext, useEffect, useState } from "react";
import { HiArrowRight, HiLink } from "react-icons/hi"; // Import the arrow right icon from react-icons/hi
import { MessagesContext } from "../context/MessagesContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Modal from "@/components/custom/modal";

function Hero() {
  const [userInput, setUserInput] = useState();
  const { messages, setMessages } = useContext(MessagesContext);
  const [userDetail, setUserDetail] = useState();
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [userDatas, setUserDatas] = useState();

  const user = useUser();
  const router = useRouter();
  const convex = useConvex();

  const createUser = useMutation(api.users.CreateUser); // Mutation to insert user
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);

  const onGenerate = async (input) => {
    if (!user.isSignedIn) {
      toast.error("You need to log in to use this option.");
      router.push("/dashboard");
      return;
    }

    const userData = {
      name: user.user.fullName || "", // Use fullName if available
      email: user.user.primaryEmailAddress?.emailAddress || "", // Extract email
      picture: user.user.imageUrl || "", // Extract profile picture
      uid: user.user.id, // Extract user ID from Clerk
    };

    try {
      await createUser(userData); // Call the Convex mutation
    } catch (error) {
      console.error("Error inserting user:", error);
      toast.error("Failed to save user data.");
    }

    // Step 1: Get user from 'users' table using their email
    const userDatas = await convex.query(api.users.GetUser, {
      email: user?.user?.primaryEmailAddress?.emailAddress,
    });
    setUserDatas(userDatas);
    if (!userDatas) {
      console.error("User not found in database");
      return;
    }
    console.log("this is the users data", userDatas);

    if (userDatas?.token < 10) {
      setShowTokenModal(true); // Show the modal if tokens are low
      return;
    }
    // Set user details after mutation
    const userDetail = {
      name: user?.user?.fullName || "",
      email: user?.user?.primaryEmailAddress?.emailAddress || "",
      picture: user?.user?.imageUrl || "",
      uid: user?.user?.id,
    };

    // Ensure userDetail is set before calling CreateWorkspace
    if (userDetail?.uid) {
      const msg = {
        role: "user",
        content: input,
      };

      setMessages(msg);

      try {
        const workspaceId = await CreateWorkspace({
          user: userDetail.uid,
          messages: [msg],
        });
        console.log(workspaceId);
        router.push("/create-sites/workspace/" + workspaceId);
      } catch (error) {
        console.error("Error creating workspace:", error);
        toast.error("Failed to create workspace.");
      }
    } else {
      toast.error("User details not found.");
    }
  };

  const [suggestions] = useState([
    "Build a personal portfolio website",
    "Create a blog website",
    "Develop an e-commerce site",
    "Make a task management web app",
  ]);

  const handleSuggestionClick = (suggestion) => {
    setUserInput(suggestion); // Set the suggestion in the textarea
  };

  return (
    <div className="flex flex-col items-center mt-36 xl:mt-42 gap-2">
      <h2 className="font-bold text-4xl">What do you want to build?</h2>
      <p className="text-gray-600 dark:text-gray-400 font-medium">
        Enter your prompt, iteratively update what you want , let Doweit do the
        rest
      </p>
      {/* Token Modal */}
      <Modal
        show={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        title="Not Enough Tokens!"
        description="You don’t have enough tokens to proceed. Please refill your tokens."
      />
      <div className="p-5 mt-3 border rounded-xl max-w-2xl w-full">
        <div className="flex gap-2">
          <textarea
            placeholder="Enter your Prompt"
            onChange={(event) => setUserInput(event.target.value)}
            value={userInput}
            className="outline-none bg-transparent w-full h-32 max-h-56 resize-none text-gray-700 font-bold dark:text-gray-300"
          />
          {userInput && (
            <HiArrowRight
              onClick={() => onGenerate(userInput)}
              className="bg-primary p-2 h-10 w-10 rounded-md cursor-pointer"
            />
          )}
        </div>
        <div>
          <HiLink className="h-5 w-5" />
        </div>
      </div>
      {/* Suggestions */}
      <div className="flex flex-wrap mt-4 gap-2 max-w-2xl justify-center items-center">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => handleSuggestionClick(suggestion)} // Populate the textarea with the clicked suggestion
            className="p-3 bg-tansparent border border-gray-300 dark:border-gray-500 rounded-2xl cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 text-sm "
          >
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hero;
