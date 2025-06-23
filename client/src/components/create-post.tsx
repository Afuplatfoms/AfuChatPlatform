import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, MapPin, UserRound, User, Loader2 } from "lucide-react";

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"post" | "story">("post");
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string }) => {
      const endpoint = postType === "story" ? "/api/stories" : "/api/posts";
      const res = await apiRequest("POST", endpoint, postData);
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      toast({
        title: "Success!",
        description: `Your ${postType} has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      onPostCreated?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({ content: content.trim() });
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-3 mb-6">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>
            {user?.displayName?.[0] || user?.username?.[0] || <User size={20} />}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user?.displayName || user?.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">What's on your mind?</p>
        </div>
      </div>

      {/* Post Type Selection */}
      <div className="flex space-x-2 mb-6">
        <Button
          type="button"
          onClick={() => setPostType("post")}
          className={`flex-1 py-3 rounded-xl font-medium ${
            postType === "post"
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Post
        </Button>
        <Button
          type="button"
          onClick={() => setPostType("story")}
          className={`flex-1 py-3 rounded-xl font-medium ${
            postType === "story"
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Story
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Input */}
        <Textarea
          placeholder={
            postType === "story"
              ? "Share what's happening right now..."
              : "Share what's happening..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-32 bg-gray-50 dark:bg-gray-800 border-0 resize-none focus:ring-2 focus:ring-primary text-base"
          maxLength={postType === "story" ? 200 : 2000}
        />

        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
          {content.length}/{postType === "story" ? 200 : 2000}
        </div>

        {/* Media Upload Area */}
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-6 text-center">
            <ImageIcon className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-600 dark:text-gray-400">
              Drag photos here or{" "}
              <Button variant="link" className="p-0 h-auto text-primary font-medium">
                browse
              </Button>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Support for images and videos
            </p>
          </CardContent>
        </Card>

        {/* Post Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Add location</span>
            <Button variant="ghost" size="sm" className="text-primary">
              <MapPin size={16} />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tag people</span>
            <Button variant="ghost" size="sm" className="text-primary">
              <UserRound size={16} />
            </Button>
          </div>
        </div>

        {/* Publish Button */}
        <Button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
          disabled={createPostMutation.isPending || !content.trim()}
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            `Publish ${postType === "story" ? "Story" : "Post"}`
          )}
        </Button>
      </form>

      {postType === "story" && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            📱 Stories disappear after 24 hours and are perfect for sharing moments!
          </p>
        </div>
      )}
    </div>
  );
}
