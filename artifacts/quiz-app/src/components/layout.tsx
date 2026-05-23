import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileQuestion, 
  Users, 
  ClipboardList, 
  PlayCircle 
} from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/quizzes", label: "Quizzes", icon: FileQuestion },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/attempts", label: "Attempts", icon: ClipboardList },
    { href: "/take-quiz", label: "Take Quiz", icon: PlayCircle },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-sidebar text-sidebar-foreground z-20 hidden md:flex flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="size-8 rounded bg-primary text-primary-foreground flex items-center justify-center">
              R
            </div>
            RecruIQ
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground">
          <div className="size-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm">
            R
          </div>
          RecruIQ
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0">
        <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
