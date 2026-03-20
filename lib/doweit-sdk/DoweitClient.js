// lib/doweit-sdk/DoweitClient.js
// Capability-first AI SDK — see .claude/alan ai documentation.pdf

const ANON_KEY = "doweit_anonymous_id";

function generateAnonId() {
    return "anon_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function readAnonId() {
    if (typeof window === "undefined") return generateAnonId();
    try {
        let id = window.localStorage.getItem(ANON_KEY);
        if (!id) {
            id = generateAnonId();
            window.localStorage.setItem(ANON_KEY, id);
        }
        return id;
    } catch {
        return generateAnonId();
    }
}

export class DoweitClient {
    constructor(config) {
        if (!config?.publicKey) {
            throw new Error("[Doweit SDK] publicKey is required.");
        }

        this.publicKey = config.publicKey;
        this.baseUrl = config.baseUrl || "";

        // Capability registry
        this.actions = new Map();
        this.middlewares = [];

        // State
        this.state = {};
        this.stateBinders = {};
        this.stateGetters = {}; // ai.registerState({ getCart: () => cart })

        // Identity
        this.user = null;
        this.anonymousId = readAnonId();

        // Localization
        this.language = config.language || null;
        this.languageMode = "strict"; // strict | adaptive | manual
        this.supportedLanguages = [];

        // UI hooks (overridable by host app)
        this.confirmationHandler = null; // (action, args) => Promise<boolean>
        this.fallback = null;            // { message, suggestions }

        // Routing
        this.activeScopes = new Set(["global"]);

        // Lifecycle
        this.isInitialized = false;
        this.agentConfig = null;
        this._listeners = { action: [], status: [], message: [] };
    }

    // ---------------------------------------------------------------------
    //  CAPABILITY REGISTRATION
    // ---------------------------------------------------------------------
    register(actionsConfig) {
        for (const [name, config] of Object.entries(actionsConfig)) {
            if (!config.description) {
                throw new Error(`[Doweit SDK] Action '${name}' requires a 'description'.`);
            }
            this.actions.set(name, {
                name,
                description: config.description,
                params: config.params || {},
                handler: config.handler || null,
                scope: config.scope || "global",
                dangerous: !!config.dangerous,
                requireConfirmation: !!config.requireConfirmation || !!config.dangerous,
            });
        }
        return this;
    }

    unregister(name) {
        this.actions.delete(name);
        return this;
    }

    use(middleware) {
        if (typeof middleware !== "function") {
            throw new Error("[Doweit SDK] Middleware must be a function (action, next) => any");
        }
        this.middlewares.push(middleware);
        return this;
    }

    // ---------------------------------------------------------------------
    //  STATE
    // ---------------------------------------------------------------------
    setState(newState) {
        this.state = { ...this.state, ...newState };
        return this;
    }

    bindState(getter) {
        if (typeof getter !== "function") {
            throw new Error("[Doweit SDK] bindState requires a function returning an object.");
        }
        this.stateBinders["__bind__"] = getter;
        return this;
    }

    registerState(getters) {
        for (const [key, fn] of Object.entries(getters)) {
            if (typeof fn !== "function") continue;
            this.stateGetters[key] = fn;
        }
        return this;
    }

    _getCurrentStateSnapshot() {
        const dynamic = {};
        if (this.stateBinders.__bind__) {
            try {
                Object.assign(dynamic, this.stateBinders.__bind__() || {});
            } catch (e) {
                console.error("[Doweit SDK] bindState getter threw:", e);
            }
        }
        for (const [key, fn] of Object.entries(this.stateBinders)) {
            if (key === "__bind__") continue;
            try {
                dynamic[key] = fn();
            } catch (e) {
                console.error(`[Doweit SDK] stateBinder '${key}' threw:`, e);
            }
        }
        return { ...this.state, ...dynamic };
    }

    // ---------------------------------------------------------------------
    //  IDENTITY
    // ---------------------------------------------------------------------
    setUser(user) {
        this.user = user || null;
        return this;
    }

    getIdentity() {
        return {
            anonymousId: this.anonymousId,
            user: this.user,
        };
    }

    // ---------------------------------------------------------------------
    //  LOCALIZATION
    // ---------------------------------------------------------------------
    setLanguage(lang) {
        this.language = lang;
        return this;
    }

    enableMultilingual({ mode = "adaptive", supported = [] } = {}) {
        this.languageMode = mode;
        this.supportedLanguages = supported;
        return this;
    }

    // ---------------------------------------------------------------------
    //  UX HOOKS
    // ---------------------------------------------------------------------
    setFallback({ message, suggestions = [] }) {
        this.fallback = { message, suggestions };
        return this;
    }

    onConfirmation(handler) {
        this.confirmationHandler = handler;
        return this;
    }

    enableNavigation(router) {
        this.register({
            navigate: {
                description: "Navigate the user to a different page in the app.",
                params: { route: { type: "string", required: true } },
                handler: ({ route }) => {
                    if (router?.push) router.push(route);
                    else if (typeof window !== "undefined") window.location.href = route;
                    return { status: "navigated", route };
                },
            },
        });
        return this;
    }

