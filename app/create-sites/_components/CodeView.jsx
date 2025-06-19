"use client";
import React, { useState, useContext, useEffect } from "react";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  Sandpack,
} from "@codesandbox/sandpack-react";

import Lookup from "../assets_data/Lookup";
import axios from "axios";
import { MessagesContext } from "../context/MessagesContext";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { countToken } from "./ChatView";
import { useUser } from "@clerk/nextjs";
import SandpackPreviewClient from "./SandpackPreviewClient";
import { ActionContext } from "../context/ActionContext";

const CodeView = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("code");
  const { user } = useUser();
  const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
  const { messages, setMessages } = useContext(MessagesContext) || {
    messages: [],
    setMessages: () => {},
  };

  const UpdateFilesCode = useMutation(api.workspace.UpdateFilesCode);
  const [loading, setLoading] = useState(false);
  const UpdateTokens = useMutation(api.users.UpdateToken);
  const {action,setAction}=useContext(ActionContext);

  const convex = useConvex();

  useEffect(() => {
    id && GetFiles();
  }, [id]);

  useEffect(()=>{
    setActiveTab('preview');
  },[action])

  const GetFiles = async () => {
    setLoading(true);
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });
    const mergedFiles = { ...Lookup.DEFAULT_FILE, ...result?.fileData };
    setFiles(mergedFiles);
    setLoading(false);
  };

  useEffect(() => {
    if (messages?.length > 0) {
      //obviously this part matters because if the last response is from the ai it doesnt make sense to generate the new code based on that
      //only if the last message is users message then we will update teh generated code
      const role = messages[messages?.length - 1].role;
      if (role == "user") {
        GenerateAiCode();
      }
    }
  }, [messages]);

  const GenerateAiCode = async () => {
    setLoading(true);
    //what makes the messages?.length-1 not call ai roles message is whats being done in the use effect because we always check that the last message is the users only then is this function called
    //this was how we could send the last message of the user with out the ai having the past interactions knowledge  const PROMPT=messages[messages?.length-1]?.content+" "+`
    //we are using stringify because the messages are in json format
    const PROMPT =
      JSON.stringify(messages) +
      " " +
      `
Generate a Project in React. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, 
without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.
also you can use date-fns for date format and react-chartjs-2 chart, graph library

Return the response in JSON format with the following schema:
{
  "projectTitle": "",
  "explanation": "",
  "files": {
    "/App.js": {
      "code": ""
    },
    ...
  },
  "generatedFiles": []
}

Here’s the reformatted and improved version of your prompt:

Generate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.

Return the response in JSON format with the following schema:

json
Copy code
{
  "projectTitle": "",
  "explanation": "",
  "files": {
    "/App.js": {
      "code": ""
    },
    ...
  },
  "generatedFiles": []
}
Ensure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field, following this example:
files:{
  "/App.js": {
    "code": "import React from 'react';\nimport './styles.css';\nexport default function App() {\n  return (\n    <div className='p-4 bg-gray-100 text-center'>\n      <h1 className='text-2xl font-bold text-blue-500'>Hello, Tailwind CSS with Sandpack!</h1>\n      <p className='mt-2 text-gray-700'>This is a live code editor.</p>\n    </div>\n  );\n}"
  }
}
  Additionally, include an explanation of the project's structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.
  - When asked then only use this package to import, here are some packages available to import and use (date-fns,react-chartjs-2,"firebase","@google/generative-ai" ) only when it required
  
  - For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg
  -Add Emoji icons whenever needed to give good user experinence
  - all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

- By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

- Use icons from lucide-react for logos.

- Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.
   `;
    const result = await axios.post("/create-sites/api/gen-ai-code", {
      prompt: PROMPT,
    });
    console.log(result.data);
    const aiResp = result.data;

    //whats to be done after this is truly amazing because we will add the files which we take from the lookup we statically added with the dynamically added from the generative ai based on the users prompt

    const mergedFiles = { ...Lookup.DEFAULT_FILE, ...aiResp?.files };
    setFiles(mergedFiles); //now this means the sandbox will accept the files we statically added and the dynamic code generated by the ai

    //i was thinking on the below its better to add the merged files instead because then the ai will have all the background info it needs including the statically added one but 2.41.43 its adding the ai response only so thats what we are going to do
    await UpdateFilesCode({
      workspaceId: id,
      files: aiResp?.files,
    });

    const userData = await convex.query(api.users.GetUser, {
          email: user?.primaryEmailAddress?.emailAddress,
        });
    
        if (!userData) {
          console.error("User not found in database");
          return;
        }
        console.log("this is the users data", userData);
    
        const userId = userData._id; // Get _id from 'users' table
        

    const token =Number(userData?.token) - Number(countToken(JSON.stringify(aiResp)));

    // console.log("the new tokens ",token)
    //time to update our token on the database
    await UpdateTokens({
      userId: userId,
      token: token,
    });
    setLoading(false);
  };

  return (
    <div className="relative">
      <div className="bg-white dark:bg-[#181818] w-full p-2 border">
        <div className="flex items-center flex-wrao shrink-0 bg-gray-400 dark:bg-black p-1 justify-center w-[140px] gap-3 rounded-full">
          <h2
            onClick={() => setActiveTab("code")}
            className={`text-sm cursor-pointer ${activeTab == "code" && "text-blue-700 bg-white dark:text-blue-500 dark:bg-blue-500 dark:bg-opacity-25 bg-opacity-25 p-1 px-2 rounded-full"}`}
          >
            Code
          </h2>
          <h2
            onClick={() => setActiveTab("preview")}
            className={`text-sm cursor-pointer ${activeTab == "preview" && "text-blue-700 bg-white dark:text-blue-500 dark:bg-blue-500 dark:bg-opacity-25 bg-opacity-25 p-1 px-2 rounded-full"}`}
          >
            preview
          </h2>
        </div>
      </div>
      <SandpackProvider
        files={files}
        template="react"
        theme={"dark"}
        customSetup={{
          dependencies: {
            postcss: "^8",
            tailwindcss: "^3.4.1",
            autoprefixer: "^10.0.0",
            uuid4: "^2.0.3",
            "tailwind-merge": "^2.4.0",
            "tailwindcss-animate": "^1.0.7",
            "lucide-react": "latest",
            "react-router-dom": "latest",
            firebase: "^11.1.0",
            "@google/generative-ai": "^0.21.0",
            "unsplash-js": "latest",
            "date-fns": "latest",
            "react-chartjs-2": "latest",
            "chart.js": "latest",
          },
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
      >
        <SandpackLayout>
          {activeTab == "code" ? (
            <>
              <SandpackFileExplorer style={{ height: "80vh" }} />
              <SandpackCodeEditor style={{ height: "80vh" }} />
            </>
          ) : (
            <>
              <SandpackPreviewClient/>
            </>
          )}
          {/* we can use the below as a mini browser console */}
          {/* <Sandpack
    options={{
      showConsole: true,
      showConsoleButton: true,
    }}
  /> */}
        </SandpackLayout>
      </SandpackProvider>
      {loading && (
        <div className="p-110 bg-gray-900 opacity-80 absolute top-0 rounded-lg w-full h-full flex items-center justify-center">
          <Loader2Icon className="animate-spin h-10 w-10 text-white" />
          <h2 className="text-white">generating your files...</h2>
        </div>
      )}
    </div>
  );
};

export default CodeView;
