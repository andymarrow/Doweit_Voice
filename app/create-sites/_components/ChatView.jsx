"use client";

import { api } from "@/convex/_generated/api";
//now remember useConvex is a hook and a react hook component should always be defined inside a client

import { useConvex } from "convex/react";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useId, useState } from "react";
import { MessagesContext } from "../context/MessagesContext";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { HiArrowRight, HiLink } from "react-icons/hi";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { useMutation } from "convex/react";
import ReactMarkdown from "react-markdown";
import { useSidebar } from "@/components/ui/sidebar";
import toast from "react-hot-toast";
import Modal from "@/components/custom/modal";

//for making people pay after they have reached the free token limit we set
// The countToken function takes a string (inputText) and:

// Removes any leading or trailing whitespace.
// Splits the string into an array of words based on any sequence of spaces or other whitespace.
// Filters out any empty strings (if any exist).
// Returns the total number of words (tokens) in the array.
//more explanation in https://chatgpt.com/c/67ce73bb-7b24-800f-8727-ed628a975959
export const countToken = (inputText) => {
  return inputText
    .trim()
    .split(/\s+/)
    .filter((word) => word).length;
};

const ChatView = () => {
  const { id } = useParams();
  const convex = useConvex();
  const { user } = useUser();

  const UpdateMessages = useMutation(api.workspace.UpdateMessages);

  const [userData, setUserData] = useState();
  const [userInput, setUserInput] = useState();
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const UpdateTokens = useMutation(api.users.UpdateToken);

  const { messages, setMessages } = useContext(MessagesContext) || {
    messages: [],
    setMessages: () => {},
  };

  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);

  //use to get the workspace tables data like messages and the generated code stuff using the id from params as the workspace id
  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });
    setMessages(result?.messages);
    console.log(result);
  };

  useEffect(() => {
    if (messages?.length > 0) {
      //am doing the below because i want the ai to only respond to the last message i sent it
      const role = messages[messages?.length - 1].role;
      if (role == "user") {
        GetAiResponse();
      }
    }
  }, [messages]);

  const GetAiResponse = async () => {
    setLoading(true);
    const PROMPT =
      JSON.stringify(messages) +
      `You are an AI Assistant and experience in React Development.
        GUIDELINES:
        - Tell user what you are building
        -response less that 15 lines.
        -Not in a listing format.
        -skip code examples and commentary
        `;
    const result = await axios.post("/create-sites/api/ai-chat", {
      prompt: PROMPT,
    });
    console.log(result.data.result);
    const aiResp = {
      role: "ai",
      content: result.data.result,
    };
    setMessages((prev) => [...prev, aiResp]);

    await UpdateMessages({
      messages: [...messages, aiResp],
      workspaceId: id,
    });

    //to get the user id to send with the token to the database to be written on the database
    // Step 1: Get user from 'users' table using their email
    const userData = await convex.query(api.users.GetUser, {
      email: user?.primaryEmailAddress?.emailAddress,
    });
    setUserData(userData);
    if (!userData) {
      console.error("User not found in database");
      return;
    }
    console.log("this is the users data", userData);

    const userId = userData._id; // Get _id from 'users' table
    console.log("generated tokens", countToken(JSON.stringify(aiResp)));
    console.log("the token from the database", userData?.token);
    //since we have counted the token recived here we are going to update the token on the database
    const token =
      Number(userData?.token) - Number(countToken(JSON.stringify(aiResp)));

    // console.log("the new tokens ",token)
    //time to update our token on the database
    await UpdateTokens({
      userId: userId,
      token: token,
    });
    //based on the reduced tokens
    setLoading(false);
  };

  const onGenerate = (input) => {
    if (userData?.token < 10) {
      setShowTokenModal(true); // Show the modal if tokens are low
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
    ]);
  };

  return (
    <div className="relative h-[83vh] flex flex-col">
      <div
        className="flex-1 overflow-y-scroll mb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {messages && messages.length > 0 ? (
          messages?.map((msg, index) => (
            <div
              key={index}
              className="p-3 rounded-lg mb-2 bg-gray-300 dark:bg-gray-600 flex gap-4 items-start leading-7"
            >
              {msg?.role == "user" && (
                <Image
                  src={user?.imageUrl}
                  alt="User Profile"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              )}
              <ReactMarkdown className="flex flex-col">
                {msg.content}
              </ReactMarkdown>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg p-10 w-64 h-10"></div>
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg p-10 w-64 h-10"></div>
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg p-10 w-64 h-10"></div>
           
          </div>
        )}
        {loading && (
          <div className="p-3 rounded-lg mb-2 bg-gray-300 dark:bg-gray-600 flex gap-4 items-start">
            <Loader2Icon className="animate-spin" />
            <h2>Generating response ... </h2>
          </div>
        )}
      </div>

      {/* for the input field below  */}
      <div className="flex gap-2 items-end">
        {user && (
          <Image
            src={user?.imageUrl}
            alt="User Profile"
            width={50}
            height={50}
            className="rounded-full cursor-pointer"
            onClick={toggleSidebar}
          />
        )}
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
                onClick={() => {
                  onGenerate(userInput);
                  setUserInput("");
                }}
                className="bg-primary p-2 h-10 w-10 rounded-md cursor-pointer"
              />
            )}
          </div>
          <div>
            <HiLink className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
