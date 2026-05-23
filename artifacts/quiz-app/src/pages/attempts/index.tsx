import { useListAttempts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AttemptList() {
  const { data: attempts, isLoading } = useListAttempts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attempts Log</h1>
        <p className="text-muted-foreground">All candidate assessment sessions.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading attempts...</TableCell>
              </TableRow>
            )}
            {!isLoading && attempts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No attempts found.</TableCell>
              </TableRow>
            )}
            {attempts?.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell className="font-medium">{attempt.candidateName}</TableCell>
                <TableCell>{attempt.quizTitle}</TableCell>
                <TableCell>
                  <Badge variant={attempt.status === 'completed' ? 'default' : attempt.status === 'in_progress' ? 'secondary' : 'destructive'}>
                    {attempt.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {attempt.status === 'completed' && attempt.score !== null ? (
                    <span className={`font-bold ${attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {attempt.score}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{format(new Date(attempt.startedAt), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/attempts/${attempt.id}`}>Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
