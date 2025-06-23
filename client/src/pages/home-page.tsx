import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import BottomNavigation from "@/components/bottom-navigation";
import StoriesBar from "@/components/stories-bar";
import PostCard from "@/components/post-card";
import ChatInterface from "@/components/chat-interface";
import CreatePost from "@/components/create-post";
import SearchPage from "@/components/search-page";
import ProfilePage from "@/components/profile-page";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, Moon, Sun, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isDark, setIsDark] = useState(false);

  const { data: posts = [] } = useQuery({
    queryKey: ["/api/posts/feed"],
    enabled: activeTab === "home",
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-0">
            <StoriesBar />
            <div className="space-y-0">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No posts yet. Follow some users or create your first post!</p>
                </div>
              ) : (
                posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
        );
      case "search":
        return <SearchPage />;
      case "create":
        return <CreatePost onPostCreated={() => setActiveTab("home")} />;
      case "messages":
        return <ChatInterface />;
      case "profile":
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-dark-surface min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <MessageCircle className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AfuChat</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          size="lg"
          className="w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          onClick={() => setActiveTab("create")}
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
