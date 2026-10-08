import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClientOnlyFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  BadgeNairaSign,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Coins,
  Crown,
  DoorOpen,
  Eye,
  EyeOff,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  MessageSquare,
  Moon,
  Navigation,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { lovable } from "@/integrations/lovable";
import type {
  AuthError,
  Session,
  User,
} from "@supabase/supabase-js";
import {
  careers,
  backgrounds,
  cityLocations,
  formatCashBalance,
  formatNaira,
  needRecovery,
  needs,
  readableAge,
  traits,
  transportOptions,
  type BackgroundKey,
  type CityLocation,
  type GameAction,
  type PlayerProfile,
  type TraitKey,
  type CityMessage,
} from "@/lib/imo-life";
import { supabase } from "@/integrations/supabase/client";
import districtImage from "@/assets/owerri-district.jpg";

type PageKey = "city" | "jobs" | "business" | "people" | "profile";
type SignInMode = "signin" | "signup";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return fallback;
}

function translateSignInError(error: AuthError): string {
  if (/invalid login credentials|email not confirmed/i.test(error.message)) {
    return "That email and password don't match. If you just signed up, check your email first.";
  }
  if (/already registered/i.test(error.message)) {
    return "This email already has a character. Sign in instead.";
  }
  if (/password should be at least/i.test(error.message)) {
    return "Choose a password of at least 8 characters.";
  }
  if (/email/i.test(error.message) && /valid/i.test(error.message)) {
    return "Enter a valid email address.";
  }
  return "We couldn't complete that sign-in. Give it another go in a moment.";
}

export function ImoLifeGame() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setAuthLoaded(true);
      },
    );
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setAuthLoaded(true);
    }).catch(() => {
      if (!active) return;
      setAuthLoaded(true);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!authLoaded) return;
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    void supabase
      .from("game_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (!active) return;
        setProfile(data);
        setError(queryError ? "We couldn't load your saved character yet. Try refreshing." : "");
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't load your saved character yet. Try refreshing.");
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoaded, user]);

  const handleCharacterCreate = useCallback(
    async (details: {
      displayName: string;
      bio: string;
      background: BackgroundKey;
      trait: TraitKey;
    }) => {
      if (!user) return;
      setProfileLoading(true);
      setAuthNotice("");
      const { data, error: insertError } = await supabase
        .from("game_profiles")
        .insert({ ...details, user_id: user.id })
        .select("*")
        .single();
      setProfileLoading(false);
      if (insertError) {
        toast.error("Your character couldn't be saved just yet. Please try again.");
        return;
      }
      setProfile(data);
    },
    [user],
  );

  if (!authLoaded) return <LoadingScreen label="Waking up the city" />;
  if (!user) {
    return (
      <SignInScreen
        initialNotice={authNotice}
        onCreate={(notice) => setAuthNotice(notice)}
      />
    );
  }
  if (isLoading) return <LoadingScreen label="Your street is just around the corner" />;
  if (error && !profile) {
    return <MessageScreen message={error} onRetry={() => window.location.reload()} />;
  }
  if (!profile) {
    return (
      <CharacterCreation
        email={user.email ?? ""}
        isSaving={profileLoading}
        onCreate={handleCharacterCreate}
      />
    );
  }
  return <CityGame user={user} initialProfile={profile} />;
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="life-loading-screen">
      <div className="life-loading-lockup" aria-label="Imo Life">
        <img src={districtImage} alt="" width={1536} height={1024} />
      </div>
      <LoaderCircle className="life-spinner" size={23} aria-hidden />
      <p>{label}</p>
    </main>
  );
}

function MessageScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="life-auth-screen">
      <section className="life-error-panel" role="alert">
        <div className="life-crest life-crest--small"><Sparkles size={20} /></div>
        <p className="life-eyebrow">OWERRI, IMO STATE</p>
        <h1>Hold on a minute.</h1>
        <p>{message}</p>
        <Button type="button" onClick={onRetry} className="life-retry-button">Try again <ArrowRight /></Button>
      </section>
    </main>
  );
}

