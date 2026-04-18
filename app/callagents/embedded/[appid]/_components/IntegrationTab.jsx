"use client";
// app/callagents/embedded/[appid]/_components/IntegrationTab.jsx

import React, { useState } from "react";
import {
    FiShield,
    FiTerminal,
    FiCopy,
    FiCheck,
    FiEye,
    FiEyeOff,
    FiCode,
    FiPackage,
    FiZap,
} from "react-icons/fi";
import { uiColors } from "@/app/callagents/_constants/uiConstants";
import { toast } from "react-hot-toast";

const FRAMEWORKS = [
    { id: "react", label: "React / Next.js", icon: "⚛️" },
    { id: "html", label: "HTML / CDN", icon: "🌐" },
    { id: "vue", label: "Vue 3", icon: "🟢" },
];

export default function IntegrationTab({ appData, manifest }) {
    const [framework, setFramework] = useState("react");
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(null);

    const copy = (label, text) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(null), 1800);
    };

    const exampleAction = manifest?.actions?.[0];
    const actionExample = exampleAction
        ? `${exampleAction.name}: {
    description: "${exampleAction.description?.replace(/"/g, '\\"') || ''}",
    handler: async (args) => {
      // your code here
      return { status: "ok" };
    }
  }`
        : `addToCart: {
    description: "Add an item to the shopping cart",
    params: { itemId: { required: true }, qty: { required: true } },
    handler: async ({ itemId, qty }) => {
      // your code here
      return { status: "ok" };
    }
  }`;

    const reactSnippet = `import { DoweitClient, DoweitWidget } from "@doweit/voice";
import { useEffect, useState } from "react";

const client = new DoweitClient({
  publicKey: "${appData.publicKey}",
});

client.register({
  ${actionExample}
});

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { client.init().then(() => setReady(true)); }, []);
  return ready ? <DoweitWidget client={client} /> : null;
}`;

    const htmlSnippet = `<script src="https://cdn.doweit.com/voice/v1.js"></script>
<script>
  const client = new Doweit.DoweitClient({
    publicKey: "${appData.publicKey}"
  });

  client.register({
    ${actionExample}
  });

  client.init().then(() => Doweit.mountWidget(client));
</script>`;

    const vueSnippet = `<script setup>
import { onMounted, ref } from "vue";
import { DoweitClient, mountWidget } from "@doweit/voice";

const client = new DoweitClient({ publicKey: "${appData.publicKey}" });

client.register({
  ${actionExample}
});

onMounted(async () => {
  await client.init();
  mountWidget(client);
});
</script>`;

    const snippet =
        framework === "react" ? reactSnippet : framework === "html" ? htmlSnippet : vueSnippet;
    const installCmd =
        framework === "html"
            ? "<!-- via CDN — no install needed -->"
            : "npm install @doweit/voice";

    const masked = "•".repeat(Math.max(0, appData.publicKey.length - 12)) + appData.publicKey.slice(-12);

    return (
        <div className="space-y-6">

            {/* Publishable Key card */}
            <div className={`relative overflow-hidden p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                        <FiShield className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>Publishable key</h3>
                        <p className={`text-sm ${uiColors.textSecondary}`}>
                            Safe to expose in client-side code. Restrict its usage with the domain whitelist in Settings.
                        </p>
                    </div>
                </div>

                <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${uiColors.borderPrimary} bg-gray-50 dark:bg-gray-950 font-mono text-sm`}>
                    <span className={`flex-1 truncate ${uiColors.textPrimary}`}>
                        {showKey ? appData.publicKey : masked}
                    </span>
                    <button
                        onClick={() => setShowKey(s => !s)}
                        className={`p-2 rounded-lg ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                        title={showKey ? "Hide" : "Reveal"}
                    >
                        {showKey ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button
                        onClick={() => copy("Key", appData.publicKey)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                            copied === "Key"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : `${uiColors.bgSecondary} ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`
                        }`}
                    >
                        {copied === "Key" ? <FiCheck /> : <FiCopy />}
                        {copied === "Key" ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>

            {/* Install + framework picker */}
            <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shrink-0">
                        <FiPackage className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>Install</h3>
                        <p className={`text-sm ${uiColors.textSecondary}`}>
                            Pick your framework — we'll generate a paste-ready snippet using your project key.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                    {FRAMEWORKS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFramework(f.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                framework === f.id
                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                                    : `${uiColors.borderPrimary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                            }`}
                        >
                            <span>{f.icon}</span>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Install command */}
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-800">
                    <div className="bg-gray-900 px-4 py-2 text-gray-300 font-mono text-xs flex justify-between items-center">
                        <span className="flex items-center gap-2"><FiTerminal /> Terminal</span>
                        {framework !== "html" && (
                            <button
                                onClick={() => copy("Install", installCmd)}
                                className="text-gray-400 hover:text-white"
                            >
                                {copied === "Install" ? <FiCheck className="text-emerald-400"/> : <FiCopy />}
                            </button>
                        )}
                    </div>
                    <pre className="bg-gray-950 px-4 py-3 text-emerald-400 font-mono text-sm">{installCmd}</pre>
                </div>

                {/* Code snippet */}
                <div className="rounded-xl overflow-hidden border border-gray-800">
                    <div className="bg-gray-900 px-4 py-2 text-gray-300 font-mono text-xs flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <FiCode /> {framework === "react" ? "App.jsx" : framework === "html" ? "index.html" : "App.vue"}
                        </span>
                        <button
                            onClick={() => copy("Snippet", snippet)}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs"
                        >
                            {copied === "Snippet" ? <FiCheck className="text-emerald-400"/> : <FiCopy />}
                            {copied === "Snippet" ? "Copied" : "Copy"}
                        </button>
                    </div>
                    <pre className="bg-gray-950 px-5 py-4 text-blue-300 font-mono text-sm overflow-x-auto leading-relaxed">
                        <code>{snippet}</code>
                    </pre>
                </div>
            </div>

            {/* Quick concept guide */}
            <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0">
                        <FiZap className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>How it works</h3>
                        <p className={`text-sm ${uiColors.textSecondary}`}>
                            Doweit is capability-first: you expose JS functions, the AI decides when and how to call them.
                        </p>
                    </div>
                </div>

                <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { n: 1, title: "Register", body: "Expose what your app can do via ai.register()." },
                        { n: 2, title: "Sync manifest", body: "On init, the SDK uploads a snapshot to your dashboard." },
                        { n: 3, title: "Run", body: "Gemini Live calls your handlers; results loop back to the AI." },
                    ].map(step => (
                        <li
                            key={step.n}
                            className={`p-4 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">
                                    {step.n}
                                </span>
                                <span className={`font-bold ${uiColors.textPrimary}`}>{step.title}</span>
                            </div>
                            <p className={`text-sm ${uiColors.textSecondary}`}>{step.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
