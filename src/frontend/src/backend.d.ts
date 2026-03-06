import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    id: bigint;
    userId: Principal;
    text: string;
    timestamp: Time;
    postId: bigint;
}
export interface User {
    id: Principal;
    bio: string;
    username: string;
    profilePicture?: ExternalBlob;
}
export interface Story {
    id: bigint;
    userId: Principal;
    createdAt: Time;
    text: string;
    image: ExternalBlob;
}
export interface Post {
    id: bigint;
    creator: Principal;
    hashtags: Array<string>;
    timestamp: Time;
    caption: string;
    image: ExternalBlob;
}
export interface Notification {
    id: bigint;
    userId: Principal;
    notificationType: Variant_like_comment_follow;
    isRead: boolean;
    timestamp: Time;
    fromUser: Principal;
    postId?: bigint;
}
export interface Message {
    id: bigint;
    content: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    bio: string;
    username: string;
    profilePicture?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_like_comment_follow {
    like = "like",
    comment = "comment",
    follow = "follow"
}
export interface backendInterface {
    addComment(postId: bigint, text: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createNotification(userId: Principal, fromUser: Principal, notificationType: Variant_like_comment_follow, postId: bigint | null): Promise<void>;
    createPost(image: ExternalBlob, caption: string, hashtags: Array<string>): Promise<bigint>;
    createStory(image: ExternalBlob, text: string): Promise<bigint>;
    followUser(user: Principal): Promise<void>;
    getActiveStories(user: Principal): Promise<Array<Story>>;
    getAllStories(): Promise<Array<Story>>;
    getAllUsers(): Promise<Array<User>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: bigint): Promise<Array<Comment>>;
    getConversations(): Promise<Array<Principal>>;
    getExplorePosts(): Promise<Array<Post>>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getLikeCount(postId: bigint): Promise<bigint>;
    getMessages(user: Principal): Promise<Array<Message>>;
    getNotifications(): Promise<Array<Notification>>;
    getPost(postId: bigint): Promise<Post>;
    getPostLikes(postId: bigint): Promise<Array<Principal>>;
    getPosts(): Promise<Array<Post>>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getTrendingHashtags(): Promise<Array<string>>;
    getUser(user: Principal): Promise<User>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markNotificationsRead(): Promise<void>;
    registerUser(username: string, bio: string, profilePicture: ExternalBlob | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(search: string): Promise<Array<User>>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
    unfollowUser(user: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    updateUser(bio: string, profilePicture: ExternalBlob | null): Promise<void>;
}
