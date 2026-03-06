import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookmarkPlus,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Post, UserProfile } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddComment,
  useGetComments,
  useLikePost,
  useUnlikePost,
} from "../hooks/useQueries";
import { CertificateModal } from "./CertificateModal";
import { CgramRewardFloat } from "./CgramToken";
import { IcpBadge, VERIFIED_PRINCIPALS, VerifiedBadge } from "./IcpBadge";

interface PostCardProps {
  post: Post;
  authorProfile?: UserProfile | null;
  index?: number;
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const diff = Date.now() - ms;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function PostCard({ post, authorProfile, index = 1 }: PostCardProps) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 200) + 10,
  );
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [certOpen, setCertOpen] = useState(false);
  const [showCgramReward, setShowCgramReward] = useState(false);

  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const addComment = useAddComment();
  const { data: comments } = useGetComments(post.id);

  const creatorStr = post.creator.toString();
  const shortPrincipal = `${creatorStr.slice(0, 6)}...${creatorStr.slice(-4)}`;
  const username = authorProfile?.username ?? shortPrincipal;
  const avatarUrl = authorProfile?.profilePicture?.getDirectURL();
  const imageUrl = post.image.getDirectURL();
  const isVerified = VERIFIED_PRINCIPALS.has(creatorStr);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in to like posts");
      return;
    }
    try {
      if (liked) {
        await unlikePost.mutateAsync(post.id);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        await likePost.mutateAsync(post.id);
        setLiked(true);
        setLikeCount((c) => c + 1);
        // Show CGRAM reward float
        setShowCgramReward(true);
        setTimeout(() => setShowCgramReward(false), 1300);
      }
    } catch {
      toast.error("Failed to update like");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      toast.error("Sign in to comment");
      return;
    }
    try {
      await addComment.mutateAsync({ postId: post.id, text: commentText });
      setCommentText("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Link copied to clipboard");
    });
  };

  return (
    <>
      <article
        data-ocid={`feed.post.item.${index}`}
        className="glass glass-hover rounded-2xl overflow-hidden shadow-glass animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 ring-2 ring-primary/30">
              {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
              <AvatarFallback className="bg-gradient-brand text-white text-sm font-bold">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-foreground">
                  {username}
                </span>
                {isVerified && <VerifiedBadge />}
                <IcpBadge />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-mono">
                  {shortPrincipal}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(post.timestamp)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={post.caption}
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
          {/* Certificate badge overlay */}
          <button
            type="button"
            data-ocid="post.certificate.button"
            onClick={() => setCertOpen(true)}
            className="absolute top-3 right-3 group"
            aria-label="View ownership certificate"
          >
            <span className="certificate-badge-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 group-hover:scale-105 group-hover:shadow-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 cert-badge-dot" />
              <span className="text-[10px] font-mono font-semibold text-white/90 tracking-wide">
                On-Chain
              </span>
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {/* Like button with CGRAM reward */}
              <div className="relative">
                {showCgramReward && <CgramRewardFloat amount={2} />}
                <button
                  type="button"
                  data-ocid="post.like.button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                    liked
                      ? "text-red-400"
                      : "text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${liked ? "fill-red-400" : ""}`}
                  />
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>
              </div>
              <button
                type="button"
                data-ocid="post.comment.button"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {comments?.length ?? 0}
                </span>
              </button>
              <button
                type="button"
                data-ocid="post.share.button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-105"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            >
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-foreground mb-2">
              <span className="font-semibold mr-1.5">{username}</span>
              {post.caption}
            </p>
          )}

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gradient font-medium hover:opacity-80 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments section */}
          {showComments && (
            <div className="mt-3 border-t border-border/30 pt-3 space-y-2">
              {comments?.slice(0, 3).map((c) => (
                <div key={c.id.toString()} className="text-sm flex gap-2">
                  <span className="font-semibold text-foreground font-mono text-xs">
                    {c.userId.toString().slice(0, 6)}...
                  </span>
                  <span className="text-muted-foreground">{c.text}</span>
                </div>
              ))}
              {(comments?.length ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground">No comments yet</p>
              )}
              <form onSubmit={handleComment} className="flex gap-2 mt-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-8 text-sm bg-secondary border-border/50"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="btn-gradient h-8 px-3"
                  disabled={addComment.isPending || !commentText.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </article>

      {/* Certificate Modal */}
      <CertificateModal
        post={post}
        open={certOpen}
        onOpenChange={setCertOpen}
      />
    </>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-9 h-9 rounded-full bg-secondary" />
        <div className="space-y-1.5">
          <Skeleton className="w-24 h-3 rounded bg-secondary" />
          <Skeleton className="w-32 h-2.5 rounded bg-secondary" />
        </div>
      </div>
      <Skeleton className="w-full aspect-square bg-secondary" />
      <div className="px-4 py-3 space-y-2">
        <Skeleton className="w-32 h-3 rounded bg-secondary" />
        <Skeleton className="w-48 h-2.5 rounded bg-secondary" />
      </div>
    </div>
  );
}
