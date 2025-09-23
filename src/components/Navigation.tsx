import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Trophy, Users, TrendingUp } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: TrendingUp },
    { path: "/generator", label: "Gerador 5v5", icon: Users },
  ];

  return (
    <nav className="bg-gradient-card border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              LoL Team Manager
            </h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;