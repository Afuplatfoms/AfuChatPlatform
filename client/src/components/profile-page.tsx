import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings, 
  Share, 
  Camera, 
  Wallet, 
  Crown, 
  BarChart3, 
  Store, 
  ChevronRight,
  Plus,
  Send,
  CreditCard
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userPosts = [] } = useQuery({
    queryKey: ["/api/posts/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: walletTransactions = [] } = useQuery({
    queryKey: ["/api/wallet/transactions"],
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest("POST", "/api/wallet/deposit", { amount });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Money added to your wallet",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
  });

  const handleAddMoney = () => {
    // In a real app, this would open a payment modal
    depositMutation.mutate("25.00");
  };

  const handleSendMoney = () => {
    toast({
      title: "Send Money",
      description: "Money transfer feature coming soon!",
    });
  };

  const handleManagePremium = () => {
    toast({
      title: "Premium",
      description: "Premium management coming soon!",
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="relative -mt-16 mb-4">
            <div className="w-24 h-24 bg-white dark:bg-dark-surface p-1 rounded-full">
              <Avatar className="w-full h-full">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">
                  {user.displayName?.[0] || user.username?.[0] || <User size={32} />}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              size="sm"
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full p-0"
            >
              <Camera size={16} />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <h1 className="text-xl font-bold flex items-center space-x-2">
                <span>{user.displayName || user.username}</span>
                {user.isVerified && <Badge variant="secondary" className="text-primary">✓</Badge>}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
            </div>

            <p className="text-sm">
              {user.bio || "✨ Content creator | 📍 Digital nomad | 🎨 Design enthusiast"}
            </p>

            {/* Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="font-bold text-lg">{user.postsCount || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{user.followersCount || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{user.followingCount || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button className="flex-1 bg-primary text-white hover:bg-primary/90">
                Edit Profile
              </Button>
              <Button
                variant="secondary"
                className="px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Share size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Features */}
      <div className="px-4 space-y-4">
        {/* Wallet */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Wallet Balance</p>
                <p className="text-2xl font-bold">
                  ${parseFloat(user.walletBalance || "0").toFixed(2)}
                </p>
              </div>
              <Wallet className="text-2xl opacity-75" size={32} />
            </div>
            <div className="flex space-x-2 mt-3">
              <Button
                onClick={handleAddMoney}
                disabled={depositMutation.isPending}
                className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
              >
                <Plus size={16} className="mr-1" />
                Add Money
              </Button>
              <Button
                onClick={handleSendMoney}
                className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
              >
                <Send size={16} className="mr-1" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Badge */}
        {user.isPremium && (
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold flex items-center">
                    <Crown className="mr-2" size={20} />
                    Premium Member
                  </p>
                  <p className="text-sm opacity-90">
                    Expires: {user.premiumExpiresAt 
                      ? new Date(user.premiumExpiresAt).toLocaleDateString()
                      : "Never"
                    }
                  </p>
                </div>
                <Button
                  onClick={handleManagePremium}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="text-primary" size={20} />
                  <span className="font-medium">Analytics</span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Store className="text-primary" size={20} />
                  <span className="font-medium">My Store</span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="text-primary" size={20} />
                  <span className="font-medium">Wallet History</span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="text-primary" size={20} />
                  <span className="font-medium">Settings</span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        {walletTransactions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {walletTransactions.slice(0, 3).map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium capitalize">{transaction.type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-semibold ${
                      transaction.amount.startsWith('-') ? 'text-red-500' : 'text-green-500'
                    }`}>
                      ${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Posts Grid */}
        {userPosts.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Your Posts</h3>
              <div className="grid grid-cols-3 gap-2">
                {userPosts.slice(0, 9).map((post: any) => (
                  <div
                    key={post.id}
                    className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                  >
                    {post.mediaUrl ? (
                      <img
                        src={post.mediaUrl}
                        alt="Post"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                          {post.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
