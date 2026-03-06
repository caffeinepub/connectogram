import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  userProfile: UserProfile | null;
  principal: string | null;
  login: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setUserProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear, isInitializing, isLoggingIn, loginStatus } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal().toString() ?? null;

  const refreshProfile = useCallback(async () => {
    if (!actor || !isAuthenticated) {
      setUserProfile(null);
      setProfileLoaded(true);
      return;
    }
    try {
      const profile = await actor.getCallerUserProfile();
      setUserProfile(profile);
    } catch {
      setUserProfile(null);
    } finally {
      setProfileLoaded(true);
    }
  }, [actor, isAuthenticated]);

  useEffect(() => {
    if (!isFetching && actor) {
      void refreshProfile();
    } else if (!isAuthenticated && !isInitializing) {
      setUserProfile(null);
      setProfileLoaded(true);
    }
  }, [actor, isFetching, isAuthenticated, isInitializing, refreshProfile]);

  // Reset profile when logging out
  useEffect(() => {
    if (loginStatus === "idle" && !identity) {
      setUserProfile(null);
      setProfileLoaded(false);
    }
  }, [loginStatus, identity]);

  const value: AuthContextValue = {
    isAuthenticated,
    isInitializing: isInitializing || (isAuthenticated && !profileLoaded),
    isLoggingIn,
    userProfile,
    principal,
    login,
    logout: clear,
    refreshProfile,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
