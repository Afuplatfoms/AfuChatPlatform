import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Send, Search, Edit, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ChatInterface() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { sendMessage } = useWebSocket();

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: { conversationId: number; content: string }) => {
      // Send via WebSocket for real-time
      sendMessage({
        type: "message",
        conversationId: message.conversationId,
        content: message.content,
      });
      
      // Also send via API for persistence
      const res = await apiRequest("POST", "/api/messages", message);
      return res.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation, "messages"] 
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageInput.trim(),
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (selectedConversation) {
    const conversation = conversations.find((c: any) => c.id === selectedConversation);
    
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
              className="mr-2"
            >
              ←
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation?.otherUser?.avatar} />
              <AvatarFallback>
                <User size={20} />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {conversation?.otherUser?.displayName || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active now
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderId === user?.id
                      ? "bg-gradient-to-r from-primary to-secondary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === user?.id
                        ? "text-white/70"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-primary hover:bg-primary/90"
              disabled={!messageInput.trim() || sendMessageMutation.isPending}
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>

      {/* Search Messages */}
      <div className="px-4 py-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm">Start chatting with someone!</p>
          </div>
        ) : (
          conversations.map((conversation: any) => (
            <Card
              key={conversation.id}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 rounded-none shadow-none"
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.otherUser?.avatar} />
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-dark-surface rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">
                      {conversation.otherUser?.displayName || "User"}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {conversation.lastMessage?.createdAt &&
                        formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conversation.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
