import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type {
  Comment,
  Message,
  Notification,
  Post,
  Story,
  User,
  UserProfile,
} from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "./useActor";

// ── Posts ──────────────────────────────────────────────────────────────────

export function useGetPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetExplorePosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["explore-posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExplorePosts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetPostsByUser(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["user-posts", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getPostsByUser(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 30_000,
  });
}

export function useGetComments(postId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useGetTrendingHashtags() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["trending-hashtags"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingHashtags();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetLikeCount(postId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["like-count", postId.toString()],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getLikeCount(postId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useGetPostLikes(postId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["post-likes", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostLikes(postId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.likePost(postId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["explore-posts"] });
      void qc.invalidateQueries({ queryKey: ["like-count"] });
      void qc.invalidateQueries({ queryKey: ["post-likes"] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.unlikePost(postId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["explore-posts"] });
      void qc.invalidateQueries({ queryKey: ["like-count"] });
      void qc.invalidateQueries({ queryKey: ["post-likes"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, text }: { postId: bigint; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(postId, text);
    },
    onSuccess: (_data, { postId }) => {
      void qc.invalidateQueries({ queryKey: ["comments", postId.toString()] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      image,
      caption,
      hashtags,
    }: {
      image: ExternalBlob;
      caption: string;
      hashtags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPost(image, caption, hashtags);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["explore-posts"] });
    },
  });
}

// ── Stories ────────────────────────────────────────────────────────────────

export function useGetAllStories() {
  const { actor, isFetching } = useActor();
  return useQuery<Story[]>({
    queryKey: ["all-stories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetActiveStories(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Story[]>({
    queryKey: ["stories", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const stories = await actor.getActiveStories(principal);
      const now = Date.now();
      return stories.filter(
        (s) => now - Number(s.createdAt / 1_000_000n) < 24 * 60 * 60 * 1000,
      );
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 30_000,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      image,
      text,
    }: { image: ExternalBlob; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createStory(image, text);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["stories"] });
      void qc.invalidateQueries({ queryKey: ["all-stories"] });
    },
  });
}

// ── Users ──────────────────────────────────────────────────────────────────

export function useGetUser(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<User | null>({
    queryKey: ["user", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.getUser(principal);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 60_000,
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 60_000,
  });
}

export function useGetFollowers(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["followers", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowers(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 30_000,
  });
}

export function useGetFollowing(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["following", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowing(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 30_000,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.followUser(user);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["followers"] });
      void qc.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.unfollowUser(user);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["followers"] });
      void qc.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const { refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async ({
      bio,
      profilePicture,
    }: {
      bio: string;
      profilePicture: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateUser(bio, profilePicture);
    },
    onSuccess: () => {
      void refreshProfile();
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const { refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async ({
      username,
      bio,
      profilePicture,
    }: {
      username: string;
      bio: string;
      profilePicture: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerUser(username, bio, profilePicture);
    },
    onSuccess: () => {
      void refreshProfile();
    },
  });
}

// ── Messages ───────────────────────────────────────────────────────────────

export function useGetConversations() {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

export function useGetMessages(withUser: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", withUser?.toString()],
    queryFn: async () => {
      if (!actor || !withUser) return [];
      return actor.getMessages(withUser);
    },
    enabled: !!actor && !isFetching && !!withUser,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipient,
      content,
    }: {
      recipient: Principal;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(recipient, content);
    },
    onSuccess: (_data, { recipient }) => {
      void qc.invalidateQueries({
        queryKey: ["messages", recipient.toString()],
      });
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ── Notifications ──────────────────────────────────────────────────────────

export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.markNotificationsRead();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ── User Search ────────────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ["all-users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSearchUsers(query: string) {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ["search-users", query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchUsers(query.trim());
    },
    enabled: !!actor && !isFetching && query.trim().length > 0,
    staleTime: 15_000,
  });
}
