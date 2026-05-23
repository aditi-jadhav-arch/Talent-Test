import { useAuth } from "@/contexts/AuthContext";
import { useListQuizzes, useListAttempts, getListAttemptsQueryKey, getListQuizzesQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { PlayCircle, Clock, Award, ChevronRight, CheckCircle2, XCircle, Timer } from "lucide-react";

function StatusBadge({ status, passed }: { status: string; passed?: boolean | null }) {
  if (status === "in_progress") {
    return <Badge variant="secondary" className="gap-1"><Timer className="size-3" />In Progress</Badge>;
  }
  if (status === "completed") {
    return passed ? (
      <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/10">
        <CheckCircle2 className="size-3" />Pass
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="size-3" />Fail
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const candidateId = user?.id ?? 0;

  const { data: quizzes, isLoading: quizzesLoading } = useListQuizzes(
    { status: "active" },
    { query: { queryKey: getListQuizzesQueryKey({ status: "active" }) } }
  );

  const { data: attempts, isLoading: attemptsLoading } = useListAttempts(
    { candidateId },
    { query: { enabled: !!candidateId, queryKey: getListAttemptsQueryKey({ candidateId }) } }
  );

  const completedAttempts = attempts?.filter((a) => a.status === "completed") ?? [];
  const takenQuizIds = new Set(attempts?.map((a) => a.quizId) ?? []);
  const availableQuizzes = quizzes?.filter((q) => !takenQuizIds.has(q.id)) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">Here are your available assessments and results.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Taken</p>
          <p className="text-3xl font-bold mt-1">{completedAttempts.length}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Passed</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">
            {completedAttempts.filter((a) => a.passed).length}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Available</p>
          <p className="text-3xl font-bold mt-1 text-primary">{availableQuizzes.length}</p>
        </div>
      </div>

      {/* Available quizzes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Available Assessments</h2>
          <Link href="/candidate/take-quiz">
            <Button size="sm" className="gap-1.5">
              <PlayCircle className="size-4" />
              Start a Quiz
            </Button>
          </Link>
        </div>

        {quizzesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : availableQuizzes.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center">
            <Award className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">You have completed all available assessments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-card border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors"
                data-testid={`card-quiz-${quiz.id}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{quiz.title}</p>
                    <Badge variant="outline" className="text-xs">{quiz.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="size-3" />{quiz.durationMinutes} min</span>
                    <span>{quiz.questionCount} questions</span>
                    <span>Pass: {quiz.passingScore}%</span>
                  </div>
                </div>
                <Link href="/candidate/take-quiz">
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                    Begin <ChevronRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent attempt history */}
      {completedAttempts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Results</h2>
            <Link href="/candidate/attempts">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          </div>
          <div className="bg-card border rounded-xl divide-y">
            {completedAttempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between px-4 py-3"
                data-testid={`row-attempt-${attempt.id}`}
              >
                <div>
                  <p className="font-medium text-sm">{attempt.quizTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {attempt.score !== null && (
                    <span className="text-sm font-semibold">{attempt.score}%</span>
                  )}
                  <StatusBadge status={attempt.status} passed={attempt.passed} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {attemptsLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      )}
    </div>
  );
}
