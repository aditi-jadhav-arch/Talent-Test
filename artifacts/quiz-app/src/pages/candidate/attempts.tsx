import { useAuth } from "@/contexts/AuthContext";
import { useListAttempts, getListAttemptsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardX, CheckCircle2, XCircle, Timer } from "lucide-react";

function StatusBadge({ status, passed }: { status: string; passed?: boolean | null }) {
  if (status === "in_progress") return <Badge variant="secondary" className="gap-1"><Timer className="size-3" />In Progress</Badge>;
  if (status === "completed") {
    return passed ? (
      <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/10"><CheckCircle2 className="size-3" />Pass</Badge>
    ) : (
      <Badge variant="destructive" className="gap-1"><XCircle className="size-3" />Fail</Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

export default function CandidateAttempts() {
  const { user } = useAuth();
  const candidateId = user?.id ?? 0;

  const { data: attempts, isLoading } = useListAttempts(
    { candidateId },
    { query: { enabled: !!candidateId, queryKey: getListAttemptsQueryKey({ candidateId }) } }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attempts</h1>
        <p className="text-muted-foreground mt-1">All your quiz submissions and results.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : !attempts?.length ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <ClipboardX className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No attempts yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start your first assessment to see results here.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl divide-y">
          {attempts.map((attempt) => (
            <Link key={attempt.id} href={`/candidate/attempts/${attempt.id}`}>
              <div
                className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer"
                data-testid={`row-attempt-${attempt.id}`}
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{attempt.quizTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(attempt.startedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {attempt.score !== null && (
                    <span className="text-sm font-semibold tabular-nums">{attempt.score}%</span>
                  )}
                  <StatusBadge status={attempt.status} passed={attempt.passed} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
