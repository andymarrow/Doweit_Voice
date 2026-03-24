// lib/doweit-sdk/useDoweitVoice.js
//
// Local SDK copy used by the embedded SDK playground tab. Mirrors the
// published @doweit/voice package (v0.1.6+) — keep them in sync. Notable
// behaviour:
//   * 2048 PCM buffer @ 16 kHz to keep VAD turns snappy under main-thread
//     pressure (Framer Motion etc.).
//   * Partial-transcript coalescing for both user and AI bubbles so a
//     streamed sentence renders as ONE bubble, not many fragments.
//   * Eager AudioContext unlock inside the user-gesture chain.
//   * Single-flight WS guard so rapid sendText/connect calls don't spawn
//     two concurrent Gemini Live sessions.

import { useState, useEffect, useRef, useCallback } from "react";

const floatTo16BitPCM = (float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
};

const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
};

export function useDoweitVoice(client) {
    const [status, setStatus] = useState("idle");
    const [messages, setMessages] = useState([]);
    const [currentAction, setCurrentAction] = useState(null);
    const [transcript, setTranscript] = useState("");

    const wsRef = useRef(null);
    const audioInRef = useRef(null);
    const audioOutRef = useRef(null);
    const micRef = useRef(null);
    const procRef = useRef(null);
    const nextPlayRef = useRef(0);
    const activeSourcesRef = useRef([]);

    // Partial-transcript accumulators. Gemini Live streams transcripts in many
    // small chunks while speech happens; we coalesce them into one bubble per
    // turn so the chat doesn't flood with fragments.
    const pendingUserTextRef = useRef("");
    const pendingAiTextRef = useRef("");

    const stopAudioPlayback = useCallback(() => {
        for (const src of activeSourcesRef.current) {
            try { src.stop(); } catch {}
        }
        activeSourcesRef.current = [];
        if (audioOutRef.current) {
            try { audioOutRef.current.close(); } catch {}
            audioOutRef.current = null;
        }
        nextPlayRef.current = 0;
    }, []);

    const playAudioChunk = useCallback((base64Data) => {
        if (!audioOutRef.current) {
            audioOutRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioOutRef.current;
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }
        try {
            const binary = window.atob(base64Data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const int16 = new Int16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
            const buffer = ctx.createBuffer(1, float32.length, 24000);
            buffer.copyToChannel(float32, 0);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            const now = ctx.currentTime;
            const startAt = nextPlayRef.current < now ? now : nextPlayRef.current;
            source.start(startAt);
            nextPlayRef.current = startAt + buffer.duration;
            activeSourcesRef.current.push(source);

            source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                if (activeSourcesRef.current.length === 0) {
                    setStatus(prev => (prev === "speaking" ? "listening" : prev));
                }
            };
        } catch (e) {
            console.error("[Doweit Playback] Error:", e);
        }
    }, []);

    const startMic = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
            });
            if (wsRef.current?.readyState !== WebSocket.OPEN) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }
            if (!audioOutRef.current) {
                audioOutRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            if (audioOutRef.current.state === "suspended") {
                await audioOutRef.current.resume();
            }
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            if (audioCtx.state === "suspended") {
                await audioCtx.resume();
            }
            audioInRef.current = audioCtx;
            micRef.current = stream;
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(2048, 1, 1);
            procRef.current = processor;
            processor.onaudioprocess = (e) => {
                if (wsRef.current?.readyState !== WebSocket.OPEN) return;
                const float32 = e.inputBuffer.getChannelData(0);
                const pcm16 = floatTo16BitPCM(float32);
                const b64 = arrayBufferToBase64(pcm16);
                wsRef.current.send(JSON.stringify({ type: "audio_input", data: b64 }));
            };
            source.connect(processor);
            processor.connect(audioCtx.destination);
        } catch (err) {
            console.error("[Doweit Mic] Failed to start:", err);
            setStatus("error");
        }
    }, []);

    const disconnect = useCallback(() => {
        stopAudioPlayback();
        if (procRef.current) { try { procRef.current.disconnect(); } catch {} procRef.current = null; }
        if (audioInRef.current) { try { audioInRef.current.close(); } catch {} audioInRef.current = null; }
        if (micRef.current) { micRef.current.getTracks().forEach(t => t.stop()); micRef.current = null; }
        if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; }
        // Reset coalescing buffers so the next session starts clean.
        pendingUserTextRef.current = "";
        pendingAiTextRef.current = "";
        setStatus("idle");
        setCurrentAction(null);
    }, [stopAudioPlayback]);

    const connect = useCallback(async () => {
        if (!client || !client.isInitialized) {
            console.error("[Doweit] Client not initialized.");
            setStatus("error");
            return;
        }
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
            console.log("[Doweit] Connection already in progress, skipping duplicate connect.");
            return;
        }
        setStatus("connecting");

        const httpProtocol = window.location.protocol === "https:" ? "https:" : "http:";
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = client.baseUrl ? client.baseUrl.replace(/^https?:\/\//, "") : window.location.host;

        try {
            await fetch(`${httpProtocol}//${host}/api/sdk/live`, { method: "GET" });
        } catch (e) {
            console.warn("[Doweit] Warm-up fetch failed; attempting WS anyway.", e);
        }

        const wsUrl = `${wsProtocol}//${host}/api/sdk/live?key=${client.publicKey}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus("listening");
            startMic();
        };

        ws.onmessage = async (event) => {
            let msg;
            try { msg = JSON.parse(event.data); }
            catch (e) { console.error("[Doweit WS] Bad JSON:", e); return; }

            try {
                switch (msg.type) {
                    case "ready":
                        break;
                    case "text": {
                        const piece = msg.text || "";
                        pendingAiTextRef.current += piece;
                        const aggregated = pendingAiTextRef.current;
                        setMessages(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === "ai" && last.partial) {
                                return [...prev.slice(0, -1), { ...last, text: aggregated }];
                            }
                            return [...prev, { role: "ai", text: aggregated, partial: true }];
                        });
                        if (msg.turnComplete) {
                            pendingAiTextRef.current = "";
                            setMessages(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === "ai" && last.partial) {
                                    return [...prev.slice(0, -1), { ...last, partial: false }];
                                }
                                return prev;
                            });
                        }
                        break;
                    }
                    case "text_user": {
                        const piece = msg.text || "";
                        pendingUserTextRef.current += piece;
                        const aggregated = pendingUserTextRef.current;
                        setMessages(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === "user" && last.partial) {
                                return [...prev.slice(0, -1), { ...last, text: aggregated }];
                            }
                            return [...prev, { role: "user", text: aggregated, partial: true }];
                        });
                        if (msg.turnComplete) {
                            pendingUserTextRef.current = "";
                            setMessages(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === "user" && last.partial) {
                                    return [...prev.slice(0, -1), { ...last, partial: false }];
                                }
                                return prev;
                            });
                        }
                        break;
                    }
                    case "audio":
                        setStatus("speaking");
                        playAudioChunk(msg.data);
                        break;
                    case "tool_call": {
                        setStatus("executing");
                        setCurrentAction(msg.name);
                        const currentState = client._getCurrentStateSnapshot();
                        const result = await client._executeAction(msg.name, msg.args);
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: "tool_result",
                                id: msg.id,
                                name: msg.name,
                                result,
                                state: currentState,
                            }));
                        }
                        setCurrentAction(null);
                        setStatus("thinking");
                        break;
                    }
                    case "interrupted":
                        stopAudioPlayback();
                        setStatus("listening");
                        break;
                    case "error":
                        console.error("[Doweit WS] Server error:", msg.message);
                        setStatus("error");
                        break;
                }
            } catch (e) {
                console.error("[Doweit WS] onmessage handler threw:", e);
            }
        };

        ws.onerror = (err) => {
            console.error("[Doweit WS] Error:", err);
            setStatus("error");
        };
        ws.onclose = () => {
            disconnect();
        };
    }, [client, startMic, playAudioChunk, stopAudioPlayback, disconnect]);

    const sendText = useCallback(async (text) => {
        if (!text?.trim()) return;
        setMessages(prev => [...prev, { role: "user", text }]);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const state = client._getCurrentStateSnapshot();
            setStatus("thinking");
            wsRef.current.send(JSON.stringify({ type: "text_input", text, state }));
            return;
        }
        await connect();
        const ws = wsRef.current;
        if (!ws) { setStatus("error"); return; }
        const flush = () => {
            const state = client._getCurrentStateSnapshot();
            setStatus("thinking");
            ws.send(JSON.stringify({ type: "text_input", text, state }));
        };
        if (ws.readyState === WebSocket.OPEN) flush();
        else ws.addEventListener("open", flush, { once: true });
    }, [client, connect]);

    const interrupt = useCallback(() => {
        stopAudioPlayback();
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "interrupt" }));
        }
        setStatus("listening");
    }, [stopAudioPlayback]);

    useEffect(() => () => disconnect(), [disconnect]);

    return {
        status,
        messages,
        currentAction,
        transcript,
        connect,
        disconnect,
        sendText,
        interrupt,
    };
}
