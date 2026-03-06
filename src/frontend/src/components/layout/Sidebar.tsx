import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Compass,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  User,
  Zap,
} from "lucide-react";
import type React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useGetNotifications } from "../../hooks/useQueries";

const NAV_ITEMS = [
  { to: "/feed", icon: Home, label: "Home", ocid: "nav.feed.link" },
  { to: "/explore", icon: Compass, label: "Explore", ocid: "nav.explore.link" },
  { to: "/create", icon: PlusSquare, label: "Create", ocid: "nav.create.link" },
  {
    to: "/messages",
    icon: MessageCircle,
    label: "Messages",
    ocid: "nav.messages.link",
  },
  {
    to: "/notifications",
    icon: Bell,
    label: "Notifications",
    ocid: "nav.notifications.link",
  },
];

export function Sidebar() {
  const location = useLocation();
  const { userProfile, principal, logout } = useAuth();
  const { data: notifications } = useGetNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : "";

  return (
    <aside className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col z-40 glass border-r border-border/50">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-border/30">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-gradient">
            Connectogram
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, ocid }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-primary" : ""
                  }`}
                />
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-brand rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`font-medium text-sm ${isActive ? "text-gradient font-semibold" : ""}`}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-brand rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {principal && (
        <div className="px-3 pb-6 border-t border-border/30 pt-4 space-y-2">
          <Link
            to="/profile/$principalId"
            params={{ principalId: principal ?? "" }}
            data-ocid="nav.profile.link"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-all duration-200 group"
          >
            <Avatar className="w-8 h-8 ring-2 ring-primary/30">
              {userProfile?.profilePicture ? (
                <AvatarImage src={userProfile.profilePicture.getDirectURL()} />
              ) : null}
              <AvatarFallback className="bg-gradient-brand text-white text-xs font-bold">
                {userProfile?.username?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {userProfile?.username ?? "Profile"}
              </p>
              <p className="text-xs text-muted-foreground truncate font-mono">
                {shortPrincipal}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-4"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      )}
    </aside>
  );
}

// ── Mobile bottom nav ──────────────────────────────────────────────────────

export function MobileNav() {
  const location = useLocation();
  const { principal } = useAuth();
  const { data: notifications } = useGetNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  type NavItem = {
    to: "/" | "/feed" | "/explore" | "/create" | "/notifications";
    icon: React.ComponentType<{ className?: string }>;
    ocid: string;
    badge?: number;
  };

  const MOBILE_ITEMS: NavItem[] = [
    { to: "/feed", icon: Home, ocid: "nav.feed.link" },
    { to: "/explore", icon: Compass, ocid: "nav.explore.link" },
    { to: "/create", icon: PlusSquare, ocid: "nav.create.link" },
    {
      to: "/notifications",
      icon: Bell,
      ocid: "nav.notifications.link",
      badge: unreadCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 glass border-t border-border/50">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {MOBILE_ITEMS.map(({ to, icon: Icon, ocid, badge }) => {
          const isActive =
            location.pathname === to ||
            location.pathname.startsWith(to.split("/").slice(0, 2).join("/"));
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`}
              />
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gradient-brand" />
              )}
              {badge != null && badge > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-gradient-brand rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
        {/* Profile link */}
        {principal && (
          <Link
            to="/profile/$principalId"
            params={{ principalId: principal }}
            data-ocid="nav.profile.link"
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
              location.pathname.startsWith("/profile")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <User className="w-5 h-5 transition-transform" />
            {location.pathname.startsWith("/profile") && (
              <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gradient-brand" />
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}
