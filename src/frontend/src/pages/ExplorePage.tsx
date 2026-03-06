import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Hash, MessageSquare, Search, TrendingUp, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Post, User } from "../backend.d";
import { IcpBadge } from "../components/IcpBadge";
import { WideAppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useGetExplorePosts,
  useGetTrendingHashtags,
  useSearchUsers,
} from "../hooks/useQueries";

interface ExplorePost {
  id: bigint;
  image: string;
  caption: string;
  hashtags: string[];
  creator: string;
  timestamp: bigint;
}

export function ExplorePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "people">("posts");

  const { data: explorePosts, isLoading: postsLoading } = useGetExplorePosts();
  const { data: trendingHashtags, isLoading: tagsLoading } =
    useGetTrendingHashtags();
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(
    activeTab === "people" ? search : "",
  );

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const displayPosts: ExplorePost[] = (explorePosts ?? []).map((p: Post) => ({
    id: p.id,
    image: p.image.getDirectURL(),
    caption: p.caption,
    hashtags: p.hashtags,
    creator: p.creator.toString(),
    timestamp: p.timestamp,
  }));

  const displayHashtags = trendingHashtags ?? [];

  const filteredPosts = displayPosts.filter((p) => {
    const matchesSearch =
      !search ||
      p.caption.toLowerCase().includes(search.toLowerCase()) ||
      p.hashtags.some((h) => h.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = !activeTag || p.hashtags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <WideAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-gradient">
            Explore
          </h1>
        </div>

        {/* Search + tab toggle */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="explore.search.input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "people"
                  ? "Search people by username..."
                  : "Search posts, hashtags, creators..."
              }
              className="pl-10 bg-secondary border-border/50 focus:border-primary/50 rounded-xl h-11"
            />
          </div>

          {/* Posts / People tab toggle */}
          <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
            <button
              type="button"
              data-ocid="explore.posts.tab"
              onClick={() => {
                setActiveTab("posts");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "posts"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              Posts
            </button>
            <button
              type="button"
              data-ocid="explore.people.tab"
              onClick={() => {
                setActiveTab("people");
                setSearch("");
                setActiveTag(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "people"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User2 className="w-3.5 h-3.5" />
              People
            </button>
          </div>
        </div>

        {/* People search results */}
        {activeTab === "people" && (
          <div>
            {usersLoading && search.trim().length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                  <Skeleton key={i} className="h-24 rounded-2xl bg-secondary" />
                ))}
              </div>
            )}

            {!usersLoading && userResults && userResults.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {userResults.map((user: User, i) => {
                  const avatarUrl = user.profilePicture?.getDirectURL?.();
                  return (
                    <div
                      key={user.id.toString()}
                      data-ocid={`explore.user.item.${i + 1}`}
                      className="glass rounded-2xl p-4 border border-border/40 hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/20 flex-shrink-0">
                          {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
                          <AvatarFallback className="bg-gradient-brand text-white font-bold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm truncate">
                              {user.username}
                            </p>
                            <IcpBadge />
                          </div>
                          {user.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          data-ocid={`explore.user.view_profile.button.${i + 1}`}
                          variant="outline"
                          className="flex-1 rounded-xl text-xs border-border/60 hover:border-primary/50 h-8"
                          onClick={() =>
                            void navigate({
                              to: `/profile/${user.id.toString()}`,
                            })
                          }
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          data-ocid={`explore.user.message.button.${i + 1}`}
                          className="btn-gradient rounded-xl text-xs h-8 gap-1"
                          onClick={() => void navigate({ to: "/messages" })}
                        >
                          <MessageSquare className="w-3 h-3" />
                          Message
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!usersLoading &&
              search.trim().length > 0 &&
              (!userResults || userResults.length === 0) && (
                <div
                  data-ocid="explore.people.empty_state"
                  className="glass rounded-2xl p-12 text-center border border-border/40"
                >
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="font-display font-semibold mb-2">
                    No users found
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Try searching with a different username
                  </p>
                </div>
              )}

            {search.trim().length === 0 && (
              <div className="glass rounded-2xl p-12 text-center border border-border/40">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="font-display font-semibold mb-2">Find People</h3>
                <p className="text-muted-foreground text-sm">
                  Type a username above to search for people
                </p>
              </div>
            )}
          </div>
        )}

        {/* Posts tab */}
        {activeTab === "posts" && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Posts grid */}
            <div className="lg:col-span-3">
              {/* Active tag filter */}
              {activeTag && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">
                    Filtering by:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gradient glass px-3 py-1 rounded-full border border-primary/30 hover:border-primary/60 transition-all"
                  >
                    #{activeTag}
                    <span className="text-muted-foreground text-xs ml-1">
                      ✕
                    </span>
                  </button>
                </div>
              )}

              {postsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"] as const).map(
                    (sk) => (
                      <Skeleton
                        key={sk}
                        className="aspect-square rounded-xl bg-secondary"
                      />
                    ),
                  )}
                </div>
              ) : (
                <>
                  {filteredPosts.length === 0 ? (
                    <div
                      data-ocid="explore.empty_state"
                      className="glass rounded-2xl p-12 text-center border border-border/40"
                    >
                      <div className="text-4xl mb-4">🔭</div>
                      <h3 className="font-display font-semibold mb-2">
                        Nothing found
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {search
                          ? "Try a different search term"
                          : "No posts yet. Be the first to post!"}
                      </p>
                    </div>
                  ) : (
                    <div className="columns-2 sm:columns-3 gap-3 space-y-0">
                      {filteredPosts.map((post, i) => (
                        <div
                          key={post.id.toString()}
                          data-ocid={`explore.post.item.${i + 1}`}
                          className="break-inside-avoid mb-3 group relative glass-hover rounded-xl overflow-hidden cursor-pointer"
                        >
                          <img
                            src={post.image}
                            alt={post.caption}
                            className="w-full object-cover block"
                            style={{ borderRadius: "0.75rem" }}
                            loading="lazy"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex flex-col justify-end p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-brand text-[10px] font-bold text-white flex items-center justify-center">
                                {post.creator.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold truncate">
                                {typeof post.creator === "string"
                                  ? post.creator
                                  : `${(post.creator as unknown as Principal)
                                      .toString()
                                      .slice(0, 8)}...`}
                              </span>
                              <IcpBadge />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {post.caption}
                            </p>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {post.hashtags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] text-gradient"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar: trending hashtags */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass rounded-2xl p-4 border border-border/40 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-sm">
                    Trending
                  </h3>
                </div>

                {tagsLoading ? (
                  <div className="space-y-2">
                    {(
                      ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"] as const
                    ).map((sk) => (
                      <Skeleton
                        key={sk}
                        className="h-8 rounded-lg bg-secondary"
                      />
                    ))}
                  </div>
                ) : displayHashtags.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No trending hashtags yet
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {displayHashtags.map((tag, tagIdx) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() =>
                          setActiveTag(activeTag === tag ? null : tag)
                        }
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 ${
                          activeTag === tag
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <Hash
                          className={`w-3.5 h-3.5 flex-shrink-0 ${activeTag === tag ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <span
                          className={`text-sm font-medium truncate ${activeTag === tag ? "text-gradient" : "text-foreground"}`}
                        >
                          {tag}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 500) + 50 + tagIdx * 30}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </WideAppLayout>
  );
}
