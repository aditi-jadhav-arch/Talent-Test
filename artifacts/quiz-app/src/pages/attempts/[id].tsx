import { useParams, Link } from "wouter";
import { useGetAttempt, getGetAttemptQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AttemptDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: detail, isLoading } = useGetAttempt(id, {
    query: { enabled: !!id, queryKey: getGetAttemptQueryKey(id) }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading attempt details...</div>;
  }

  if (!detail) {
    return <div className="p-8 text-center text-red-500">Attempt not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/attempts"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attempt Review</h1>
          <p className="text-muted-foreground">Detailed breakdown of the candidate's answers.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Candidate</div>
              <div className="text-lg font-semibold">{detail.candidate.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Quiz</div>
              <div className="text-lg font-semibold">{detail.quiz.title}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <Badge variant={detail.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                {detail.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Clock className="w-4 h-4" />
              Started: {format(new Date(detail.startedAt), "MMM d, h:mm a")}
              {detail.completedAt && ` • Finished: ${format(new Date(detail.completedAt), "h:mm a")}`}
            </div>
          </CardContent>
        </Card>

        <Card className={detail.passed ? "border-green-500/50" : detail.passed === false ? "border-red-500/50" : ""}>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {detail.status === 'completed' ? (
              <>
                <div className="text-5xl font-black mb-2">{detail.score}%</div>
                <div className={`text-xl font-bold flex items-center gap-2 ${detail.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {detail.passed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  {detail.passed ? 'PASSED' : 'FAILED'}
                </div>
                <p className="text-muted-foreground mt-4">Passing score: {detail.quiz.passingScore}%</p>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Attempt is still in progress.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {detail.answers && detail.answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {detail.answers.map((ans, idx) => (
              <div key={ans.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="font-medium text-lg">Question {idx + 1}</div>
                  <div className="text-sm font-semibold">
                    {ans.pointsAwarded} pts
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-md p-4 mt-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Given Answer:</div>
                  <div className="flex items-center gap-2">
                    {ans.isCorrect === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {ans.isCorrect === false && <XCircle className="w-4 h-4 text-red-500" />}
                    {ans.isCorrect === null && <Clock className="w-4 h-4 text-yellow-500" />}
                    <span className={ans.isCorrect ? "font-semibold" : ""}>{ans.givenAnswer || "(No answer)"}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
