import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string;
    user?: {
      id: number;
      username: string;
      displayName?: string;
      avatar?: string;
      isVerified: boolean;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/like`);
      return res.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      // Invalidate posts to refresh like counts
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <Card className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 rounded-none shadow-none">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.user?.avatar} />
            <AvatarFallback>
              {post.user?.displayName?.[0] || post.user?.username?.[0] || <User size={20} />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm flex items-center space-x-1">
              <span>{post.user?.displayName || post.user?.username}</span>
              {post.user?.isVerified && (
                <span className="text-primary">✓</span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="aspect-square">
          {post.mediaType?.startsWith("image/") ? (
            <img 
              src={post.mediaUrl} 
              alt="Post content" 
              className="w-full h-full object-cover" 
            />
          ) : post.mediaType?.startsWith("video/") ? (
            <video 
              src={post.mediaUrl} 
              className="w-full h-full object-cover" 
              controls
            />
          ) : null}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
                isLiked ? "text-red-500" : ""
              }`}
              disabled={likeMutation.isPending}
            >
              <Heart className={`text-lg ${isLiked ? "fill-current" : ""}`} size={20} />
              <span className="text-sm font-medium">{post.likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{post.commentsCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-green-500 transition-colors"
            >
              <Share size={20} />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`hover:text-yellow-500 transition-colors ${
              isBookmarked ? "text-yellow-500" : ""
            }`}
          >
            <Bookmark className={`${isBookmarked ? "fill-current" : ""}`} size={20} />
          </Button>
        </div>

        {/* Comments Preview */}
        {post.commentsCount > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 dark:text-gray-400 p-0 h-auto"
            >
              View all {post.commentsCount} comments
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
