import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  PenSquare,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IcpBadge } from "../components/IcpBadge";
import { WideAppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useGetConversations,
  useGetMessages,
  useGetUserProfile,
  useSearchUsers,
  useSendMessage,
} from "../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function ConversationItemWithProfile({
  principalStr,
  isActive,
  onClick,
  index,
  lastMessage,
}: {
  principalStr: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
  lastMessage?: { content: string; timestamp: bigint };
}) {
  let p: Principal | null = null;
  try {
    p = PrincipalClass.fromText(principalStr) as unknown as Principal;
  } catch {
    /* invalid */
  }
  const { data: profile } = useGetUserProfile(p);
  const username = profile?.username ?? `${principalStr.slice(0, 8)}...`;
  const avatarUrl = profile?.profilePicture?.getDirectURL?.();

  return (
    <button
      type="button"
      data-ocid={`messages.conversation.item.${index}`}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
        isActive
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-secondary"
      }`}
    >
      <Avatar className="w-11 h-11 flex-shrink-0 ring-2 ring-primary/20">
        {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
        <AvatarFallback className="bg-gradient-brand text-white font-bold">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-sm truncate">{username}</span>
          {lastMessage && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatTimestamp(lastMessage.timestamp)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-muted-foreground truncate">
            {lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}

export function MessagesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, principal: myPrincipal } = useAuth();
  const [selectedPrincipal, setSelectedPrincipal] = useState<string | null>(
    null,
  );
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<
    {
      id: bigint;
      content: string;
      sender: string;
      recipient: string;
      timestamp: bigint;
    }[]
  >([]);
  const [showThread, setShowThread] = useState(false);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) void navigate({ to: "/auth" });
  }, [isAuthenticated, isInitializing, navigate]);

  const { data: conversations, isLoading: convsLoading } =
    useGetConversations();
  const { data: searchResults, isLoading: searchLoading } =
    useSearchUsers(searchQuery);

  let activePrincipal: Principal | null = null;
  try {
    if (selectedPrincipal)
      activePrincipal = PrincipalClass.fromText(
        selectedPrincipal,
      ) as unknown as Principal;
  } catch {
    /* invalid */
  }

  const { data: realMessages, refetch: refetchMessages } =
    useGetMessages(activePrincipal);
  const { data: selectedProfile } = useGetUserProfile(activePrincipal);
  const sendMessage = useSendMessage();

  const displayMessages =
    realMessages && realMessages.length > 0
      ? realMessages.map((m) => ({
          id: m.id,
          content: m.content,
          sender: m.sender.toString(),
          recipient: m.recipient.toString(),
          timestamp: m.timestamp,
        }))
      : localMessages;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message list change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realMessages, localMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPrincipal || !myPrincipal) return;

    const msg = {
      id: BigInt(Date.now()),
      content: messageText.trim(),
      sender: myPrincipal,
      recipient: selectedPrincipal,
      timestamp: BigInt(Date.now()) * 1_000_000n,
    };

    setLocalMessages((prev) => [...prev, msg]);
    setMessageText("");

    if (activePrincipal) {
      try {
        await sendMessage.mutateAsync({
          recipient: activePrincipal,
          content: msg.content,
        });
        void refetchMessages();
      } catch {
        // Still show optimistically
      }
    }
  };

  const handleSelectConv = (p: string) => {
    setSelectedPrincipal(p);
    setLocalMessages([]);
    setShowThread(true);
    setNewMsgOpen(false);
    setSearchQuery("");
  };

  const selectedUsername =
    selectedProfile?.username ?? selectedPrincipal?.slice(0, 8) ?? "";
  const selectedAvatarUrl = selectedProfile?.profilePicture?.getDirectURL?.();

  const convPrincipals = conversations?.map((p) => p.toString()) ?? [];

  return (
    <WideAppLayout>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
        <div className="glass rounded-2xl border border-border/40 shadow-glass overflow-hidden h-full flex">
          {/* Conversation list */}
          <div
            className={`w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-border/30 flex flex-col ${showThread ? "hidden md:flex" : "flex"}`}
          >
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <h1 className="font-display font-bold text-gradient">Messages</h1>
              <button
                type="button"
                data-ocid="messages.new_message.button"
                onClick={() => setNewMsgOpen((v) => !v)}
                className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors"
                title="New Message"
              >
                <PenSquare className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* New message search panel */}
            {newMsgOpen && (
              <div className="p-3 border-b border-border/30 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    data-ocid="messages.user_search.input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-9 h-9 bg-secondary border-border/50 rounded-lg text-sm"
                    autoFocus
                  />
                </div>
                {searchLoading && (
                  <div className="text-xs text-muted-foreground px-1">
                    Searching...
                  </div>
                )}
                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {searchResults
                      .filter((u) => u.id.toString() !== myPrincipal)
                      .map((user, i) => {
                        const avatarUrl = user.profilePicture?.getDirectURL?.();
                        return (
                          <button
                            type="button"
                            key={user.id.toString()}
                            data-ocid={`messages.search_result.item.${i + 1}`}
                            onClick={() => handleSelectConv(user.id.toString())}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              {avatarUrl ? (
                                <AvatarImage src={avatarUrl} />
                              ) : null}
                              <AvatarFallback className="bg-gradient-brand text-white text-xs font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {user.username}
                              </p>
                              {user.bio && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.bio}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
                {searchResults &&
                  searchResults.length === 0 &&
                  searchQuery.trim().length > 0 &&
                  !searchLoading && (
                    <p className="text-xs text-muted-foreground px-1">
                      No users found
                    </p>
                  )}
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {convsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="w-11 h-11 rounded-full bg-secondary" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="w-24 h-3 bg-secondary rounded" />
                          <Skeleton className="w-36 h-2.5 bg-secondary rounded" />
                        </div>
                      </div>
                    ))
                  : convPrincipals.map((p, i) => (
                      <ConversationItemWithProfile
                        key={p}
                        principalStr={p}
                        isActive={selectedPrincipal === p}
                        onClick={() => handleSelectConv(p)}
                        index={i + 1}
                      />
                    ))}

                {!convsLoading && convPrincipals.length === 0 && (
                  <div
                    data-ocid="messages.empty_state"
                    className="text-center py-8 px-4"
                  >
                    <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No conversations yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tap the pencil icon to find someone to message
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Thread */}
          <div
            className={`flex-1 flex flex-col ${!showThread ? "hidden md:flex" : "flex"}`}
          >
            {selectedPrincipal ? (
              <>
                {/* Thread header */}
                <div className="p-4 border-b border-border/30 flex items-center gap-3">
                  <button
                    type="button"
                    className="md:hidden text-muted-foreground hover:text-foreground mr-1"
                    onClick={() => setShowThread(false)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="w-9 h-9 ring-2 ring-primary/20">
                    {selectedAvatarUrl ? (
                      <AvatarImage src={selectedAvatarUrl} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-brand text-white text-sm font-bold">
                      {selectedUsername.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">
                        {selectedUsername}
                      </span>
                      <IcpBadge />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {selectedPrincipal.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {displayMessages.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          No messages yet. Say hello!
                        </p>
                      </div>
                    )}
                    {displayMessages.map((msg) => {
                      const isMe = msg.sender === myPrincipal;
                      return (
                        <div
                          key={msg.id.toString()}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                              isMe
                                ? "bg-gradient-brand text-white rounded-br-sm"
                                : "glass border border-border/40 text-foreground rounded-bl-sm"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}
                            >
                              {formatTimestamp(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-border/30">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                      data-ocid="messages.input"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-secondary border-border/50 focus:border-primary/50 rounded-xl"
                    />
                    <Button
                      type="submit"
                      data-ocid="messages.send.button"
                      size="icon"
                      className="btn-gradient rounded-xl w-10 h-10 flex-shrink-0"
                      disabled={sendMessage.isPending || !messageText.trim()}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">
                    Your Messages
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select a conversation or start a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </WideAppLayout>
  );
}
