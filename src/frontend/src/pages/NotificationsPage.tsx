import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Variant_like_comment_follow } from "../backend.d";
import type { Notification } from "../backend.d";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useGetNotifications,
  useMarkNotificationsRead,
} from "../hooks/useQueries";

// Demo notifications
const DEMO_NOTIFICATIONS = [
  {
    id: 1n,
    notificationType: Variant_like_comment_follow.like,
    fromUser: "sofia.art",
    fromAvatar: "/assets/generated/avatar-sofia.dim_200x200.jpg",
    isRead: false,
    timestamp: BigInt(Date.now() - 5 * 60 * 1000) * 1_000_000n,
    text: "liked your post",
  },
  {
    id: 2n,
    notificationType: Variant_like_comment_follow.comment,
    fromUser: "alex.dev",
    fromAvatar: "/assets/generated/avatar-alex.dim_200x200.jpg",
    isRead: false,
    timestamp: BigInt(Date.now() - 15 * 60 * 1000) * 1_000_000n,
    text: 'commented: "This is absolutely stunning work! 🔥"',
  },
  {
    id: 3n,
    notificationType: Variant_like_comment_follow.follow,
    fromUser: "maya.web3",
    fromAvatar: "/assets/generated/avatar-maya.dim_200x200.jpg",
    isRead: true,
    timestamp: BigInt(Date.now() - 2 * 60 * 60 * 1000) * 1_000_000n,
    text: "started following you",
  },
  {
    id: 4n,
    notificationType: Variant_like_comment_follow.like,
    fromUser: "crypto.kai",
    fromAvatar: "",
    isRead: true,
    timestamp: BigInt(Date.now() - 5 * 60 * 60 * 1000) * 1_000_000n,
    text: "liked your post",
  },
  {
    id: 5n,
    notificationType: Variant_like_comment_follow.follow,
    fromUser: "nft.nova",
    fromAvatar: "",
    isRead: true,
    timestamp: BigInt(Date.now() - 24 * 60 * 60 * 1000) * 1_000_000n,
    text: "started following you",
  },
  {
    id: 6n,
    notificationType: Variant_like_comment_follow.comment,
    fromUser: "web3.wren",
    fromAvatar: "",
    isRead: true,
    timestamp: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000) * 1_000_000n,
    text: 'commented: "Incredible composition! How did you achieve this effect?"',
  },
];

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const diff = Date.now() - ms;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotifIcon({ type }: { type: Variant_like_comment_follow }) {
  if (type === Variant_like_comment_follow.like) {
    return (
      <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0">
        <Heart className="w-4 h-4 text-red-400 fill-red-400" />
      </div>
    );
  }
  if (type === Variant_like_comment_follow.comment) {
    return (
      <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
        <MessageCircle className="w-4 h-4 text-accent" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
      <UserPlus className="w-4 h-4 text-primary" />
    </div>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const { data: notifications, isLoading } = useGetNotifications();
  const markRead = useMarkNotificationsRead();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const displayNotifications =
    notifications && notifications.length > 0
      ? notifications.map((n: Notification, i) => ({
          id: n.id,
          notificationType: n.notificationType,
          fromUser: `${n.fromUser.toString().slice(0, 8)}...`,
          fromAvatar: "",
          isRead: n.isRead,
          timestamp: n.timestamp,
          text:
            n.notificationType === Variant_like_comment_follow.like
              ? "liked your post"
              : n.notificationType === Variant_like_comment_follow.comment
                ? "commented on your post"
                : "started following you",
          index: i + 1,
        }))
      : DEMO_NOTIFICATIONS.map((n, i) => ({ ...n, index: i + 1 }));

  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-gradient">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              data-ocid="notifications.mark_read.button"
              onClick={handleMarkAllRead}
              disabled={markRead.isPending}
              className="text-muted-foreground hover:text-foreground gap-2 text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        {isLoading ? (
          <div className="glass rounded-2xl border border-border/40 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                key={i}
                className="flex items-start gap-3 p-4 border-b border-border/30 last:border-b-0"
              >
                <Skeleton className="w-10 h-10 rounded-full bg-secondary flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="w-48 h-3 bg-secondary rounded" />
                  <Skeleton className="w-24 h-2.5 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayNotifications.length === 0 ? (
          <div
            data-ocid="notifications.empty_state"
            className="glass rounded-2xl p-12 text-center border border-border/40"
          >
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-display font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-sm">
              No new notifications
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border/40 overflow-hidden divide-y divide-border/30">
            {displayNotifications.map((notif, i) => (
              <div
                key={notif.id.toString()}
                data-ocid={`notifications.item.${i + 1}`}
                className={`flex items-start gap-3 p-4 transition-colors hover:bg-secondary/30 ${
                  !notif.isRead ? "bg-primary/5" : ""
                }`}
              >
                {/* Unread indicator */}
                <div className="relative flex-shrink-0 mt-1">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                    {notif.fromAvatar ? (
                      <AvatarImage src={notif.fromAvatar} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-brand text-white text-sm font-bold">
                      {notif.fromUser.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <NotifIcon type={notif.notificationType} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">
                      {notif.fromUser}
                    </span>{" "}
                    <span className="text-muted-foreground">{notif.text}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(notif.timestamp)}
                  </p>
                </div>

                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-gradient-brand mt-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
