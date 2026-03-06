import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { IcpBadge } from "../components/IcpBadge";
import { WideAppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useGetConversations,
  useGetMessages,
  useGetUserProfile,
  useSendMessage,
} from "../hooks/useQueries";

// Sample conversation partners for demo
const DEMO_CONVERSATIONS = [
  {
    principal: "2vxsx-fae",
    username: "sofia.art",
    avatar: "/assets/generated/avatar-sofia.dim_200x200.jpg",
    lastMessage: "Hey! Loved your latest post 🔥",
    time: "2m",
    unread: 2,
  },
  {
    principal: "aaaaa-aa",
    username: "alex.dev",
    avatar: "/assets/generated/avatar-alex.dim_200x200.jpg",
    lastMessage: "Are you coming to the Web3 meetup?",
    time: "1h",
    unread: 0,
  },
  {
    principal: "rrkah-fqaaa",
    username: "maya.web3",
    avatar: "/assets/generated/avatar-maya.dim_200x200.jpg",
    lastMessage: "Check out my new NFT collection!",
    time: "3h",
    unread: 1,
  },
];

const DEMO_MESSAGES = (myPrincipal: string, otherPrincipal: string) => [
  {
    id: 1n,
    content: "Hey! Loved your latest post 🔥",
    sender: otherPrincipal,
    recipient: myPrincipal,
    timestamp: BigInt(Date.now() - 10 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 2n,
    content: "Thanks! Was experimenting with some new techniques",
    sender: myPrincipal,
    recipient: otherPrincipal,
    timestamp: BigInt(Date.now() - 9 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 3n,
    content: "The color grading is incredible. What software do you use?",
    sender: otherPrincipal,
    recipient: myPrincipal,
    timestamp: BigInt(Date.now() - 8 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 4n,
    content: "Mostly Lightroom for photos, Final Cut for video 🎬",
    sender: myPrincipal,
    recipient: otherPrincipal,
    timestamp: BigInt(Date.now() - 7 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 5n,
    content: "That makes sense! We should collab sometime",
    sender: otherPrincipal,
    recipient: myPrincipal,
    timestamp: BigInt(Date.now() - 5 * 60 * 1000) * 1_000_000n,
  },
];

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function ConversationItem({
  principal: _principal,
  username,
  avatar,
  lastMessage,
  time,
  unread,
  isActive,
  onClick,
  index,
}: {
  principal: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  unread?: number;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
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
        {avatar ? <AvatarImage src={avatar} /> : null}
        <AvatarFallback className="bg-gradient-brand text-white font-bold">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-sm truncate">{username}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {time}
          </span>
        </div>
        {lastMessage && (
          <p className="text-xs text-muted-foreground truncate">
            {lastMessage}
          </p>
        )}
      </div>
      {unread != null && unread > 0 && (
        <span className="w-5 h-5 bg-gradient-brand rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
          {unread}
        </span>
      )}
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const { data: conversations, isLoading: convsLoading } =
    useGetConversations();

  let activePrincipal: Principal | null = null;
  try {
    if (selectedPrincipal) {
      activePrincipal = PrincipalClass.fromText(
        selectedPrincipal,
      ) as unknown as Principal;
    }
  } catch {
    /* invalid */
  }

  const { data: realMessages } = useGetMessages(activePrincipal);
  const { data: selectedProfile } = useGetUserProfile(activePrincipal);
  const sendMessage = useSendMessage();

  // Use demo messages if no real data
  const displayMessages =
    realMessages && realMessages.length > 0
      ? realMessages.map((m) => ({
          id: m.id,
          content: m.content,
          sender: m.sender.toString(),
          recipient: m.recipient.toString(),
          timestamp: m.timestamp,
        }))
      : selectedPrincipal && myPrincipal
        ? [...DEMO_MESSAGES(myPrincipal, selectedPrincipal), ...localMessages]
        : localMessages;

  const displayConversations =
    conversations && conversations.length > 0
      ? conversations.map((p, i) => ({
          principal: p.toString(),
          username: `user_${p.toString().slice(0, 6)}`,
          index: i + 1,
        }))
      : DEMO_CONVERSATIONS.map((c, i) => ({ ...c, index: i + 1 }));

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
      } catch {
        // Still show optimistically
      }
    }
  };

  const selectedConv = DEMO_CONVERSATIONS.find(
    (c) => c.principal === selectedPrincipal,
  );
  const selectedUsername =
    selectedProfile?.username ??
    selectedConv?.username ??
    selectedPrincipal?.slice(0, 8) ??
    "";
  const selectedAvatar = selectedConv?.avatar;
  const [showThread, setShowThread] = useState(false);

  const handleSelectConv = (p: string) => {
    setSelectedPrincipal(p);
    setLocalMessages([]);
    setShowThread(true);
  };

  return (
    <WideAppLayout>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
        <div className="glass rounded-2xl border border-border/40 shadow-glass overflow-hidden h-full flex">
          {/* Conversation list */}
          <div
            className={`w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-border/30 flex flex-col ${showThread ? "hidden md:flex" : "flex"}`}
          >
            <div className="p-4 border-b border-border/30">
              <h1 className="font-display font-bold text-gradient">Messages</h1>
            </div>
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
                  : displayConversations.map((conv) => (
                      <ConversationItem
                        key={conv.principal}
                        principal={conv.principal}
                        username={
                          (conv as any).username ??
                          `user_${conv.principal.slice(0, 6)}`
                        }
                        avatar={(conv as any).avatar}
                        lastMessage={(conv as any).lastMessage}
                        time={(conv as any).time ?? ""}
                        unread={(conv as any).unread}
                        isActive={selectedPrincipal === conv.principal}
                        onClick={() => handleSelectConv(conv.principal)}
                        index={(conv as any).index ?? 1}
                      />
                    ))}

                {displayConversations.length === 0 && (
                  <div
                    data-ocid="messages.empty_state"
                    className="text-center py-8"
                  >
                    <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No messages yet
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
                    {selectedAvatar ? (
                      <AvatarImage src={selectedAvatar} />
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
                    Select a conversation to start messaging
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
