const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMNI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  

    export const GenerateProjectLayout_AI = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Please analyze the uploaded workflow file available at [https://firebasestorage.googleapis.com/v0/b/cinematechat-6040e.appspot.com/o/Ai-File-Uploads%2F1729419007139.docx?alt=media&token=21315cda-d249-45b4-8d82-57765f5932eb] from firebase to understand the structure and functionalities of the project. Based on the following details, generate a comprehensive project folder structure using the specified frameworks and provide 5 different UI image prompts for how the project might look not for each page but as a whole 5 diffrent designs a person can pick from for the whole page this prompts are latter sent to sites like dalle or pollination ai or other model to show the image image prompts are a must or required so never skip this part they must be generated no matter what .and for both the image prompts and the file structure put it in same JSON format\n\nProject Details:\n\nName: Portfolio Website\n\nDescription: A personal portfolio website to showcase projects, skills, and a contact form.\n\nCategory: Web Development\n\nFrameworks: HTML, CSS, JavaScript, Tailwind CSS\n\nPages: 3\n\nPage Details:\n\nHome\n\nContent: Introduction, featured projects section, a brief about me, and a call-to-action button.\n\nDesign Preferences: Clean, modern, minimalistic with dark mode option.\n\nAbout\n\nContent: Detailed biography, skills list, and a profile picture.\n\nDesign Preferences: Profile picture on the left, text content on the right with a soft background color.\n\nProjects\n\nContent: List of projects with descriptions, links, and images.\n\nDesign Preferences: Grid layout with hover effects and lightbox for images.\n\nIntegrations:\n\nGoogle Maps API for the contact form\n\nYouTube video embedding for project showcases\n\nAuthentication:\n\nRequires Authentication: true\n\nProvider: Google OAuth\n\nAssets Required:\n\nProfile picture\n\nIntroduction video\n\nKeys Required:\n\nGoogle OAuth\n\nGoogle Maps API Key\n\nPlease provide the folder structure with the necessary files for the frameworks listed and generate 5 distinct UI image prompts that illustrate the design concepts for the pages mentioned. Focus on the overall layout and ensure the designs reflect the specified preferences.\n\nin JSON format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "## Portfolio Website Project Structure (JSON Format)\n\n```json\n{\n  \"portfolio-website\": {\n    \"public\": {\n      \"index.html\": \"Home page\",\n      \"about.html\": \"About page\",\n      \"projects.html\": \"Projects page\",\n      \"assets\": {\n        \"css\": {\n          \"style.css\": \"Main CSS file\",\n          \"tailwind.css\": \"Tailwind CSS file\",\n          \"darkmode.css\": \"Dark mode stylesheet\"\n        },\n        \"js\": {\n          \"script.js\": \"Main JavaScript file\",\n          \"auth.js\": \"Google OAuth authentication script\",\n          \"map.js\": \"Google Maps API integration script\",\n          \"lightbox.js\": \"Lightbox script for project images\"\n        },\n        \"images\": {\n          \"profile.jpg\": \"Profile picture\",\n          \"logo.png\": \"Website logo (optional)\",\n          \"placeholder.jpg\": \"Placeholder image for projects (optional)\"\n        },\n        \"videos\": {\n          \"intro.mp4\": \"Introduction video\"\n        }\n      }\n    },\n    \"src\": {\n      \"components\": {\n        \"header.js\": \"Header component\",\n        \"footer.js\": \"Footer component\",\n        \"projectCard.js\": \"Project card component\",\n        \"lightbox.js\": \"Lightbox component (if not included in assets)\"\n      },\n      \"pages\": {\n        \"home.js\": \"Home page logic\",\n        \"about.js\": \"About page logic\",\n        \"projects.js\": \"Projects page logic\"\n      }\n    }\n  }\n}\n```\n\n## UI Image Prompts (JSON Format)\n\n```json\n{\n  \"prompts\": [\n    {\n      \"title\": \"Minimalist Dark Mode Portfolio\",\n      \"description\": \"A sleek, modern portfolio website with a dark background and subtle white text. The homepage features a large hero image with a centered call-to-action button. The about page showcases a profile picture on the left and text on the right with a soft blue background. The projects page uses a grid layout with hover effects on each project card and a lightbox to view images.\"\n    },\n    {\n      \"title\": \"Clean and Bright Portfolio\",\n      \"description\": \"A bright and airy portfolio website with a white background and vibrant color accents. The homepage features a large hero image with a bold call-to-action button. The about page showcases a profile picture on the left and text on the right with a soft pink background. The projects page uses a grid layout with hover effects on each project card and a lightbox to view images.\"\n    },\n    {\n      \"title\": \"Animated Portfolio with Scroll Effects\",\n      \"description\": \"A dynamic portfolio website with subtle animation and scroll effects. The homepage features a parallax scrolling effect on the hero image and animated transitions between sections. The about page features a smooth animation when the profile picture appears. The projects page uses a grid layout with hover effects on each project card and a smooth lightbox transition.\"\n    },\n    {\n      \"title\": \"Colorful and Creative Portfolio\",\n      \"description\": \"A bold and creative portfolio website with a playful use of color and typography. The homepage features a colorful background with a unique font for the call-to-action button. The about page showcases a bright profile picture with a colorful background. The projects page uses a unique grid layout with a variety of color palettes for each project card.\"\n    },\n    {\n      \"title\": \"Modern Portfolio with Interactive Elements\",\n      \"description\": \"A modern and interactive portfolio website with sleek design and engaging elements. The homepage features a video background with an overlayed call-to-action button. The about page features interactive elements like a timeline of experience or a skill bar. The projects page uses a grid layout with hover effects on each project card and a lightbox to view images with embedded YouTube videos.\"\n    }\n  ]\n}\n```\n\n**Explanation:**\n\n* The folder structure outlines the basic organization of the project, including HTML, CSS, JavaScript files, assets, and components for modularity.\n* The UI image prompts provide detailed descriptions for 5 different portfolio designs, each focusing on specific design preferences and features.\n* These prompts can be used as input for AI image generation tools like DALL-E or Midjourney to generate visual representations of the desired designs.\n\nRemember to adjust the prompts and folder structure based on your specific requirements and project scope."},
          ],
        },
      ],
    });
  
    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());
 