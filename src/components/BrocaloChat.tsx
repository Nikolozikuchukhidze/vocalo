import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { MessageCircle, X, Send, Sparkles, Mic2, Music2, Flame } from "lucide-react";
import { chatWithBrocalo, type CoachMessage, type VoiceContext } from "@/lib/coach.functions";
import { useAuth } from "@/hooks/use-auth";

const STORAGE_KEY = "brocalo.chat.v1";
const VOICE_KEY = "brocalo.voice.v1";

type StoredMessage = CoachMessage & { id: string; ts: number };

function loadMessages(): StoredMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredMessage[];
  } catch {
    return [];
  }
}

function loadVoice(): VoiceContext {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VOICE_KEY);
    return raw ? (JSON.parse(raw) as VoiceContext) : {};
  } catch {
    return {};
  }
}

export function saveBrocaloVoiceContext(patch: VoiceContext) {
  if (typeof window === "undefined") return;
  const cur = loadVoice();
  localStorage.setItem(VOICE_KEY, JSON.stringify({ ...cur, ...patch }));
}

const QUICK_PROMPTS = [
  { icon: Flame, label: "Warm me up", text: "Give me a 5-minute warm-up routine I can do right now." },
  { icon: Music2, label: "Song picks", text: "Suggest 3 songs that fit my voice perfectly." },
  { icon: Mic2, label: "Practice plan", text: "Build me a 7-day practice plan to improve control." },
];

export function BrocaloChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const callChat = useServerFn(chatWithBrocalo);
  const { user } = useAuth();

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        inputRef.current?.focus();
      });
    }
  }, [open, messages, sending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    setError(null);
    const userMsg: StoredMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      ts: Date.now(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const voice: VoiceContext = {
        ...loadVoice(),
        username:
          (user?.user_metadata?.username as string | undefined) ??
          (user?.user_metadata?.display_name as string | undefined) ??
          undefined,
      };
      const { reply } = await callChat({
        data: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          voice,
        },
      });
      setMessages((cur) => [
        ...cur,
        { id: crypto.randomUUID(), role: "assistant", content: reply, ts: Date.now() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Brocalo coach"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white shadow-[0_10px_40px_-10px_rgba(168,85,247,0.7)] hover:shadow-[0_15px_50px_-10px_rgba(168,85,247,0.9)] transition-all hover:scale-[1.03] active:scale-95"
        >
          <div className="size-7 rounded-full bg-white/15 grid place-items-center backdrop-blur">
            <Sparkles className="size-4" />
          </div>
          <span className="text-sm font-bold tracking-tight">Ask Brocalo</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[400px] sm:h-[640px] sm:max-h-[85vh] flex flex-col bg-background sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden sm:border-violet-500/30">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-500/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative size-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center shrink-0">
                <Sparkles className="size-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-foreground leading-tight">Brocalo</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Your personal singing coach
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={reset}
                  className="text-[11px] px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="size-8 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-background to-background/50"
          >
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    Hey 👋 I'm <span className="font-bold text-brand">Brocalo</span>. I'll help
                    you find songs that fit your voice, build practice routines, and coach you
                    through scales.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try a vocal test on{" "}
                    <Link to="/vocal-test" className="text-brand underline">
                      /vocal-test
                    </Link>{" "}
                    so I know your range.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Quick start
                  </div>
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.text)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-colors"
                    >
                      <p.icon className="size-4 text-brand shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{p.label}</div>
                        <div className="text-[11px] text-muted-foreground">{p.text}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-sm shadow-lg"
                      : "max-w-[90%] rounded-2xl rounded-bl-sm px-4 py-3 bg-white/[0.04] border border-white/10 text-sm text-foreground whitespace-pre-wrap leading-relaxed"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-white/[0.04] border border-white/10">
                  <div className="flex gap-1">
                    <span className="size-2 rounded-full bg-violet-400 animate-bounce" />
                    <span className="size-2 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:120ms]" />
                    <span className="size-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-white/10 p-3 bg-background"
          >
            <div className="flex items-end gap-2 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-violet-500/50 transition-colors px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask Brocalo anything about your voice…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-32"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send"
                className="size-8 grid place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                <Send className="size-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