    // ---------------------------------------------------------------------
    //  ROUTE / SCOPE
    // ---------------------------------------------------------------------
    setActiveRoute(route) {
        this.activeScopes = new Set(["global", route]);
        for (const [, action] of this.actions.entries()) {
            // Wildcard scope: if scope ends with /*, match prefix
            if (action.scope.endsWith("/*")) {
                const prefix = action.scope.slice(0, -2);
                if (route?.startsWith(prefix)) this.activeScopes.add(action.scope);
            }
        }
        return this;
    }

    _getActiveActions() {
        const out = [];
        for (const action of this.actions.values()) {
            if (action.scope === "global" || this.activeScopes.has(action.scope)) {
                out.push(action);
            }
        }
        return out;
    }

    // ---------------------------------------------------------------------
    //  EVENT EMITTER
    // ---------------------------------------------------------------------
    on(event, handler) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
        return () => {
            this._listeners[event] = this._listeners[event].filter(h => h !== handler);
        };
    }

    _emit(event, payload) {
        for (const handler of this._listeners[event] || []) {
            try { handler(payload); } catch (e) { console.error(e); }
        }
    }

    // ---------------------------------------------------------------------
    //  MANIFEST
    // ---------------------------------------------------------------------
    _getManifestActions() {
        return Array.from(this.actions.values()).map(a => ({
            name: a.name,
            description: a.description,
            params: a.params,
            scope: a.scope,
            dangerous: a.dangerous,
        }));
    }

    // ---------------------------------------------------------------------
    //  INIT
    // ---------------------------------------------------------------------
    async init() {
        if (this.isInitialized) return this;

        const initRes = await fetch(`${this.baseUrl}/api/sdk/init`, {
            method: "GET",
            headers: { Authorization: `Bearer ${this.publicKey}` },
        });

        if (!initRes.ok) {
            const errText = await initRes.text();
            throw new Error(`[Doweit SDK] Init failed: ${errText}`);
        }

        const initData = await initRes.json();
        this.agentConfig = initData.config;
        if (!this.language) {
            this.language = this.agentConfig?.agent?.language || "en";
        }

        const stateKeys = [
            ...Object.keys(this.state),
            ...Object.keys(this.stateBinders),
            ...Object.keys(this.stateGetters),
        ];

        const manifestRes = await fetch(`${this.baseUrl}/api/sdk/manifest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.publicKey}`,
            },
            body: JSON.stringify({
                actions: this._getManifestActions(),
                stateSchema: stateKeys,
                environment:
                    typeof window !== "undefined" && window.location.hostname === "localhost"
                        ? "development"
                        : "production",
            }),
        });

        if (!manifestRes.ok) {
            console.warn("[Doweit SDK] Manifest sync failed; SDK will run with last known manifest.");
        }

        this.isInitialized = true;
        return this;
    }

    // ---------------------------------------------------------------------
    //  EXECUTION
    // ---------------------------------------------------------------------
    async _executeAction(actionName, args = {}) {
        const action = this.actions.get(actionName);

        if (!action) {
            return { status: "error", message: `Action '${actionName}' is not registered.` };
        }

        // Validation
        const missing = [];
        for (const [key, rules] of Object.entries(action.params || {})) {
            if (rules.required && (args[key] === undefined || args[key] === null || args[key] === "")) {
                missing.push(key);
            }
        }
        if (missing.length > 0) {
            return {
                status: "clarification_needed",
                missing_fields: missing,
                message: `SYSTEM: Cannot execute. Ask the user for: ${missing.join(", ")}.`,
            };
        }

        // Confirmation
        if (action.requireConfirmation) {
            const ok = this.confirmationHandler
                ? await this.confirmationHandler(action, args)
                : (typeof window !== "undefined" &&
                   window.confirm(`Confirm: ${action.description}`));
            if (!ok) {
                return { status: "cancelled", message: "User cancelled the action." };
            }
        }

        // Middleware chain
        let cancelled = false;
        let mutatedArgs = args;
        const runMiddleware = async (idx) => {
            if (idx >= this.middlewares.length) return;
            await this.middlewares[idx](
                { name: actionName, args: mutatedArgs, action },
                (nextArgs) => {
                    if (nextArgs) mutatedArgs = nextArgs;
                    return runMiddleware(idx + 1);
                },
                () => { cancelled = true; }
            );
        };
        try {
            await runMiddleware(0);
        } catch (e) {
            return { status: "error", message: `Middleware threw: ${e.message}` };
        }
        if (cancelled) {
            return { status: "blocked", message: "Action blocked by middleware." };
        }

        this._emit("action", { name: actionName, args: mutatedArgs });

        if (!action.handler) {
            return { status: "noop", message: "No handler bound for this action." };
        }

        try {
            const result = await action.handler(mutatedArgs);
            return {
                status: "success",
                result: result !== undefined ? result : "Action executed.",
            };
        } catch (error) {
            console.error(`[Doweit SDK] Handler '${actionName}' threw:`, error);
            return { status: "error", message: error.message };
        }
    }
}
