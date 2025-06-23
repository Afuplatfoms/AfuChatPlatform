import { Button } from "@/components/ui/button";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "create", icon: Plus, label: "Create", special: true },
    { id: "messages", icon: MessageCircle, label: "Messages", badge: 2 },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ id, icon: Icon, label, special, badge }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-3 relative ${
              activeTab === id
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {special ? (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mb-1">
                <Icon className="text-white" size={16} />
              </div>
            ) : (
              <Icon className="mb-1" size={20} />
            )}
            <span className="text-xs font-medium">{label}</span>
            
            {badge && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {badge}
              </div>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}
