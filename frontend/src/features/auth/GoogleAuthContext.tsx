import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
};

type TokenClient = {
  requestAccessToken: (options?: { prompt?: "" | "consent"; hint?: string }) => void;
};

type GoogleAuthContextValue = {
  isReady: boolean;
  isLoggedIn: boolean;
  accessToken: string | null;
  userName: string | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "tsunagari-google-auth";
const GOOGLE_SCOPE =
  "openid email profile https://www.googleapis.com/auth/calendar.readonly";

const GoogleAuthContext = createContext<GoogleAuthContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
};

export function GoogleAuthProvider({ children }: ProviderProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const [isReady, setIsReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasPromptedRef = useRef(false);
  const tokenClientRef = useRef<TokenClient | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { accessToken: string; expiresAt: number };
      if (parsed.accessToken && parsed.expiresAt > Date.now()) {
        setAccessToken(parsed.accessToken);
        hasPromptedRef.current = true;
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setUserName(null);
      return;
    }
    const controller = new AbortController();
    const loadProfile = async () => {
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Googleプロフィール取得に失敗しました。");
        }
        const profile = (await response.json()) as { name?: string; email?: string };
        setUserName(profile.name ?? profile.email ?? "Googleユーザー");
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Googleプロフィール取得に失敗しました。");
      }
    };
    void loadProfile();
    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    if (!clientId) {
      setError("VITE_GOOGLE_CLIENT_ID が未設定です。");
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const accounts = window.google?.accounts;
      if (!accounts?.oauth2?.initTokenClient) {
        setError("Googleログインの初期化に失敗しました。");
        setIsReady(true);
        return;
      }

      tokenClientRef.current = accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPE,
        callback: (tokenResponse: TokenResponse) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setError(tokenResponse.error_description ?? "Googleログインに失敗しました。");
            return;
          }
          const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
          setAccessToken(tokenResponse.access_token);
          setError(null);
          window.sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ accessToken: tokenResponse.access_token, expiresAt }),
          );
        },
      }) as TokenClient;
      setIsReady(true);
    };

    script.onerror = () => {
      setError("Googleログインスクリプトの読み込みに失敗しました。");
      setIsReady(true);
    };

    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [clientId]);

  const login = async () => {
    setError(null);
    const tokenClient = tokenClientRef.current;
    if (!tokenClient) {
      setError("Googleログインの準備中です。");
      return;
    }
    tokenClient.requestAccessToken({
      prompt: hasPromptedRef.current ? "" : "consent",
    });
    hasPromptedRef.current = true;
  };

  const logout = () => {
    const token = accessToken;
    setAccessToken(null);
    setUserName(null);
    setError(null);
    window.sessionStorage.removeItem(STORAGE_KEY);
    if (token && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(token, () => undefined);
    }
  };

  const value = useMemo<GoogleAuthContextValue>(
    () => ({
      isReady,
      isLoggedIn: !!accessToken,
      accessToken,
      userName,
      error,
      login,
      logout,
    }),
    [accessToken, error, isReady, userName],
  );

  return <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>;
}

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error("useGoogleAuth must be used within GoogleAuthProvider");
  }
  return context;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient?: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => TokenClient;
          revoke?: (token: string, done: () => void) => void;
        };
      };
    };
  }
}