function SignInScreen({
  initialNotice,
  onCreate,
}: {
  initialNotice: string;
  onCreate: (notice: string) => void;
}) {
  const [mode, setMode] = useState<SignInMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [notice, setNotice] = useState(initialNotice);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    onCreate("");
    setIsSubmitting(true);
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsSubmitting(false);
    if (result.error) {
      setNotice(translateSignInError(result.error));
      return;
    }
    if (mode === "signup" && result.data.session === null) {
      setMode("signin");
      setNotice("Your confirmation link is on its way. Verify your email, then come back to join Owerri.");
    }
  };

  const signInWithGoogle = async () => {
    setNotice("");
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) setNotice("Google sign-in isn't available right now. Try again or use your email.");
    } catch {
      setNotice("Google sign-in isn't available right now. Try again or use your email.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="life-auth-screen">
      <div className="life-auth-collage">
        <img
          className="life-auth-image"
          src={districtImage}
          width={1536}
          height={1024}
          fetchPriority="high"
          alt="A view across the busy market streets and green neighbourhoods of Owerri."
        />
        <div className="life-auth-image-fade" />
        <div className="life-auth-image-caption">
          <span className="life-location-kicker"><span className="life-online-dot" /> IMO STATE · NIGERIA</span>
          <h2>Every street has<br />a story.</h2>
          <p>Yours is about to begin.</p>
          <div className="life-auth-image-players"><Users size={15} /> <span>Owerri is waking up</span></div>
        </div>
        <div className="life-bottom-emblem"><span>IM</span></div>
        <span className="life-caption-credit">A new life. A familiar place.</span>
      </div>

      <section className="life-auth-copy">
        <header className="life-auth-header">
          <a href="/" className="life-logo" aria-label="IMO LIFE home">
            <span className="life-logo-mark">IM<span>O</span></span>
            <span className="life-logo-caption">A LIFE IN OWERRI</span>
          </a>
          <div className="life-auth-existing">
            {mode === "signup" ? "Already playing?" : "New to Owerri?"}{" "}
            <button type="button" className="life-text-link" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setNotice(""); }}>
              {mode === "signup" ? "Sign in" : "Create a character"}
            </button>
          </div>
        </header>

        <div className="life-auth-content">
          <div className="life-auth-eyebrow"><span className="life-auth-eyebrow-line" /> THE CITY IS ALIVE</div>
          <h1>{mode === "signup" ? <>Find your <span>place</span><br />in Owerri.</> : <>Good to see<br /><span>you again.</span></>}</h1>
          <p className="life-auth-description">
            {mode === "signup"
              ? "Make an honest living. Look after your people. See where the city takes you."
              : "Your people are out there. Pick up where you left off."}
          </p>

          <Button type="button" variant="outline" className="life-google-button" onClick={signInWithGoogle} disabled={isGoogleLoading}>
            {isGoogleLoading ? <LoaderCircle className="life-spinner life-google-mark" /> : <GoogleMark />}
            <span>Continue with Google</span>
          </Button>
          <div className="life-form-divider"><span>OR WITH EMAIL</span></div>

          <form className="life-auth-form" onSubmit={submit}>
            <label htmlFor="life-account-email">Email address</label>
            <Input
              id="life-account-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label className="life-password-label" htmlFor="life-account-password">
              Password{mode === "signup" ? " · 8 characters or more" : ""}
            </label>
            <div className="life-password-control">
              <Input
                id="life-account-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••••••"
                value={password}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            {notice && <p className="life-auth-notice" role="status">{notice}</p>}
            <Button type="submit" className="life-submit-button" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="life-spinner" /> : null}
              {isSubmitting ? "One moment" : mode === "signup" ? "Make a life in Owerri" : "Welcome back to Owerri"}
              {!isSubmitting && <ArrowRight aria-hidden />}
            </Button>
          </form>

          <div className="life-auth-trust"><ShieldCheck size={14} /> Your progress is yours to keep.</div>
          <footer className="life-auth-footer"><span>OWERRI, IMO STATE</span><span>AN IMO ORIGINAL <span className="life-footer-star">✳</span></span></footer>
        </div>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg className="life-google-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21.35 12.23c0-.74-.07-1.46-.19-2.15H12v4.07h5.22a4.46 4.46 0 0 1-1.94 2.93v2.39h3.14c1.84-1.69 2.93-4.18 2.93-7.24Z" />
      <path fill="currentColor" d="M12 21.75c2.64 0 4.86-.88 6.48-2.28l-3.15-2.39c-.88.59-2 .94-3.33.94-2.56 0-4.73-1.72-5.51-4.03H3.24v2.46A9.77 9.77 0 0 0 12 21.75Z" opacity=".78" />
      <path fill="currentColor" d="M6.49 13.99a5.86 5.86 0 0 1 0-3.75V7.78H3.24a9.77 9.77 0 0 0 0 8.67l3.25-2.46Z" opacity=".6" />
      <path fill="currentColor" d="M12 6.22c1.44 0 2.73.49 3.74 1.46l2.8-2.8C16.84 3.28 14.63 2.3 12 2.3a9.77 9.77 0 0 0-8.76 5.48l3.25 2.46c.78-2.3 2.95-4.03 5.51-4.03Z" opacity=".82" />
    </svg>
  );
}

