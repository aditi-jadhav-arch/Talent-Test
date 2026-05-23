import { Link } from "wouter";
import { useGetDashboardStats, useGetRecentAttempts } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Users, ClipboardList, CheckCircle2, Plus, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentAttempts, isLoading: attemptsLoading } = useGetRecentAttempts();

  if (statsLoading || attemptsLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of recruitment assessments.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/candidates"><Users className="w-4 h-4 mr-2" /> Manage Candidates</Link>
          </Button>
          <Button asChild>
            <Link href="/quizzes/new"><Plus className="w-4 h-4 mr-2" /> Create Quiz</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <FileQuestion className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.activeQuizzes || 0} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCandidates || 0}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAttempts || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.completedAttempts || 0} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.passRate ? `${Math.round(stats.passRate)}%` : "0%"}</div>
            <p className="text-xs text-muted-foreground">Across all completed attempts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
            <CardDescription>Latest candidate quiz submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttempts?.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">No recent attempts found.</div>
              )}
              {recentAttempts?.map(attempt => (
                <div key={attempt.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{attempt.candidateName}</p>
                    <p className="text-sm text-muted-foreground">{attempt.quizTitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {attempt.status === 'completed' ? (
                        <>
                          <span className="text-sm font-bold">{attempt.score}%</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${attempt.passed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                            {attempt.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                          {attempt.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {attempt.completedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(attempt.completedAt), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/quizzes/new"><Plus className="w-4 h-4 mr-2" /> Create New Quiz</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/take-quiz"><PlayCircle className="w-4 h-4 mr-2" /> Start Quiz Portal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
