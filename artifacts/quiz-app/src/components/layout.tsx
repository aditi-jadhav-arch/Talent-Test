import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileQuestion, 
  Users, 
  ClipboardList,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoIcon } from "@/components/logo";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/quizzes", label: "Quizzes", icon: FileQuestion },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/attempts", label: "Attempts", icon: ClipboardList },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-sidebar text-sidebar-foreground z-20 hidden md:flex flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <LogoIcon size={32} />
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">RecruIQ</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" data-testid="button-user-menu">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.[0] ?? "A"}
                  </div>
                  <span className="text-sm font-medium">{user?.name ?? "Admin"}</span>
                </div>
                <ChevronDown className="size-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive cursor-pointer" onClick={logout} data-testid="menu-item-logout">
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-sidebar z-20 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <LogoIcon size={28} />
          <span className="font-bold text-base tracking-tight text-sidebar-foreground">RecruIQ</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0">
        <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full app-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