function CharacterCreation({
  email,
  isSaving,
  onCreate,
}: {
  email: string;
  isSaving: boolean;
  onCreate: (details: { displayName: string; bio: string; background: BackgroundKey; trait: TraitKey }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [background, setBackground] = useState<BackgroundKey>("owerri_born");
  const [trait, setTrait] = useState<TraitKey>("hustler");
  const selectedBackground = backgrounds.find((entry) => entry.id === background) ?? backgrounds[1]!;
  const selectedTrait = traits.find((entry) => entry.id === trait) ?? traits[0]!;

  return (
    <main className="life-character-screen">
      <header className="life-character-topbar">
        <a href="/" className="life-logo" aria-label="IMO LIFE home"><span className="life-logo-mark">IM<span>O</span></span><span className="life-logo-caption">A LIFE IN OWERRI</span></a>
        <div className="life-account-chip"><span className="life-avatar life-avatar--mini">{email.slice(0, 1).toUpperCase()}</span><span>{email}</span></div>
      </header>
      <section className="life-character-wrap">
        <div className="life-character-progress" aria-label="Step 1 of 1"><span /> A FRESH START</div>
        <div className="life-character-heading">
          <span className="life-location-kicker"><span className="life-location-tick" /> YOUR STORY STARTS HERE</span>
          <h1>It starts with <span>you.</span></h1>
          <p>A city of almost a million stories. What shall we call yours?</p>
        </div>
        <form
          className="life-character-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onCreate({ displayName: name.trim(), bio: bio.trim(), background, trait });
          }}
        >
          <div className="life-character-topfields">
            <div className="life-form-field">
              <label htmlFor="life-display-name">What do people call you?</label>
              <Input id="life-display-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={18} placeholder="Your name in Owerri" required />
              <span className="life-form-hint">2–18 characters</span>
            </div>
            <div className="life-form-field">
              <label htmlFor="life-character-bio">A little about yourself <span className="life-optional">OPTIONAL</span></label>
              <Textarea id="life-character-bio" value={bio} maxLength={120} onChange={(event) => setBio(event.target.value)} placeholder="Here to make something of myself…" className="life-bio-input" />
              <span className="life-form-hint">{bio.length}/120</span>
            </div>
          </div>

          <fieldset className="life-fieldset">
            <legend>Where are you coming from? <span>YOUR START CHANGES THE JOURNEY</span></legend>
            <div className="life-background-grid">
              {backgrounds.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`life-background-option ${background === item.id ? "is-selected" : ""}`}
                  onClick={() => setBackground(item.id)}
                  aria-pressed={background === item.id}
                >
                  <span className="life-background-number">0{index + 1}</span>
                  <span className="life-background-name">{item.label}</span>
                  <span className="life-background-copy">{item.description}</span>
                  <span className="life-background-money">{item.startingCash}<span> TO YOUR NAME</span></span>
                  <span className="life-background-radio">{background === item.id && <Check size={12} />}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="life-fieldset life-trait-fieldset">
            <legend>What's your thing? <span>ONE TRAIT. ALL YOUR OWN.</span></legend>
            <div className="life-trait-picker">
              {traits.map((item) => (
                <button key={item.id} type="button" className={`life-trait-chip ${trait === item.id ? "is-selected" : ""}`} aria-pressed={trait === item.id} onClick={() => setTrait(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <p className="life-selected-trait">{selectedTrait.description}</p>
          </fieldset>

          <div className="life-character-bottom">
            <span className="life-starting-cash"><Wallet size={16} /><span>YOUR FIRST Naira</span><strong>{selectedBackground.startingCash}</strong></span>
            <Button type="submit" className="life-submit-button life-start-button" disabled={isSaving || name.trim().length < 2}>
              {isSaving ? <LoaderCircle className="life-spinner" /> : null}
              {isSaving ? "Saving your story" : "Step into Owerri"}
              {!isSaving && <ArrowRight />}
            </Button>
          </div>
        </form>
        <footer className="life-auth-footer life-character-footer"><span>BUILT FOR PEOPLE LIKE US</span><span>THE HEART OF IMO <span className="life-footer-star">✳</span></span></footer>
      </section>
    </main>
  );
}

function CityGame({ user, initialProfile }: { user: User; initialProfile: PlayerProfile }) {
  const [player, setPlayer] = useState(initialProfile);
  const [activePage, setActivePage] = useState<PageKey>("city");
  const [selectedTransport, setSelectedTransport] = useState<"walk" | "bus" | "keke" | "okada" | "taxi">("keke");
  const [activePlayers, setActivePlayers] = useState<PlayerProfile[]>([]);
  const [chat, setChat] = useState<CityMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setSending] = useState(false);
  const [activeAction, setActiveAction] = useState<GameAction | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [nextShiftSeconds, setNextShiftSeconds] = useState(0);

  const currentLocation = useMemo(
    () => cityLocations.find((place) => place.id === player.location) ?? cityLocations[0]!,
    [player.location],
  );

  const refreshActivePlayers = useCallback(async () => {
    const { data, error: presenceError } = await supabase.rpc("get_city_directory");
    if (presenceError || !Array.isArray(data)) return;
    setActivePlayers(data as unknown as PlayerProfile[]);
  }, []);

  const refreshChat = useCallback(async () => {
    const { data } = await supabase
      .from("game_messages")
      .select("*")
      .eq("location", player.location)
      .order("created_at", { ascending: false })
      .limit(35);
    if (data) setChat(data.reverse());
  }, [player.location]);

  const performAction = useCallback(async (
    action: GameAction,
    target?: string,
    transport?: "walk" | "bus" | "keke" | "okada" | "taxi",
  ) => {
    if (activeAction) return;
    setActiveAction(action);
    const { data, error: actionError } = await supabase.rpc("perform_game_action", {
      p_action: action,
      p_target: target,
      p_transport: transport ?? selectedTransport,
    });
    setActiveAction(null);
    if (actionError) {
      toast.error(getErrorMessage(actionError, "Your next move didn't go through."));
      return false;
    }
    if (isRecord(data)) {
      setPlayer(data as unknown as PlayerProfile);
      void refreshActivePlayers();
      if (action === "travel") void refreshChat();
      if (action === "work") toast.success(`A good day's work. ${formatNaira(data.cash as number)} in your pocket.`);
      if (action === "buy_kiosk") toast.success("Your Relief Market kiosk is open for business.");
      if (action === "collect_profit") toast.success("Kiosk sales collected. Nice one!");
    }
    return true;
  }, [activeAction, refreshActivePlayers, refreshChat, selectedTransport]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void refreshChat();
    const channel = supabase
      .channel(`city-chat-${player.location}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_messages", filter: `location=eq.${player.location}` }, (payload) => {
        const incoming = payload.new as CityMessage;
        setChat((current) => {
          if (current.some((entry) => entry.id === incoming.id)) return current;
          return [...current.slice(-34), incoming];
        });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [player.location, refreshChat]);

  useEffect(() => {
    void refreshActivePlayers();
    const presenceTimer = window.setInterval(() => void refreshActivePlayers(), 15_000);
    const heartbeatTimer = window.setInterval(() => {
      void supabase.rpc("perform_game_action", {
        p_action: "heartbeat",
        p_transport: "walk",
      }).then(({ data }) => {
        if (isRecord(data)) setPlayer(data as unknown as PlayerProfile);
        void refreshActivePlayers();
      });
    }, 30_000);
    return () => {
      window.clearInterval(presenceTimer);
      window.clearInterval(heartbeatTimer);
    };
  }, [refreshActivePlayers]);

  useEffect(() => {
    const seconds = Math.ceil(Math.max(
      0,
      45_000 - (clock.getTime() - new Date(player.last_work_at).getTime()),
    ) / 1000);
    setNextShiftSeconds(Number.isFinite(seconds) ? seconds : 0);
  }, [clock, player.last_work_at]);

  const postMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || isSending) return;
    setSending(true);
    const { data, error: sendError } = await supabase.rpc("send_game_message", {
      p_body: draft.trim(),
    });
    setSending(false);
    if (sendError) {
      toast.error(getErrorMessage(sendError, "Your message didn't go through."));
      return;
    }
    if (data) {
      const message = data as unknown as CityMessage;
      setChat((current) => {
        if (current.some((entry) => entry.id === message.id)) return current;
        return [...current.slice(-34), message];
      });
      setDraft("");
    }
  };

  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) toast.error("We couldn't sign you out just yet.");
  };

  const locationNames = useMemo(() => new Map(cityLocations.map((place) => [place.id, place.name])), []);
  const currentPlayers = activePlayers.filter((other) => other.location === player.location);
  const rentDate = new Date(player.rent_due_at);
  const dueDate = new Date(rentDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  const currentLocalTime = clock.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
  const amountOfWeek = Math.max(1, Math.ceil((rentDate.getTime() - clock.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const isRentDue = clock >= rentDate;

  const navItems: ReadonlyArray<{ id: PageKey; label: string; icon: typeof MapPin }> = [
    { id: "city", label: "The city", icon: MapPin },
    { id: "jobs", label: "Make a living", icon: Coins },
    { id: "business", label: "My business", icon: Store },
    { id: "people", label: "My neighbours", icon: Users },
    { id: "profile", label: "My life", icon: Heart },
  ];

  return (
    <main className="life-city-app">
      <header className="life-game-header">
        <div className="life-game-wordmark" aria-label="Imo Life"><span className="life-game-wordmark-mark">IM<span>O</span></span><span className="life-game-wordmark-caption">A LIFE IN OWERRI</span></div>
        <div className="life-weather"><span className="life-weather-sun">✳</span> Owerri, Imo State <span className="life-weather-separator">·</span> <span className="life-weather-temperature">29°</span> <span className="life-weather-state">A bright day</span></div>
        <div className="life-game-account"><div className="life-header-cash"><Wallet size={16} /><strong>{formatCashBalance(player.cash)}</strong></div><div className="life-avatar life-avatar--header">{player.display_name.slice(0, 1).toUpperCase()}</div><Button type="button" variant="ghost" size="icon" className="life-signout-button" title="Sign out" aria-label="Sign out" onClick={signOut}><DoorOpen /></Button></div>
      </header>

      <div className="life-game-layout">
        <aside className="life-sidebar" aria-label="Your city life">
          <div className="life-day-summary">
            <div className="life-day-pulse"><Activity size={16} /><span /> CITY TIME</div>
            <div className="life-city-time">{currentLocalTime}</div>
            <div className="life-date-label"><CalendarDays size={12} /> {clock.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos" })}</div>
          </div>
          <div className="life-nav-label">YOUR NEIGHBOURHOOD</div>
          <nav className="life-game-nav" aria-label="Main navigation">
            {navItems.map((item) => {
              const NavIcon = item.icon;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  className={`life-nav-button ${activePage === item.id ? "is-active" : ""}`}
                  aria-current={activePage === item.id ? "page" : undefined}
                  onClick={() => setActivePage(item.id)}
                >
                  <NavIcon size={17} /><span>{item.label}</span>
                  {item.id === "people" && activePlayers.length > 0 && <span className="life-nav-count">{activePlayers.length}</span>}
                </Button>
              );
            })}
          </nav>

          <section className="life-needs-panel" aria-label="Your six needs">
            <header className="life-needs-heading"><span>HOW YOU'RE FEELING</span><span className="life-mood-bullet" /></header>
            {needs.map((need) => {
              const NeedIcon = need.icon;
              const value = player[need.id];
              return (
                <div className="life-need-row" key={need.id}>
                  <div className="life-need-row-heading"><span><NeedIcon size={13} />{need.label}</span><strong>{value}%</strong></div>
                  <div className="life-need-progress-track" role="progressbar" aria-label={need.label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
                    <span className={need.barClass} style={{ width: `${value}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="life-needs-decay"><Clock3 size={11} /> Look after yourself out here.</p>
          </section>

          <button type="button" className="life-player-mini" onClick={() => setActivePage("profile")}>
            <span className="life-avatar life-avatar--mini">{player.display_name.slice(0, 1).toUpperCase()}</span>
            <span className="life-player-mini-copy"><strong>{player.display_name}</strong><span>{player.mood}</span></span>
            <ArrowRight size={15} />
          </button>
        </aside>

        <section className="life-center-column" aria-label="The city of Owerri">
          <div className="life-city-intro">
            <div><span className="life-location-kicker"><span className="life-location-tick" /> YOUR CITY, YOUR STORY</span><h1>Morning, {player.display_name.split(/\s+/)[0]}.</h1><p>{player.mood === "In good company" ? "Nice one. You've got good people around you." : "There's a whole Owerri out there."} <span>What feels right today?</span></p></div>
            <div className="life-online-indicator"><span className="life-online-dot" /> <strong>{activePlayers.length}</strong> {activePlayers.length === 1 ? "person" : "people"} about town</div>
          </div>

          <CityMap player={player} activePlayers={activePlayers} onNavigate={setActivePage} onTravel={performAction} activeAction={activeAction} />

          <section className="life-destination-section" aria-label={`${currentLocation.name} activities`}>
            <div className="life-section-rule" />
            <div className="life-destination-header">
              <div><span className="life-location-kicker"><MapPin size={11} /> {currentLocation.district}</span><h2>{currentLocation.name}</h2><p>{currentLocation.description}</p></div>
              <span className="life-current-location"><span /> YOU'RE HERE</span>
            </div>
            <div className="life-context-panel">
              {activePage === "city" && <CityActions player={player} performAction={performAction} activeAction={activeAction} />}
              {activePage === "jobs" && <JobsPanel player={player} currentLocation={currentLocation.id} onTravel={performAction} onWork={performAction} activeAction={activeAction} nextShiftSeconds={nextShiftSeconds} />}
              {activePage === "business" && <BusinessPanel player={player} performAction={performAction} activeAction={activeAction} currentLocation={currentLocation.id} />}
              {activePage === "people" && <PeoplePanel player={player} activePlayers={activePlayers} />}
              {activePage === "profile" && <PlayerProfilePanel player={player} currentLocalTime={currentLocalTime} isRentDue={isRentDue} dueDate={dueDate} amountOfWeek={amountOfWeek} signOut={signOut} performAction={performAction} activeAction={activeAction} />}
            </div>
            <footer className="life-game-footer"><span>MADE WITH LOVE IN IMO STATE</span><span><span className="life-footer-star">✳</span> AN IMO ORIGINAL <span>·</span> EST. RIGHT NOW</span></footer>
          </section>
        </section>

        <aside className="life-right-column" aria-label="People and local chat">
          <div className="life-right-column-heading"><div><span className="life-location-kicker">YOUR STREET</span><h2>Around here</h2></div><Button type="button" variant="ghost" size="icon" className="life-chat-open-button" aria-label="See everyone in Owerri" title="See everyone in Owerri" onClick={() => setActivePage("people")}><Users size={16} /></Button></div>

          <div className="life-around-here-summary"><span className="life-social-halo"><Users size={17} /></span><span><strong>{currentPlayers.length + 1} {currentPlayers.length === 0 ? "person" : "people"}</strong><span>on {currentLocation.name}</span></span><span className="life-presence-dot" /></div>
          {currentPlayers.length > 0 ? (
            <div className="life-present-players" aria-label="Your neighbours on this street">
              {currentPlayers.slice(0, 4).map((other, index) => (
                <div key={other.user_id} className="life-neighbour-line"><span className={`life-avatar life-neighbour-avatar life-avatar--${index % 3}`}>{other.display_name.slice(0, 1).toUpperCase()}</span><span><strong>{other.display_name}</strong><span>{other.mood}</span></span><span className="life-presence-dot" /></div>
              ))}
            </div>
          ) : (
            <p className="life-quiet-street">A quiet stretch of the day. Say hello below and help bring the neighbourhood to life.</p>
          )}

          <div className="life-chat-section-heading"><span><MessageCircle size={14} /> STREET CHAT</span><span><span className="life-chat-live-dot" /> LIVE</span></div>
          <div className="life-chat-scrollback" role="log" aria-label={`Live chat at ${currentLocation.name}`}>
            {chat.length === 0 ? (
              <div className="life-chat-empty"><span className="life-chat-empty-icon"><MessageSquare size={19} /></span><strong>It's a little quiet</strong><span>Be the first to say hello on this street.</span></div>
            ) : chat.slice(-15).map((message, index) => {
              const own = message.user_id === user.id;
              const prevMessage = index > 0 ? chat.slice(-15)[index - 1] : null;
              const grouped = prevMessage?.user_id === message.user_id;
              return (
                <article className={`life-message ${own ? "is-own" : ""} ${grouped ? "is-grouped" : ""}`} key={message.id}>
                  {!own && !grouped && <div className="life-message-author"><span className="life-message-dot" /><strong>{message.display_name}</strong><time>{readableAge(message.created_at, clock.getTime())}</time></div>}
                  {own && !grouped && <div className="life-message-author"><span className="life-message-dot" /><strong>You</strong><time>{readableAge(message.created_at, clock.getTime())}</time></div>}
                  <p>{message.body}</p>
                </article>
              );
            })}
          </div>
          <form className="life-chat-form" onSubmit={postMessage}>
            <label htmlFor="life-chat-message" className="life-visually-hidden">Send a message to this street</label>
            <Input id="life-chat-message" placeholder="Say hello on this street…" value={draft} maxLength={280} onChange={(event) => setDraft(event.target.value)} />
            <Button type="submit" variant="default" size="icon" aria-label="Send chat message" title="Send chat message" disabled={isSending || !draft.trim()}>{isSending ? <LoaderCircle className="life-spinner" /> : <Send size={16} />}</Button>
          </form>
          <p className="life-chat-footnote"><ShieldCheck size={12} /> Keep it kind. Your words represent you.</p>

          <section className={`life-rent-panel ${isRentDue ? "is-due" : ""}`}>
            <div className="life-rent-heading"><span>ROOF OVER YOUR HEAD</span><Building2 size={15} /></div>
            <strong>Railway Estate</strong>
            <div className="life-rent-due"><CalendarDays size={13} /><span>{isRentDue ? "Rent due now" : `Rent due ${dueDate.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" })}`}</span><b>₦8,500</b></div>
            {isRentDue ? (
              <Button type="button" className="life-rent-button" disabled={activeAction !== null} onClick={() => void performAction("pay_rent")}>
                {activeAction === "pay_rent" && <LoaderCircle className="life-spinner" />}Pay this week's rent
              </Button>
            ) : <p className="life-rent-calm"><Check size={12} /> This week is taken care of</p>}
          </section>
        </aside>
      </div>

      <MobileNavigation items={navItems} activePage={activePage} onChange={setActivePage} />
      <div className="life-toast-slot"><Notifications /></div>
    </main>
  );
}

function CityMap({
  player,
  activePlayers,
  onNavigate,
  onTravel,
  activeAction,
}: {
  player: PlayerProfile;
  activePlayers: PlayerProfile[];
  onNavigate: (page: PageKey) => void;
  onTravel: (action: GameAction, target?: string, transport?: "walk" | "bus" | "keke" | "okada" | "taxi") => Promise<boolean | undefined>;
  activeAction: GameAction | null;
}) {
  const [mapZoom, setMapZoom] = useState(1);
  const [focusedLocation, setFocusedLocation] = useState<CityLocation | null>(null);
  const [transport, setTransport] = useState<"walk" | "bus" | "keke" | "okada" | "taxi">("keke");
  const selectedLocation = focusedLocation
    ? cityLocations.find((place) => place.id === focusedLocation) ?? null
    : null;
  const focusedPlayers = selectedLocation
    ? activePlayers.filter((person) => person.location === selectedLocation.id).length
    : 0;
  const selectedFare = transportOptions.find((option) => option.id === transport)?.fare ?? 0;
  const isCurrentLocation = selectedLocation?.id === player.location;

  const pinLayout: ReadonlyArray<{
    id: CityLocation;
    className: string;
    label: string;
  }> = [
    { id: "relief_market", className: "life-map-pin--market", label: "Relief Market" },
    { id: "imsu", className: "life-map-pin--imsu", label: "IMSU" },
    { id: "transport_park", className: "life-map-pin--park", label: "Orlu Road Park" },
    { id: "owerri_mall", className: "life-map-pin--mall", label: "Owerri Mall" },
    { id: "railway_estate", className: "life-map-pin--home", label: "Railway Estate" },
    { id: "heroes_square", className: "life-map-pin--square", label: "Heroes Square" },
    { id: "mbari_cultural_centre", className: "life-map-pin--mbari", label: "Mbari Centre" },
    { id: "dan_anyiam_stadium", className: "life-map-pin--stadium", label: "Dan Anyiam Stadium" },
  ];

  return (
    <section className="life-map-section" aria-label="Explore Owerri">
      <div className={`life-city-map ${mapZoom > 1 ? "is-zoomed" : ""}`}>
        <img
          className="life-city-map-image"
          src={districtImage}
          width={1536}
          height={1024}
          fetchPriority="high"
          alt="A vibrant aerial view of Owerri's neighbourhoods, market streets, and Heroes Square."
        />
        <div className="life-city-map-colourwash" />
        <div className="life-map-label life-map-label--district">OWERRI, IMO STATE <span>·</span> CITY DISTRICT</div>
        <div className="life-map-weather">29° <span>✳</span></div>
        <div className="life-city-map-artboard">
          {pinLayout.map((pin) => {
            const location = cityLocations.find((place) => place.id === pin.id);
            if (!location) return null;
            const PinIcon = location.icon;
            const isSelected = (focusedLocation ?? player.location) === location.id;
            const isPlayerLocation = player.location === location.id;
            const presenceAtPin = activePlayers.filter((person) => person.location === location.id).length;
            return (
              <button
                type="button"
                key={pin.id}
                className={`life-map-pin ${pin.className} ${isSelected ? "is-selected" : ""}`}
                onClick={() => setFocusedLocation(location.id)}
                aria-label={`${pin.label}${isPlayerLocation ? ", your current location" : ""}${presenceAtPin ? `, ${presenceAtPin} other players here` : ""}`}
                aria-pressed={isSelected}
                title={pin.label}
              >
                {isPlayerLocation ? <span className="life-map-you-chip"><span /> YOU</span> : null}
                <span className="life-map-pin-icon"><PinIcon size={17} /></span>
                <span className="life-map-pin-label">{pin.label}</span>
                {presenceAtPin > 0 && <span className="life-pin-visitor-count"><Users size={10} /> {presenceAtPin}</span>}
              </button>
            );
          })}
        </div>
        <div className="life-map-controls" aria-label="Map zoom">
          <Button type="button" variant="ghost" size="icon" className="life-map-zoom-button" title="Zoom in" aria-label="Zoom in" onClick={() => setMapZoom(Math.min(1.24, mapZoom + 0.08))}><span>+</span></Button>
          <span className="life-map-zoom-value">{Math.round(mapZoom * 100)}%</span>
          <Button type="button" variant="ghost" size="icon" className="life-map-zoom-button" title="Zoom out" aria-label="Zoom out" onClick={() => setMapZoom(Math.max(1, mapZoom - 0.08))}><span>−</span></Button>
        </div>
        <div className="life-map-distance-chip"><span className="life-online-dot" /> PEOPLE MOVING AROUND OWERRI</div>

        {selectedLocation && (
          <div className="life-map-travel-sheet" aria-live="polite">
            <div className="life-travel-sheet-header">
              <span><span className="life-location-tick" /> {selectedLocation.district}</span>
              <Button type="button" variant="ghost" size="icon" aria-label="Close map destination" onClick={() => setFocusedLocation(null)}><X size={16} /></Button>
            </div>
            <div className="life-travel-sheet-details"><selectedLocation.icon size={18} /><strong>{selectedLocation.name}</strong><span><Users size={12} /> {isCurrentLocation ? focusedPlayers + 1 : focusedPlayers} {focusedPlayers + (isCurrentLocation ? 1 : 0) === 1 ? "on this street" : "on this street"}</span></div>
            {!isCurrentLocation ? (
              <div className="life-travel-controls">
                <label className="life-travel-select-wrap"><Navigation size={15} /><span className="life-visually-hidden">Choose transport</span>
                  <select value={transport} onChange={(event) => setTransport(event.target.value as typeof transport)}>
                    {transportOptions.map((option) => <option key={option.id} value={option.id}>{option.label}{option.fare ? ` · ${formatNaira(option.fare)}` : " · free"}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </label>
                <Button type="button" className="life-travel-button" disabled={activeAction === "travel" || selectedFare > player.cash} onClick={async () => { const travelled = await onTravel("travel", selectedLocation.id, transport); if (travelled) setFocusedLocation(null); }}>
                  {activeAction === "travel" ? <LoaderCircle className="life-spinner" /> : <ArrowRight />}
                  Go <span>{selectedFare ? formatNaira(selectedFare) : "· free"}</span>
                </Button>
              </div>
            ) : <div className="life-travel-current"><MapPin size={13} /> You're standing right here.</div>}
          </div>
        )}
      </div>
      <div className="life-map-bottomline">
        <span><MapPin size={12} /> A LITTLE BIT OF EVERYWHERE</span>
        <Button type="button" variant="link" className="life-map-directory-link" onClick={() => onNavigate("people")}><Users size={13} /> WHO'S AROUND <ArrowRight size={13} /></Button>
      </div>
    </section>
  );
}

function CityActions({ player, performAction, activeAction }: {
  player: PlayerProfile;
  performAction: (action: GameAction) => Promise<boolean | undefined>;
  activeAction: GameAction | null;
}) {
  const available = needRecovery.filter((item) => item.enabledHere(player.location));
  return (
    <div className="life-quick-action-layout">
      <div className="life-quick-action-lede"><span className="life-small-overline">MAKE THIS A GOOD DAY</span><strong>{available.length > 0 ? "You're in just the right place." : "The city's one short trip away."}</strong><p>There's always something worth doing around here.</p></div>
      <div className="life-action-list">
        {available.length > 0 ? available.map((item) => {
          const ActionIcon = item.icon;
          const restoringNeed = item.id === "eat" ? player.hunger : item.id === "sleep" ? player.energy : item.id === "shower" ? player.hygiene : item.id === "bathroom" ? player.bladder : item.id === "socialize" ? player.social : player.fun;
          const full = restoringNeed >= 96;
          return (
            <div className="life-action-line" key={item.id}>
              <span className="life-action-icon"><ActionIcon size={15} /></span>
              <span className="life-action-description"><strong>{item.label}</strong><span>{full ? "You're already feeling fine" : item.detail}</span></span>
              <Button type="button" variant="outline" size="sm" className="life-do-button" disabled={full || activeAction !== null} onClick={() => void performAction(item.id)} aria-label={full ? `Already feeling fine: ${item.label}` : `${item.label}, ${item.detail}`}>
                {activeAction === item.id ? <LoaderCircle className="life-spinner" /> : full ? <Check size={15} /> : <ArrowRight size={15} />}
              </Button>
            </div>
          );
        }) : <span className="life-action-quiet"><CircleHelp size={16} /> Travel to your next stop to find something to do.</span>}
      </div>
    </div>
  );
}

function JobsPanel({
  player,
  currentLocation,
  onTravel,
  onWork,
  activeAction,
  nextShiftSeconds,
}: {
  player: PlayerProfile;
  currentLocation: CityLocation;
  onTravel: (action: GameAction, target?: string, transport?: "walk" | "bus" | "keke" | "okada" | "taxi") => Promise<boolean | undefined>;
  onWork: (action: GameAction, target?: string) => Promise<boolean | undefined>;
  activeAction: GameAction | null;
  nextShiftSeconds: number;
}) {
  const currentWorkplace = careers.find((job) => job.location === currentLocation);
  return (
    <div className="life-jobs-panel">
      <div className="life-jobs-summary"><span className="life-small-overline">YOUR NEXT PAYDAY</span><span className="life-jobs-rank"><Crown size={14} /> LEVEL {player.career_level} · {player.career_level >= 5 ? "SEASONED" : "ON THE RISE"}</span><strong>{currentWorkplace ? currentWorkplace.income : "Earn up to ₦18,000"} <span>this shift</span></strong><span className="life-jobs-xp"><span className="life-jobs-xp-track"><span style={{ width: `${Math.min(100, player.career_xp % 500 / 5)}%` }} /></span>{player.career_xp % 500}/500 towards level {Math.min(5, player.career_level + 1)}</span></div>
      <div className="life-career-list">
        {careers.map((job) => {
          const CareerIcon = job.icon;
          const atWorkplace = currentLocation === job.location;
          return (
            <article className={`life-career-row ${atWorkplace ? "is-at-workplace" : ""}`} key={job.id}>
              <span className="life-career-icon"><CareerIcon size={16} /></span><span className="life-career-copy"><strong>{job.title}</strong><span>{locationNamesLabel(job.location)} · {job.income} per shift</span></span>
              {atWorkplace ? (
                <Button type="button" className="life-career-button" disabled={activeAction !== null || nextShiftSeconds > 0} onClick={() => void onWork("work", job.id)}>
                  {activeAction === "work" ? <LoaderCircle className="life-spinner" /> : nextShiftSeconds ? <Clock3 size={14} /> : null}{nextShiftSeconds ? ` ${nextShiftSeconds}s` : "Clock in"}
                </Button>
              ) : <Button type="button" variant="outline" size="sm" className="life-career-travel" disabled={activeAction === "travel"} onClick={() => void onTravel("travel", job.location)}><MapPin size={13} /> Head there</Button>}
            </article>
          );
        })}
      </div>
      <p className="life-jobs-footnote"><ShieldCheck size={12} /> Get to your workplace, clock in, and the money is yours. One honest shift at a time.</p>
    </div>
  );
}

function locationNamesLabel(locationId: CityLocation): string {
  return cityLocations.find((place) => place.id === locationId)?.name ?? "Owerri";
}

function BusinessPanel({ player, performAction, activeAction, currentLocation }: {
  player: PlayerProfile;
  performAction: (action: GameAction) => Promise<boolean | undefined>;
  activeAction: GameAction | null;
  currentLocation: CityLocation;
}) {
  const hasBusiness = player.business_type === "provision_kiosk";
  const canStartHere = currentLocation === "relief_market";
  return (
    <div className="life-business-panel">
      <div className="life-business-summary">
        <span className="life-business-building"><Store size={20} /></span>
        <span className="life-small-overline">YOUR FIRST LITTLE EMPIRE</span>
        <h3>{hasBusiness ? "Provision kiosk" : "Start a provision kiosk"}</h3>
        <p>{hasBusiness ? "Your stand is open on Relief Market's busiest street." : "A small stand. A few essentials. One solid step in Owerri."}</p>
      </div>
      <div className="life-business-stat-row">
        {hasBusiness ? <>
          <div className="life-business-stat"><span>ON THE SHELF</span><strong>{player.business_stock} <small>items</small></strong></div>
          <div className="life-business-stat"><span>READY TO COLLECT</span><strong>{formatNaira(player.business_balance)}</strong></div>
          <div className="life-business-stat"><span>WHERE YOUR CUSTOMERS ARE</span><strong>Relief Market</strong></div>
        </> : <>
          <div className="life-business-stat"><span>SET-UP</span><strong>₦25,000</strong></div>
          <div className="life-business-stat"><span>FIRST STOCK INCLUDED</span><strong>15 everyday essentials</strong></div>
          <div className="life-business-stat"><span>EARN AS YOU GO</span><strong>₦600 per sale</strong></div>
        </>}
      </div>
      <div className="life-business-bottom">
        {hasBusiness ? <>
          <Button type="button" variant="outline" className="life-business-secondary" disabled={activeAction !== null || player.cash < 4500} onClick={() => void performAction("restock")}>{activeAction === "restock" ? <LoaderCircle className="life-spinner" /> : <ShoppingBag size={15} />} Restock · ₦4,500</Button>
          <Button type="button" className="life-business-primary" disabled={activeAction !== null || player.business_balance < 600} onClick={() => void performAction("collect_profit")}>{activeAction === "collect_profit" ? <LoaderCircle className="life-spinner" /> : <ArrowDownLeft size={15} />} Collect sales · {formatNaira(player.business_balance)}</Button>
        </> : canStartHere ? (
          <Button type="button" className="life-business-primary" disabled={activeAction !== null || player.cash < 25000} onClick={() => void performAction("buy_kiosk")}>
            {activeAction === "buy_kiosk" ? <LoaderCircle className="life-spinner" /> : <Store size={15} />} Open my kiosk · ₦25,000
          </Button>
        ) : (
          <Button type="button" variant="outline" className="life-business-primary" disabled={activeAction === "travel"} onClick={() => void performAction("travel", "relief_market")}>
            {activeAction === "travel" ? <LoaderCircle className="life-spinner" /> : <Navigation size={15} />} Head to Relief Market
          </Button>
        )}
        <span className="life-business-tip"><Sparkles size={13} /> Your kiosk keeps doing business while you're away.</span>
      </div>
    </div>
  );
}

function PeoplePanel({ player, activePlayers }: { player: PlayerProfile; activePlayers: PlayerProfile[] }) {
  const visibleNeighbours = activePlayers.filter((person) => person.user_id !== player.user_id);
  return (
    <div className="life-people-panel">
      <div className="life-people-summary"><span className="life-social-halo life-social-halo--large"><Users size={20} /></span><span><span className="life-small-overline">IN THE CITY RIGHT NOW</span><strong>{visibleNeighbours.length > 0 ? `${visibleNeighbours.length} people making Owerri theirs.` : "You're one of the first ones in."}</strong><span>People head between the market, campus, and Heroes Square as the day unfolds.</span></span></div>
      {visibleNeighbours.length > 0 ? (
        <div className="life-people-directory">{visibleNeighbours.map((person, index) => (
          <div className="life-neighbour-row" key={person.user_id}>
            <span className={`life-avatar life-neighbour-avatar life-avatar--${index % 3}`}>{person.display_name.slice(0, 1).toUpperCase()}</span>
            <span className="life-neighbour-detail"><strong>{person.display_name}</strong><span>{locationNamesLabel(person.location)} · {person.mood}</span></span>
            <span className="life-online-dot" title="Around now" />
          </div>
        ))}</div>
      ) : <div className="life-neighbours-empty"><span>You'll meet people as they join the city.</span></div>}
      <p className="life-neighbours-invite"><ShieldCheck size={13} /> City chat is public only while you're signed in.</p>
    </div>
  );
}

function PlayerProfilePanel({
  player,
  currentLocalTime,
  isRentDue,
  dueDate,
  amountOfWeek,
  signOut,
  performAction,
  activeAction,
}: {
  player: PlayerProfile;
  currentLocalTime: string;
  isRentDue: boolean;
  dueDate: Date;
  amountOfWeek: number;
  signOut: () => Promise<void>;
  performAction: (action: GameAction) => Promise<boolean | undefined>;
  activeAction: GameAction | null;
}) {
  const background = backgrounds.find((item) => item.id === player.background);
  const trait = traits.find((item) => item.id === player.trait);
  return (
    <div className="life-profile-panel">
      <div className="life-profile-heading"><span className="life-avatar life-avatar--profile">{player.display_name.slice(0, 1).toUpperCase()}</span><span><span className="life-small-overline">YOUR STORY, SO FAR</span><strong>{player.display_name}</strong><span>{background?.label ?? "New to Owerri"} · {currentLocalTime} in the city</span></span><Button type="button" variant="ghost" size="icon" className="life-profile-logout" title="Sign out" aria-label="Sign out" onClick={() => void signOut()}><DoorOpen size={16} /></Button></div>
      <div className="life-profile-facts">
        <div><span>STARTED FROM</span><strong>{background?.label ?? "Owerri born"}</strong></div>
        <div><span>ONE THING THAT'S YOU</span><strong>{trait?.label ?? "Hustler"}</strong></div>
        <div><span>YOUR KIND OF DAY</span><strong>{player.mood}</strong></div>
        <div><span>CAREER LEVEL</span><strong>{player.career_level} of 5</strong></div>
      </div>
      <div className="life-profile-housing"><span className="life-profile-housing-icon"><Building2 size={18} /></span><span><span className="life-small-overline">A PLACE TO CALL HOME</span><strong>Railway Estate · Your own spot</strong><span>₦8,500 rent · Week {amountOfWeek}</span></span>{isRentDue ? <Button type="button" size="sm" className="life-career-button" disabled={activeAction !== null} onClick={() => void performAction("pay_rent")}>{activeAction === "pay_rent" ? <LoaderCircle className="life-spinner" /> : "Pay rent"}</Button> : <span className="life-profile-paid"><Check size={13} /> ALL SET</span>}</div>
      <p className="life-profile-rent-next"><CalendarDays size={13} /> {isRentDue ? "Your rent's ready when you are." : `A roof over your head until ${dueDate.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}.`}</p>
    </div>
  );
}

function MobileNavigation({ items, activePage, onChange }: {
  items: ReadonlyArray<{ id: PageKey; label: string; icon: typeof MapPin }>;
  activePage: PageKey;
  onChange: (page: PageKey) => void;
}) {
  const shortLabel: Record<PageKey, string> = { city: "City", jobs: "Earn", business: "Business", people: "People", profile: "My life" };
  return (
    <nav className="life-mobile-nav" aria-label="Game navigation">
      {items.map((item) => {
        const MobileIcon = item.icon;
        return (
          <Button key={item.id} type="button" variant="ghost" className={`life-mobile-nav-button ${activePage === item.id ? "is-active" : ""}`} onClick={() => onChange(item.id)} aria-current={activePage === item.id ? "page" : undefined} aria-label={item.label}>
            <MobileIcon size={18} /><span>{shortLabel[item.id]}</span>
          </Button>
        );
      })}
    </nav>
  );
}

function Notifications() {
  return null;
}