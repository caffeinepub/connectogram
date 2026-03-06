import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Hash, Search, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { Post } from "../backend.d";
import { IcpBadge } from "../components/IcpBadge";
import { WideAppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useGetExplorePosts,
  useGetTrendingHashtags,
} from "../hooks/useQueries";

const SAMPLE_EXPLORE_POSTS = [
  {
    id: 1n,
    image: "/assets/generated/post-tokyo-night.dim_800x600.jpg",
    caption: "Tokyo nights ✨",
    hashtags: ["photography", "tokyo"],
    creator: "sofia.art",
    timestamp: 0n,
  },
  {
    id: 2n,
    image: "/assets/generated/post-blockchain-art.dim_800x600.jpg",
    caption: "NFT art 🎨",
    hashtags: ["nft", "web3"],
    creator: "alex.dev",
    timestamp: 0n,
  },
  {
    id: 3n,
    image: "/assets/generated/post-architecture.dim_800x600.jpg",
    caption: "Minimal arch 🏛️",
    hashtags: ["architecture", "minimal"],
    creator: "maya.web3",
    timestamp: 0n,
  },
  {
    id: 4n,
    image: "/assets/generated/post-street-food.dim_800x600.jpg",
    caption: "Bangkok street food 🍜",
    hashtags: ["food", "travel"],
    creator: "nomad.kai",
    timestamp: 0n,
  },
  {
    id: 5n,
    image: "/assets/generated/post-forest-glow.dim_800x600.jpg",
    caption: "Bioluminescent forest 🌿",
    hashtags: ["nature", "magic"],
    creator: "nature.lens",
    timestamp: 0n,
  },
  {
    id: 6n,
    image: "/assets/generated/post-workspace.dim_800x600.jpg",
    caption: "Dev setup 💻",
    hashtags: ["developer", "setup"],
    creator: "code.nova",
    timestamp: 0n,
  },
];

const SAMPLE_HASHTAGS = [
  "web3",
  "nft",
  "photography",
  "defi",
  "icp",
  "blockchain",
  "travel",
  "art",
  "developer",
  "crypto",
  "design",
  "nature",
];

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

  const { data: explorePosts, isLoading: postsLoading } = useGetExplorePosts();
  const { data: trendingHashtags, isLoading: tagsLoading } =
    useGetTrendingHashtags();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const displayPosts: ExplorePost[] =
    explorePosts && explorePosts.length > 0
      ? explorePosts.map((p: Post) => ({
          id: p.id,
          image: p.image.getDirectURL(),
          caption: p.caption,
          hashtags: p.hashtags,
          creator: p.creator.toString(),
          timestamp: p.timestamp,
        }))
      : SAMPLE_EXPLORE_POSTS;

  const displayHashtags =
    trendingHashtags && trendingHashtags.length > 0
      ? trendingHashtags
      : SAMPLE_HASHTAGS;

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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="explore.search.input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts, hashtags, creators..."
            className="pl-10 bg-secondary border-border/50 focus:border-primary/50 rounded-xl h-11"
          />
        </div>

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
                  <span className="text-muted-foreground text-xs ml-1">✕</span>
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
                      Try a different search term
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
                <h3 className="font-display font-semibold text-sm">Trending</h3>
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
      </div>
    </WideAppLayout>
  );
}
