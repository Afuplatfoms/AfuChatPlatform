import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, User } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: searchResults = { users: [], posts: [] } } = useQuery({
    queryKey: ["/api/search", filter, query],
    queryFn: async () => {
      if (!query.trim()) return { users: [], posts: [] };
      
      const [usersRes, postsRes] = await Promise.all([
        fetch(`/api/search/users?q=${encodeURIComponent(query)}`),
        fetch(`/api/search/posts?q=${encodeURIComponent(query)}`),
      ]);
      
      const users = await usersRes.json();
      const posts = await postsRes.json();
      
      return { users, posts };
    },
    enabled: !!query.trim(),
  });

  const filters = [
    { id: "all", label: "All" },
    { id: "users", label: "Users" },
    { id: "posts", label: "Posts" },
    { id: "products", label: "Products" },
  ];

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search users, posts, products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-gray-100 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-600 transition-all"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      </div>

      {/* Quick Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {filters.map((filterItem) => (
          <Button
            key={filterItem.id}
            variant={filter === filterItem.id ? "default" : "secondary"}
            size="sm"
            onClick={() => setFilter(filterItem.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
              filter === filterItem.id
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {filterItem.label}
          </Button>
        ))}
      </div>

      {/* Search Results */}
      {query.trim() ? (
        <div className="space-y-6">
          {/* Users Results */}
          {(filter === "all" || filter === "users") && searchResults.users.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Users</h3>
              <div className="space-y-3">
                {searchResults.users.map((user: any) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.displayName?.[0] || user.username?.[0] || <User size={20} />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold flex items-center space-x-1">
                            <span>{user.displayName || user.username}</span>
                            {user.isVerified && <span className="text-primary">✓</span>}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-primary text-white">
                        Follow
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {(filter === "all" || filter === "posts") && searchResults.posts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Posts</h3>
              <div className="space-y-3">
                {searchResults.posts.map((post: any) => (
                  <Card key={post.id} className="p-4">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{post.likesCount} likes</span>
                        <span>{post.commentsCount} comments</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm">Try searching for something else</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Trending Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Trending Now</h3>
            <div className="space-y-3">
              {[
                { tag: "#TechStartup", posts: "2.3K posts" },
                { tag: "#Photography", posts: "1.8K posts" },
                { tag: "#Design", posts: "1.2K posts" },
                { tag: "#Cooking", posts: "956 posts" },
              ].map((trend, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{trend.tag}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{trend.posts}</p>
                    </div>
                    <TrendingUp className="text-green-500" size={16} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Suggested for You</h3>
            <div className="space-y-3">
              {[
                { name: "Mike Johnson", username: "mikej_design", role: "UI/UX Designer" },
                { name: "Sarah Chen", username: "sarahc_photo", role: "Photographer" },
                { name: "Alex Rodriguez", username: "alexr_chef", role: "Chef" },
              ].map((suggestion, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {suggestion.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{suggestion.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {suggestion.role}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-primary text-white">
                      Follow
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
