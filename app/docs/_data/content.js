import { Zap, PhoneCall, Code2, Briefcase, MessageSquare, Terminal, Book, Shield, Cpu, Share2 } from "lucide-react";

export const docsContent = {
    // --- GETTING STARTED ---
    "Introduction": {
        title: "Platform Introduction",
        category: "Getting Started",
        icon: Zap,
        content: "Doweit Voice is a next-generation multi-agent orchestration platform. We enable developers to build autonomous voice agents that don't just chat, but execute logic. Our ecosystem covers telephony, embedded web assistants, recruitment automation, and persona-driven characters.",
        steps: ["Create your developer account", "Generate an API Key for your project", "Choose the right module for your use-case"],
    },
    "Quick Start Guide": {
        title: "5-Minute Quick Start",
        category: "Getting Started",
        icon: Zap,
        content: "The fastest way to get a Doweit Agent live is using our Web SDK. By defining a few capabilities, you can turn your website into a voice-controlled interface instantly.",
        code: "const ai = new DoweitClient({ publicKey: 'dw_pub_...' });\nawait ai.init();",
        steps: ["Initialize the client", "Register your first function", "Mount the DoweitWidget component"],
    },
    "Architecture Overview": {
        title: "System Architecture",
        category: "Getting Started",
        icon: Cpu,
        content: "Doweit uses a high-concurrency WebSocket proxy. Your frontend talks to our server, which manages the session state and streams native audio directly to Gemini 2.0 Flash for ultra-low latency response times.",
        steps: ["Client-side SDK initialization", "Secure WebSocket Handshake via Doweit Proxy", "Real-time Tool-Calling loop with Gemini Live"],
    },

    // --- CALL AGENTS ---
    "Configuring Voices": {
        title: "Configuring Agent Voices",
        category: "Call Agents",
        icon: PhoneCall,
        content: "Doweit supports native Google Gemini voices, Vapi high-fidelity models, and custom ElevenLabs clones. You can adjust stability and clarity per-agent.",
        steps: ["Open the Voice Config tab", "Choose a provider (Vapi or ElevenLabs)", "Test the voice with a sample greeting"],
    },
    "Prompt Engineering": {
        title: "Prompt Engineering for Voice",
        category: "Call Agents",
        icon: MessageSquare,
        content: "Voice prompts need to be concise. Use clear system instructions to define persona, constraints, and objective-based behavior.",
        code: "# System Instruction\nYou are a helpful receptionist. \nKeep answers under 20 words. \nAlways confirm dates twice.",
        steps: ["Define the Persona", "Set interaction boundaries", "Specify the primary goal of the call"],
    },
    "Handling Transfers": {
        title: "Smart Call Transfers",
        category: "Call Agents",
        icon: PhoneCall,
        content: "Link a 'Phone Book' to your agent. When the AI detects the user needs human assistance, it triggers a SIP transfer to your configured manager line.",
        steps: ["Create a Phone Book in Contacts", "Define the transfer condition", "Assign the Phone Book to your Agent"],
    },

    // --- WEB SDK ---
    "SDK Installation": {
        title: "Installing the Web SDK",
        category: "Web SDK",
        icon: Code2,
        content: "Install via NPM to get full TypeScript support and auto-completion for your agent's capabilities.",
        code: "npm install @doweit/voice-sdk",
        steps: ["Install the package", "Import the components", "Verify the build in development mode"],
    },
    "Function Registration": {
        title: "Registering App Functions",
        category: "Web SDK",
        icon: Code2,
        content: "Expose your app's internal logic. This allows the AI to perform real actions like 'Add to Cart' or 'Toggle Dark Mode'.",
        code: "ai.register({\n  openDashboard: {\n    description: 'Navigates to user profile',\n    handler: () => router.push('/profile')\n  }\n});",
        steps: ["Identify core app actions", "Define function schemas", "Bind handlers in the SDK"],
    },
    "Manifest Syncing": {
        title: "Code-to-Dashboard Sync",
        category: "Web SDK",
        icon: Share2,
        content: "When you call init(), the SDK sends a 'Manifest' to our server. This makes your code the source of truth, appearing automatically in your Doweit Dashboard.",
        steps: ["Call ai.init()", "Refresh your Embedded dashboard", "Version your manifest for production"],
    },

    // --- RECRUITMENT AI ---
    "JD Ingestion": {
        title: "Job Description Ingestion",
        category: "Recruitment AI",
        icon: Briefcase,
        content: "Our Recruitment AI analyzes your JD to automatically generate a specialized interviewer prompt and a 10-point scoring rubric.",
        steps: ["Upload a PDF Job Description", "Review generated Interviewer Persona", "Approve the Evaluation Rubric"],
    },
    "Magic Links": {
        title: "Magic Link Deployment",
        category: "Recruitment AI",
        icon: Share2,
        content: "Generate a unique URL for your candidates. They can take the interview in their browser with no app installation required.",
        steps: ["Click 'Generate Magic Link'", "Set an expiry date", "Share with your candidate list"],
    },
    "Scorecard Analysis": {
        title: "AI Scorecard & Analysis",
        category: "Recruitment AI",
        icon: Briefcase,
        content: "After the interview, the AI reviews the transcript and generates a 'Fit Score' based on technical skills and sentiment analysis.",
        steps: ["Wait for the 'Analysis Complete' notification", "Open the Candidate Database", "Review the AI summary and audio recording"],
    },

    // --- CHARACTER AI ---
    "Creating Persona": {
        title: "Creating a Character Persona",
        category: "Character AI",
        icon: MessageSquare,
        content: "Define the backstory, quirks, and knowledge level of your character to create unique, immersive experiences.",
        steps: ["Write a detailed biography", "Select a voice matching the age/vibe", "Set a unique starting greeting"],
    },
    "Behavior Tags": {
        title: "Applying Behavior Tags",
        category: "Character AI",
        icon: Zap,
        content: "Use tags like 'Sarcastic', 'Wise', or 'Helpful' to steer the AI's internal reasoning and word choice during the conversation.",
        steps: ["Select from our tag library", "Add custom behavioral modifiers", "Test the emotional response range"],
    },
    "Voice Cloning": {
        title: "Voice Cloning (Instant TTS)",
        category: "Character AI",
        icon: PhoneCall,
        content: "Clone your own voice or a famous persona's voice by uploading a 60-second audio clip via our ElevenLabs integration.",
        steps: ["Upload a clear MP3 sample", "Verify the cloned ID", "Assign the clone to your Character"],
    },

    // --- API REFERENCE ---
    "Authentication": {
        title: "API Authentication",
        category: "API Reference",
        icon: Shield,
        content: "All requests to the Doweit API must be authenticated with a Bearer Token generated in your Dashboard settings.",
        code: "Authorization: Bearer YOUR_API_KEY",
        steps: ["Generate a key in API Keys page", "Include in your HTTP headers", "Keep your key secret"],
    },
    "Endpoints": {
        title: "Standard Endpoints",
        category: "API Reference",
        icon: Terminal,
        content: "Access programmatic control over your agents, transcripts, and call logs using our RESTful endpoints.",
        code: "GET /api/v1/agents\nPOST /api/v1/calls",
        steps: ["Review the endpoint list", "Test with Postman or Curl", "Observe rate limit constraints"],
    },
    "Webhooks": {
        title: "Configuring Webhooks",
        category: "API Reference",
        icon: Terminal,
        content: "Receive real-time events on your server whenever a call starts, ends, or a user performs a specific action.",
        code: "{\n  \"event\": \"call.completed\",\n  \"duration\": 120,\n  \"summary\": \"...\"\n}",
        steps: ["Enter your endpoint URL in Settings", "Select which events to listen for", "Validate the signed payload"],
    }
};