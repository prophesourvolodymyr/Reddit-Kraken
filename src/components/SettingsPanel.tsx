import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import {
  LlmProviderConfig,
  LlmProviderTestResult,
  SaveLlmProviderConfigInput,
  RedditStatus,
} from "../types";

interface SettingsPanelProps {
  onClose: () => void;
}

type SettingsTab = "llm" | "api" | "reddit";

interface ProviderFormState {
  id: string | null;
  name: string;
  api_base: string;
  model: string;
  api_key: string;
  enabled: boolean;
  is_active: boolean;
}

interface ApiSettingsState {
  enabled: boolean;
  port: number;
  token: string;
}

interface RedditAccountFormState {
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  token_v2: string;
  session_cookie: string;
}

const emptyForm = (): ProviderFormState => ({
  id: null,
  name: "OpenAI",
  api_base: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  api_key: "",
  enabled: true,
  is_active: true,
});

const emptyRedditForm = (): RedditAccountFormState => ({
  client_id: "",
  client_secret: "",
  username: "",
  password: "",
  token_v2: "",
  session_cookie: "",
});

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("llm");
  const [providers, setProviders] = useState<LlmProviderConfig[]>([]);
  const [form, setForm] = useState<ProviderFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [apiSettings, setApiSettings] = useState<ApiSettingsState>({
    enabled: false,
    port: 3840,
    token: "",
  });
  const [apiStatus, setApiStatus] = useState<"unknown" | "running" | "stopped">("unknown");

  const [redditForm, setRedditForm] = useState<RedditAccountFormState>(emptyRedditForm());
  const [redditStatus, setRedditStatus] = useState<RedditStatus | null>(null);
  const [redditLoading, setRedditLoading] = useState(true);
  const [redditConnecting, setRedditConnecting] = useState(false);
  const [redditDisconnecting, setRedditDisconnecting] = useState(false);
  const [redditMessage, setRedditMessage] = useState<string | null>(null);
  const [redditError, setRedditError] = useState<string | null>(null);
  const [redditAuthMode, setRedditAuthMode] = useState<"oauth" | "session" | "manual">("manual");

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<LlmProviderConfig[]>("list_llm_providers");
      setProviders(result);
      const active = result.find((provider) => provider.is_active) ?? result[0];
      if (active) selectProvider(active);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRedditStatus = async () => {
    setRedditLoading(true);
    try {
      const status = await invoke<RedditStatus>("get_reddit_status");
      setRedditStatus(status);
    } catch {
      setRedditStatus({ connected: false, username: null, token_expires_at: null, auth_mode: null });
    } finally {
      setRedditLoading(false);
    }
  };

  useEffect(() => {
    void loadProviders();
    void loadRedditStatus();
  }, []);

  const selectProvider = (provider: LlmProviderConfig) => {
    setForm({
      id: provider.id,
      name: provider.name,
      api_base: provider.api_base,
      model: provider.model,
      api_key: "",
      enabled: provider.enabled,
      is_active: provider.is_active,
    });
    setMessage(null);
    setError(null);
  };

  const startNewProvider = () => {
    setForm(emptyForm());
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload: SaveLlmProviderConfigInput = {
        id: form.id,
        name: form.name,
        provider_kind: "openai",
        api_base: form.api_base,
        model: form.model,
        api_key: form.api_key.trim() ? form.api_key : null,
        enabled: form.enabled,
        is_active: form.is_active,
      };
      const saved = await invoke<LlmProviderConfig>("save_llm_provider_config", {
        input: payload,
      });
      setMessage("Provider saved. API keys are encrypted before being written to SQLite.");
      setForm((prev) => ({ ...prev, id: saved.id, api_key: "" }));
      await loadProviders();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (providerId: string) => {
    setMessage(null);
    setError(null);
    try {
      await invoke("set_active_llm_provider", { providerId });
      await loadProviders();
      setMessage("Active provider updated.");
    } catch (err) {
      setError(formatError(err));
    }
  };

  const handleTest = async () => {
    if (!form.id) {
      setError("Save the provider before testing the connection.");
      return;
    }

    setTesting(true);
    setMessage(null);
    setError(null);
    try {
      const result = await invoke<LlmProviderTestResult>("test_llm_provider", {
        providerId: form.id,
      });
      await loadProviders();
      if (result.ok) {
        setMessage(
          `Connection OK. ${result.total_tokens} tokens used. Response: ${result.message}`,
        );
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(formatError(err));
    } finally {
      setTesting(false);
    }
  };

  const handleRedditLogin = async () => {
    setRedditConnecting(true);
    setRedditMessage(null);
    setRedditError(null);
    try {
      let result: string;
      if (redditAuthMode === "session") {
        result = await invoke<string>("configure_reddit_session", {
          username: redditForm.username,
          password: redditForm.password,
        });
      } else if (redditAuthMode === "manual") {
        result = await invoke<string>("configure_manual_token", {
          tokenV2: redditForm.token_v2,
          username: redditForm.username || "unknown",
          sessionCookie: redditForm.session_cookie || null,
        });
      } else {
        result = await invoke<string>("configure_reddit_auth", {
          clientId: redditForm.client_id,
          clientSecret: redditForm.client_secret,
          username: redditForm.username,
          password: redditForm.password,
        });
      }
      setRedditMessage(result);
      setRedditStatus({ connected: true, username: redditForm.username || "redditor", token_expires_at: null, auth_mode: redditAuthMode });
      setRedditForm((prev) => ({ ...prev, client_secret: "", password: "", token_v2: "" }));
    } catch (err) {
      setRedditError(formatError(err));
    } finally {
      setRedditConnecting(false);
    }
  };

  const handleImportSubscriptions = async () => {
    setRedditMessage(null);
    setRedditError(null);
    try {
      const count = await invoke<number>("import_subscriptions");
      setRedditMessage(`Imported ${count} subreddits from your Reddit account.`);
    } catch (err) {
      setRedditError(formatError(err));
    }
  };

  const handleRedditLogout = async () => {
    setRedditDisconnecting(true);
    setRedditMessage(null);
    setRedditError(null);
    try {
      await invoke("disconnect_reddit");
      setRedditStatus({ connected: false, username: null, token_expires_at: null, auth_mode: null });
      setRedditMessage("Disconnected from Reddit.");
    } catch (err) {
      setRedditError(formatError(err));
    } finally {
      setRedditDisconnecting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <aside className="w-72 shrink-0 border-r border-border/60 bg-black/20 p-4 flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Settings</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("llm")}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                activeTab === "llm"
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              LLM Providers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("api")}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                activeTab === "api"
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Local API
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reddit")}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                activeTab === "reddit"
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Reddit Account
            </button>
          </div>

          {activeTab === "llm" && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Providers</p>
                <button
                  type="button"
                  onClick={startNewProvider}
                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-semibold hover:bg-secondary"
                >
                  New
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain space-y-2 pr-1">
                {loading && <p className="text-sm text-muted-foreground">Loading providers…</p>}
                {!loading && providers.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                    No providers yet. Add an OpenAI-compatible endpoint to enable AI analysis.
                  </p>
                )}
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => selectProvider(provider)}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                      form.id === provider.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{provider.name}</span>
                      {provider.is_active && (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs opacity-70">{provider.model}</p>
                    <p className="mt-2 text-[11px] opacity-70">
                      Key {provider.has_api_key ? "stored" : "missing"} · {provider.total_tokens} tokens
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reddit" && (
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-xs text-muted-foreground mb-2">Account</p>
              <div className="flex-1 overflow-y-auto overscroll-contain space-y-2 pr-1">
                {redditLoading && <p className="text-sm text-muted-foreground">Loading status…</p>}
                {!redditLoading && (
                  <div className="rounded-2xl border border-border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          redditStatus?.connected ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm font-semibold">
                        {redditStatus?.connected
                          ? `Connected as ${redditStatus.username ?? "unknown"}`
                          : "Disconnected"}
                      </span>
                    </div>
                    {redditStatus?.token_expires_at && (
                      <p className="text-[11px] text-muted-foreground">
                        Token expires{" "}
                        {new Date(redditStatus.token_expires_at * 1000).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {activeTab === "llm" && (
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">OpenAI-compatible provider</h2>
                <p className="text-sm text-muted-foreground">
                  Works with OpenAI and compatible proxy endpoints. Default model is gpt-4o-mini.
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Provider name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder="OpenAI"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold">API base</span>
                <input
                  value={form.api_base}
                  onChange={(event) => setForm((prev) => ({ ...prev, api_base: event.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder="https://api.openai.com/v1"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold">Model</span>
                <input
                  value={form.model}
                  onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder="gpt-4o-mini"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold">API key</span>
                <input
                  value={form.api_key}
                  onChange={(event) => setForm((prev) => ({ ...prev, api_key: event.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder={form.id ? "Leave blank to keep stored encrypted key" : "sk-..."}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  The key is encrypted before storage and is never sent to the React UI after saving.
                </p>
              </label>

              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
                  />
                  Enabled
                </label>
                <label className="flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                  />
                  Make active provider
                </label>
              </div>

              {message && (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
              <div className="text-xs text-muted-foreground">
                {form.id ? "Editing saved provider" : "Creating new provider"}
              </div>
              <div className="flex gap-3">
                {form.id && (
                  <button
                    type="button"
                    onClick={() => void handleSetActive(form.id ?? "")}
                    className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
                  >
                    Set Active
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleTest()}
                  disabled={testing || !form.id}
                  className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {testing ? "Testing…" : "Test Connection"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="rounded-2xl bg-foreground px-5 py-2 text-sm font-bold text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Provider"}
                </button>
              </div>
            </div>
          </main>
        )}

        {activeTab === "api" && (
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">Local API</h2>
                <p className="text-sm text-muted-foreground">
                  Loopback-only HTTP API for scripting and automation. Only accessible from this machine.
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
              <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                <div>
                  <span className="text-sm font-semibold">Enable Local API</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    When enabled, the API listens only on 127.0.0.1
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setApiSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                    apiSettings.enabled ? "bg-green-500" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all duration-200 ${
                      apiSettings.enabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold">Port</span>
                <input
                  type="number"
                  value={apiSettings.port}
                  onChange={(event) =>
                    setApiSettings((prev) => ({
                      ...prev,
                      port: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  min={1024}
                  max={65535}
                  disabled={!apiSettings.enabled}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold">Access Token</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiSettings.token || "No token generated"}
                    readOnly
                    className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setApiSettings((prev) => ({
                        ...prev,
                        token: `rk-${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`,
                      }))
                    }
                    className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    apiStatus === "running"
                      ? "bg-green-500"
                      : apiStatus === "stopped"
                        ? "bg-red-500"
                        : "bg-border"
                  }`}
                />
                <div>
                  <span className="text-sm font-semibold">
                    Status:{" "}
                    {apiStatus === "running"
                      ? "Running"
                      : apiStatus === "stopped"
                        ? "Stopped"
                        : "Unknown"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {apiStatus === "running"
                      ? `Listening on http://127.0.0.1:${apiSettings.port}`
                      : "API server is not running"}
                  </p>
                </div>
              </div>

              {apiSettings.enabled && apiSettings.token && (
                <div className="rounded-2xl border border-border p-4 bg-foreground/5">
                  <p className="text-xs font-semibold mb-1">Example request</p>
                  <code className="block text-xs text-muted-foreground select-all">
                    curl -H "Authorization: Bearer {apiSettings.token}" {"\n"}
                    {"  "}http://127.0.0.1:{apiSettings.port}/api/posts
                  </code>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
              <div className="text-xs text-muted-foreground">
                API is {apiSettings.enabled ? "enabled" : "disabled"}
              </div>
              <button
                type="button"
                onClick={() => setApiStatus(apiSettings.enabled ? "running" : "stopped")}
                className="rounded-2xl bg-foreground px-5 py-2 text-sm font-bold text-background hover:opacity-90 transition-opacity"
              >
                {apiSettings.enabled ? "Restart API Server" : "Save Settings"}
              </button>
            </div>
          </main>
        )}

        {activeTab === "reddit" && (
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">Reddit Account</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to fetch live posts and subreddit data. Session mode uses your browser login — no app registration needed.
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    redditStatus?.connected
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                <div>
                  <span className="text-sm font-semibold">
                    Status:{" "}
                    {redditStatus?.connected
                      ? `Connected as u/${redditStatus.username ?? "unknown"} (${redditStatus.auth_mode ?? "oauth"})`
                      : "Disconnected"}
                  </span>
                  {redditStatus?.token_expires_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Session expires{" "}
                      {new Date(redditStatus.token_expires_at * 1000).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {redditStatus?.connected ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your credentials are encrypted and stored locally. You can disconnect at any time.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void handleImportSubscriptions()}
                      className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary"
                    >
                      Import Subscriptions
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRedditLogout()}
                      disabled={redditDisconnecting}
                      className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {redditDisconnecting ? "Disconnecting…" : "Logout"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2 rounded-2xl border border-border bg-background p-1">
                    <button
                      type="button"
                      onClick={() => setRedditAuthMode("manual")}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        redditAuthMode === "manual"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Token
                    </button>
                    <button
                      type="button"
                      onClick={() => setRedditAuthMode("session")}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        redditAuthMode === "session"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setRedditAuthMode("oauth")}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        redditAuthMode === "oauth"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      OAuth
                    </button>
                  </div>

                  {redditAuthMode === "manual" ? (
                    <>
                      <div className="rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Manual Token — fastest way in</p>
                        <p className="mb-2">
                          Copy <code className="bg-secondary px-1 rounded">token_v2</code> from browser cookies.
                          DevTools → Application → Cookies → reddit.com.
                        </p>
                        <p>Token lasts ~24h. Add session cookie below for auto-refresh.</p>
                      </div>
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">token_v2</span>
                        <textarea
                          value={redditForm.token_v2}
                          onChange={(event) =>
                            setRedditForm((prev) => ({ ...prev, token_v2: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-foreground resize-none font-mono"
                          placeholder="eyJhbGciOiJSUzI1NiIs..."
                          rows={3}
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">reddit_session (optional — for auto-refresh)</span>
                        <textarea
                          value={redditForm.session_cookie}
                          onChange={(event) =>
                            setRedditForm((prev) => ({ ...prev, session_cookie: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-foreground resize-none font-mono"
                          placeholder="eyJhbGciOiJSUzI1NiIs..."
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Paste <code className="bg-secondary px-1 rounded">reddit_session</code> from the same cookie list.
                          With this, the app auto-refreshes token_v2 every ~23h for ~180 days.
                        </p>
                      </label>
                    </>
                  ) : redditAuthMode === "session" ? (
                    <div className="rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
                      <p className="font-semibold mb-1">Browser Session — no app registration needed</p>
                      <p className="mb-2">
                        Uses the same login as your browser. Enter your Reddit username and password.
                        Works even though Reddit closed self-serve API access. Session lasts ~180 days.
                      </p>
                      <p>
                        Credentials encrypted with AES-256-GCM before storage. Only sent directly to Reddit.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Setup instructions:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Go to{" "}
                            <a
                              href="https://www.reddit.com/prefs/apps"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              reddit.com/prefs/apps
                            </a>
                          </li>
                          <li>Click &quot;Create App&quot; at the bottom</li>
                          <li>Choose type: <strong>script</strong></li>
                          <li>Set redirect URI to <code className="bg-secondary px-1 rounded">http://localhost:8080</code></li>
                          <li>Copy the client ID (under the app name) and secret</li>
                        </ol>
                      </div>
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">Client ID</span>
                        <input
                          value={redditForm.client_id}
                          onChange={(event) =>
                            setRedditForm((prev) => ({ ...prev, client_id: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                          placeholder="Your script app client ID"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">Client Secret</span>
                        <input
                          value={redditForm.client_secret}
                          onChange={(event) =>
                            setRedditForm((prev) => ({ ...prev, client_secret: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                          placeholder="Your script app secret"
                          type="password"
                        />
                      </label>
                    </>
                  )}

                  {redditAuthMode === "manual" ? (
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold">token_v2</span>
                      <textarea
                        value={redditForm.token_v2}
                        onChange={(event) =>
                          setRedditForm((prev) => ({ ...prev, token_v2: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-foreground resize-none font-mono"
                        placeholder="eyJhbGciOiJSUzI1NiIs..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        The long JWT string from your browser cookies. Never shared with any third party.
                      </p>
                    </label>
                  ) : (
                    <>
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">Reddit Username</span>
                        <input
                          value={redditForm.username}
                          onChange={(event) =>
                            setRedditForm((prev) => ({ ...prev, username: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                          placeholder="Your Reddit username"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">Reddit Password</span>
                        <input
                          value={redditForm.password}
                          onChange={(event) =>
                            setRedditForm((prev) => ({ ...prev, password: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                          placeholder="Your Reddit password"
                          type="password"
                        />
                        <p className="text-xs text-muted-foreground">
                          Credentials are encrypted with AES-256-GCM before storage and never sent to any server except Reddit.
                        </p>
                      </label>
                    </>
                  )}
                </>
              )}

              {redditMessage && (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                  {redditMessage}
                </div>
              )}
              {redditError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {redditError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
              <div className="text-xs text-muted-foreground">
                {redditStatus?.connected
                  ? `Authenticated via ${redditStatus.auth_mode ?? "oauth"}`
                  : redditAuthMode === "manual"
                    ? "Paste your token_v2 from browser cookies"
                    : redditAuthMode === "session"
                      ? "Enter your Reddit username and password"
                      : "Enter your Reddit Script app credentials"}
              </div>
              {!redditStatus?.connected && (
                <button
                  type="button"
                  onClick={() => void handleRedditLogin()}
                  disabled={
                    redditConnecting ||
                    (redditAuthMode === "oauth" && (!redditForm.client_id || !redditForm.client_secret)) ||
                    (redditAuthMode === "manual" && !redditForm.token_v2) ||
                    (redditAuthMode !== "manual" && (!redditForm.username || !redditForm.password))
                  }
                  className="rounded-2xl bg-foreground px-5 py-2 text-sm font-bold text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {redditConnecting ? "Connecting…" : "Login"}
                </button>
              )}
            </div>
          </main>
        )}
      </motion.div>
    </motion.div>
  );
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected provider settings error";
}
