import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

export default function StoriesBar() {
  const { data: stories = [] } = useQuery({
    queryKey: ["/api/stories"],
  });

  return (
    <section className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {/* Your Story */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Plus className="text-gray-500 dark:text-gray-400" size={20} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Plus className="text-white" size={12} />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Your Story</p>
        </div>
        
        {/* Stories from users you follow */}
        {stories.length === 0 ? (
          // Mock stories for UI demonstration
          <>
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 animate-pulse">
                  <Avatar className="w-full h-full">
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Sarah</p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500">
                  <Avatar className="w-full h-full">
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Mike</p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-green-500 via-blue-500 to-purple-500">
                  <Avatar className="w-full h-full">
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Emma</p>
            </div>
          </>
        ) : (
          stories.map((story: any) => (
            <div key={story.id} className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={story.user?.avatar} />
                    <AvatarFallback>
                      {story.user?.displayName?.[0] || story.user?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center truncate max-w-[64px]">
                {story.user?.displayName || story.user?.username}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
