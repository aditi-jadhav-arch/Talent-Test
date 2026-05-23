import { useParams, Link } from "wouter";
import { useGetQuizPerformance, getGetQuizPerformanceQueryKey, useGetQuiz, getGetQuizQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Target, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";

export default function QuizAnalytics() {
  const params = useParams();
  const quizId = Number(params.id);

  const { data: quiz } = useGetQuiz(quizId, { query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) } });
  const { data: analytics, isLoading } = useGetQuizPerformance(quizId, {
    query: { enabled: !!quizId, queryKey: getGetQuizPerformanceQueryKey(quizId) }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-8 text-center text-muted-foreground">No analytics found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/quizzes"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics: {analytics.quizTitle}</h1>
          <p className="text-muted-foreground">Performance metrics for this assessment.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">{analytics.completedAttempts} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.passRate)}%</div>
            <p className="text-xs text-muted-foreground">Of completed attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageScore)}%</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Score Range</CardTitle>
            <div className="flex gap-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowestScore}% - {analytics.highestScore}%</div>
            <p className="text-xs text-muted-foreground">Min to Max spread</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>A summary of performance across candidates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded border-dashed text-muted-foreground">
            More detailed chart visualization could be implemented here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
