"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/configs/db";
import { and, eq } from "drizzle-orm";
import { ProjectList } from "@/configs/schemaCourse";
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";
import EditPageDetailUpdateInfo from "./_components/EditPageDetailUpdateInfo";

export default function ProjectLayout({ params }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const [projectOutput, setProjectOutput] = useState(null);
  const [projectType, setProjectType] = useState("");  // To dynamically handle project type
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    if (params) {
      getProject();
    }
  }, [params, user]);

  const getProject = async () => {
    try {
        setLoading(true);
        const result = await db
            .select()
            .from(ProjectList)
            .where(
                and(
                    eq(ProjectList.projectId, params?.projectId),
                    eq(ProjectList.createdBy, user?.primaryEmailAddress?.emailAddress)
                )
            );

        if (result[0]) {
            setProject(result[0]);

            // Get the projectOutput as an object directly
            const { projectOutput } = result[0];
            console.log(projectOutput);

            // Handle the case when projectOutput is not an object
            if (typeof projectOutput === "object" && projectOutput !== null) {
                // Check for ui_prompts first and generate images
                if (projectOutput && projectOutput.uiPrompts)  {
                    generateImages(projectOutput.uiPrompts);
                } else {
                    console.log("No UI prompts available to generate images.");
                }

                // Determine the project type dynamically from projectOutput
                const projectKeys = Object.keys(projectOutput).filter(
                    (key) => key !== "prompts"
                );
                if (projectKeys.length > 0) {
                    const detectedProjectType = projectKeys[0];  // Detect the first key as the project type
                    setProjectType(detectedProjectType);
                    setProjectOutput(projectOutput[detectedProjectType]);
                }
            } else {
                console.error("Project output is not valid:", projectOutput);
            }
        }
    } catch (error) {
        console.error("Error fetching project or generating images:", error);
    } finally {
        setLoading(false);
    }
};

const generateImages = async (prompts) => {
    setLoading(true);
    try {
        const imagePromises = prompts.map(async (prompt) => {
            const title = prompt.prompt;
            // const description = prompt.description;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
                title 
            )}`;
            return { title, imageUrl };
        });

        setImages(await Promise.all(imagePromises));
    } catch (error) {
        console.error("Error generating images:", error);
    } finally {
        setLoading(false);
    }
};


  const renderFolderStructure = (structure) => {
    return Object.entries(structure).map(([key, value]) => (
        <TreeItem 
            key={key} 
            name={key} 
            content={value} 
            setSelectedDescription={setSelectedDescription} 
            projectId={project.projectId} // Pass the projectId
            projectOutput={projectOutput} // Pass the projectOutput
        />
    ));
};

  
const TreeItem = ({ name, content, setSelectedDescription, projectId, projectOutput }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = typeof content === "object";

  const handleFileClick = (e) => {
      e.stopPropagation();
      if (!isFolder) {
          const description = content;
          setSelectedDescription(description);
          setSelectedFileName(name);
      }
  };

  const handleFolderClick = (e) => {
      e.stopPropagation();
      setIsOpen((prev) => !prev);
  };

  return (
      <div className="ml-4">
          <div
              className="flex items-center cursor-pointer hover:text-blue-500"
              onClick={(e) => {
                  if (isFolder) {
                      handleFolderClick(e);
                  } else {
                      handleFileClick(e);
                  }
              }}
          >
              {isFolder ? (
                  isOpen ? <FaFolderOpen className="mr-2" /> : <FaFolder className="mr-2" />
              ) : (
                  <FaFile className="mr-2" />
              )}
              <span className="font-medium">{name}</span>
              <EditPageDetailUpdateInfo 
                  projectId={params?.projectId}
                  projectOutput={projectOutput}
                  pageKey={selectedFileName}
                  pageDescription={selectedDescription}
                  onUpdate={(updatedOutput) => {
                      // Update the projectOutput state in ProjectLayout or refresh data
                      setProjectOutput(updatedOutput);
                  }}
              />
          </div>
          {isFolder && isOpen && (
              <div className="ml-4 mt-1 transition-all duration-300 ease-in-out">
                  <ul>
                      {Object.entries(content).map(([key, value]) => (
                          <TreeItem 
                              key={key} 
                              name={key} 
                              content={value} 
                              setSelectedDescription={setSelectedDescription} 
                              projectId={projectId} 
                              projectOutput={projectOutput} 
                          />
                      ))}
                  </ul>
              </div>
          )}
      </div>
  );
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return <div>No project data found.</div>;
  }

  return (
    <div className="project-layout p-4">
      <h2 className="font-extrabold text-4xl text-primary text-center">Pick your Custom Styling</h2>
      <h2 className="font-extrabold text-2xl text-gray-500 text-center">AI Generated Templates</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
        {images.map((image, index) => (
          <div key={index} className="relative rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 bg-white p-4">
            <img src={image.imageUrl} alt={image.title} className="w-full h-72 object-cover rounded-md" />
            <h2 className="text-center text-lg font-semibold mt-2">{image.title}</h2>
            <p className="text-gray-700 dark:text-black text-sm mt-2">{image.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <h2 className="font-extrabold text-4xl text-primary text-center">Your File Structure Based on The Frameworks You Choose</h2>
        <div className="flex mt-4">
          <ul className="flex-1">{projectOutput && renderFolderStructure(projectOutput)}</ul>
          <div>
            <h2 className="font-bold text-primary text-center">Put what you want in each page's description (recommended)</h2>
            <input
              type="text"
              value={selectedDescription}
              readOnly
              className="ml-4 p-2 border border-gray-300 rounded"
              placeholder="Description will appear here..."
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}
