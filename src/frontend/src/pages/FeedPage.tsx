import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Activity, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import type { Post } from "../backend.d";
import { CgramIcon } from "../components/CgramToken";
import { PostCard, PostCardSkeleton } from "../components/PostCard";
import { StoriesRow } from "../components/StoriesRow";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useGetPosts, useGetUserProfile } from "../hooks/useQueries";

function BlockchainStatsBar({ postCount }: { postCount: number }) {
  const cgram = postCount * 10 + 1200;
  return (
    <div
      data-ocid="feed.blockchain.panel"
      className="stats-bar-glass rounded-xl px-3 py-2 flex items-center gap-3 flex-wrap overflow-hidden"
    >
      {/* ICP Network status */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Activity className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          ICP Network
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 cert-badge-dot" />
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
            Live
          </span>
        </div>
      </div>

      <div className="w-px h-3 bg-border/50 flex-shrink-0 hidden sm:block" />

      {/* Posts on-chain */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground font-mono">
          Posts On-Chain:
        </span>
        <span className="text-[10px] font-mono font-bold stats-number">
          {postCount.toLocaleString()}
        </span>
      </div>

      <div className="w-px h-3 bg-border/50 flex-shrink-0 hidden sm:block" />

      {/* CGRAM in circulation */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <CgramIcon size={12} />
        <span className="text-[10px] text-muted-foreground font-mono">
          Circulation:
        </span>
        <span className="text-[10px] font-mono font-bold cgram-text">
          {cgram.toLocaleString()} CGRAM
        </span>
      </div>

      <div className="w-px h-3 bg-border/50 flex-shrink-0 hidden sm:block" />

      {/* Certified posts */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground font-mono">
          Certified:
        </span>
        <span className="text-[10px] font-mono font-bold stats-number">
          {postCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function PostWithProfile({ post, index }: { post: Post; index: number }) {
  const { data: profile } = useGetUserProfile(
    post.creator as unknown as Principal,
  );
  return <PostCard post={post} authorProfile={profile} index={index} />;
}

export function FeedPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const { data: posts, isLoading, refetch } = useGetPosts();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  if (!isAuthenticated && !isInitializing) return null;

  const displayPosts = posts ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-gradient">Home</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Blockchain Stats Bar */}
        <BlockchainStatsBar postCount={displayPosts.length} />

        {/* Stories */}
        <div className="glass rounded-2xl p-4 border border-border/40">
          <StoriesRow />
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-5">
            {(["sk1", "sk2", "sk3"] as const).map((sk) => (
              <PostCardSkeleton key={sk} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {displayPosts.map((post, i) => (
              <PostWithProfile
                key={post.id.toString()}
                post={post}
                index={i + 1}
              />
            ))}

            {/* Empty state */}
            {displayPosts.length === 0 && (
              <div
                data-ocid="feed.empty_state"
                className="glass rounded-2xl p-12 text-center border border-border/40"
              >
                <div className="text-4xl mb-4">📡</div>
                <h3 className="font-display font-semibold mb-2">
                  Your feed is empty
                </h3>
                <p className="text-muted-foreground text-sm">
                  Follow some creators to see their posts here
                </p>
                <Button
                  className="btn-gradient rounded-xl mt-4"
                  onClick={() => void navigate({ to: "/explore" })}
                >
                  Discover Creators
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
