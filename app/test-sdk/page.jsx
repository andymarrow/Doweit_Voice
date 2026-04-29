"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DoweitClient, DoweitWidget } from '@doweit/voice';
import { uiColors } from '../callagents/_constants/uiConstants';

export default function SdkTestEnvironment() {
    const [bgColor, setBgColor] = useState('bg-white dark:bg-gray-900');
    const [cartCount, setCartCount] = useState(0);
    const router = useRouter();

    // Keep refs so the stable client can always read fresh values
    const bgColorRef = useRef(bgColor);
    const cartCountRef = useRef(cartCount);
    bgColorRef.current = bgColor;
    cartCountRef.current = cartCount;

    // Empty deps — client is created once and never torn down on state changes.
    // bindState reads from refs so it always returns the latest values.
    const client = useMemo(() => {
        const ai = new DoweitClient({
            publicKey: 'dw_pub_e1afb358b3807e775d791e1384ea2754e909325de10ead10',
            baseUrl: 'http://localhost:3000'
        });

        ai.bindState(() => ({
            cartItems: cartCountRef.current,
            currentPage: "Test Playground",
            currentTime: new Date().toLocaleTimeString()
        }));

        ai.register({
            changeBackgroundColor: {
                description: "Changes the background color of the website.",
                params: { color: { required: true, type: "string" } },
                handler: async ({ color }) => {
                    const c = color.toLowerCase();
                    if (c.includes('red')) setBgColor('bg-red-100 dark:bg-red-900');
                    else if (c.includes('blue')) setBgColor('bg-blue-100 dark:bg-blue-900');
                    else if (c.includes('green')) setBgColor('bg-green-100 dark:bg-green-900');
                    else setBgColor('bg-white dark:bg-gray-900');
                    return { status: "success", message: `Background changed to ${color}` };
                }
            },
            addToCart: {
                description: "Adds an item to the user's shopping cart.",
                params: { itemName: { required: true } },
                handler: async ({ itemName }) => {
                    setCartCount(prev => prev + 1);
                    return { status: "success", message: `Added ${itemName} to cart.` };
                }
            },
            visitAlanAI: {
                description: "Navigate the user to the Alan AI embedded page. Use this when the user asks to visit, open, or go to Alan AI.",
                handler: async () => {
                    console.log('[SDK Test] visitAlanAI HANDLER CALLED — navigating');
                    alert('visitAlanAI handler executed! Will navigate to /callagents/embedded');
                    window.location.href = '/callagents/embedded';
                    return { status: "navigated", route: "/callagents/embedded" };
                }
            }
        });

        return ai;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty — refs keep state fresh without recreating the client

    useEffect(() => {
        console.log('[SDK Test] Mounted — new build with window.location navigation');
        if (client && !client.isInitialized) {
            client.init().catch(err => console.error("SDK Init Error:", err));
        }
    }, [client]);

    return (
        <div className={`min-h-screen transition-colors duration-500 flex flex-col items-center justify-center ${bgColor} ${uiColors.textPrimary}`}>
            <div className="max-w-2xl text-center space-y-6 p-8 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl bg-white/50 dark:bg-black/50 backdrop-blur-md">

                <h1 className="text-4xl font-extrabold tracking-tight">Doweit SDK Playground</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Testing the published <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">@doweit/voice</code> package.
                </p>

                <div className="flex justify-center gap-6 py-6">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Cart Items</p>
                        <p className="text-4xl font-black text-cyan-600">{cartCount}</p>
                    </div>
                </div>

                <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-900 p-4 rounded-xl text-left font-mono">
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">Try saying/typing:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>"I want to visit Alan AI"</li>
                        <li>"Change the background to blue"</li>
                        <li>"Add a laptop to my cart"</li>
                        <li>"How many items are in my cart right now?"</li>
                    </ul>
                </div>
            </div>

            <DoweitWidget client={client} />
        </div>
    );
}