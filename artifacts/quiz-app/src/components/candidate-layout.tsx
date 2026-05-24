import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlayCircle, ClipboardList, LogOut, Mail, Phone, Building2, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCandidate, useListAttempts, getListAttemptsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoIcon } from "@/components/logo";

function ProfileSidebar() {
  const { user, logout } = useAuth();
  const candidateId = user?.id ?? 0;

  const { data: candidate, isLoading: candidateLoading } = useGetCandidate(candidateId, {
    query: { enabled: !!candidateId, queryKey: ["candidate", candidateId] as const },
  });

  const { data: attempts } = useListAttempts(
    { candidateId },
    { query: { enabled: !!candidateId, queryKey: getListAttemptsQueryKey({ candidateId }) } }
  );

  const completed = attempts?.filter((a) => a.status === "completed") ?? [];
  const passed = completed.filter((a) => a.passed === true);
  const passRate = completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : null;

  return (
    <aside className="fixed inset-y-0 right-0 w-72 border-l bg-card flex flex-col z-20 hidden lg:flex" style={{ boxShadow: "-4px 0 24px rgba(13,114,214,.06)" }}>
      <div className="flex h-16 items-center border-b px-5" style={{ background: "linear-gradient(135deg, #0a3d7a 0%, #0d72d6 100%)" }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <LogoIcon size={30} />
          <span className="font-bold text-base tracking-tight text-white">RecruIQ</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Candidate Profile
          </p>

          {candidateLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          ) : candidate ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: "linear-gradient(135deg, #0d72d6, #3b9eff)" }}>
                  {candidate.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight" data-testid="text-candidate-name">{candidate.name}</p>
                  {candidate.department && (
                    <p className="text-xs text-muted-foreground">{candidate.department}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate text-xs" data-testid="text-candidate-email">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" />
                    <span className="text-xs" data-testid="text-candidate-phone">{candidate.phone}</span>
                  </div>
                )}
                {candidate.department && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="size-3.5 shrink-0" />
                    <span className="text-xs">{candidate.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0" />
                  <span className="text-xs">
                    Registered{" "}
                    {new Date(candidate.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Assessment Stats
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: "linear-gradient(135deg, #e8f3fd, #dbeafe)", border: "1.5px solid rgba(13,114,214,.15)" }}>
              <p className="text-2xl font-bold" style={{ color: "#0d72d6" }}>{completed.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "linear-gradient(135deg, #e8f3fd, #dbeafe)", border: "1.5px solid rgba(13,114,214,.15)" }}>
              <p className="text-2xl font-bold" style={{ color: "#0d72d6" }}>
                {passRate !== null ? `${passRate}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Pass Rate</p>
            </div>
          </div>

          {completed.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {completed.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-xs py-1 border-b border-dashed last:border-0">
                  <span className="text-muted-foreground truncate max-w-[130px]">{a.quizTitle}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-medium">{a.score}%</span>
                    <Badge
                      variant={a.passed ? "default" : "destructive"}
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {a.passed ? "Pass" : "Fail"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

export function CandidateLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/candidate/dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/candidate/take-quiz", label: "Take a Quiz", icon: PlayCircle },
    { href: "/candidate/attempts", label: "My Attempts", icon: ClipboardList },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full bg-muted/30">
      {/* Left nav */}
      <aside className="fixed inset-y-0 left-0 w-56 border-r bg-sidebar text-sidebar-foreground z-20 hidden md:flex flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <LogoIcon size={28} />
            <span className="font-bold text-sm tracking-tight text-sidebar-foreground">RecruIQ</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href);
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
      </aside>

      {/* Profile sidebar on the right */}
      <ProfileSidebar />

      {/* Main content: between the two sidebars */}
      <main className="flex-1 md:pl-56 lg:pr-72 pt-0">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto app-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
