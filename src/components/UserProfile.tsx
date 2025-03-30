
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

interface UserProfileProps {
  onShowHistory: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onShowHistory }) => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        className="text-sm"
        onClick={onShowHistory}
      >
        My Resumes
      </Button>
      
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
          <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <p className="text-sm font-medium">{user.displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
