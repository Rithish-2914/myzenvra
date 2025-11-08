import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User as UserIcon, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Profile() {
  const { user, userProfile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-profile-title">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <div className="grid gap-6">
          <Card data-testid="card-profile-info">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {userProfile?.photo_url && <AvatarImage src={userProfile.photo_url} />}
                  <AvatarFallback className="text-2xl">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold" data-testid="text-user-name">
                    {userProfile?.name || user.displayName || 'User'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={isAdmin ? "default" : "secondary"} data-testid="badge-user-role">
                      {isAdmin ? (
                        <><Shield className="w-3 h-3 mr-1" /> Admin</>
                      ) : (
                        <><UserIcon className="w-3 h-3 mr-1" /> Customer</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span data-testid="text-user-email">{user.email}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => setLocation('/admin')} 
                    className="w-full sm:w-auto"
                    data-testid="button-admin-dashboard"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Go to Admin Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to other sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation('/my-orders')}
                data-testid="button-my-orders"
              >
                View My Orders
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation('/wishlist')}
                data-testid="button-wishlist"
              >
                View Wishlist
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation('/shop')}
                data-testid="button-shop"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
