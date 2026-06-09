import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  LlmProviderConfig,
  LlmProviderTestResult,
  SaveLlmProviderConfigInput,
} from "../types";

interface SettingsPanelProps {
  onClose: () => void;
}

interface ProviderFormState {
  id: string | null;
  name: string;
  api_base: string;
  model: string;
  api_key: string;
  enabled: boolean;
  is_active: boolean;
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

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [providers, setProviders] = useState<LlmProviderConfig[]>([]);
  const [form, setForm] = useState<ProviderFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    void loadProviders();
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="flex max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-2xl">
        <aside className="w-72 shrink-0 border-r border-border/60 bg-black/20 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="text-xs text-muted-foreground">LLM Providers</p>
            </div>
            <button
              type="button"
              onClick={startNewProvider}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              New
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto overscroll-contain pr-1">
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
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold">OpenAI-compatible provider</h2>
              <p className="text-sm text-muted-foreground">
                Works with OpenAI and compatible proxy endpoints. Default model is gpt-4o-mini.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Close
            </button>
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
      </div>
    </div>
  );
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected provider settings error";
}
