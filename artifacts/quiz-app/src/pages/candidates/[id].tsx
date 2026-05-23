import { useParams, Link } from "wouter";
import { useGetCandidate, getGetCandidateQueryKey, useListAttempts, getListAttemptsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, Building, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function CandidateDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: candidate, isLoading: candidateLoading } = useGetCandidate(id, {
    query: { enabled: !!id, queryKey: getGetCandidateQueryKey(id) }
  });

  const { data: attempts, isLoading: attemptsLoading } = useListAttempts({ candidateId: id }, {
    query: { enabled: !!id, queryKey: getListAttemptsQueryKey({ candidateId: id }) }
  });

  if (candidateLoading || attemptsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  if (!candidate) {
    return <div className="p-8 text-center text-red-500">Candidate not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/candidates"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
          <p className="text-muted-foreground">Candidate Profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{candidate.phone}</span>
              </div>
            )}
            {candidate.department && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{candidate.department}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Registered on {format(new Date(candidate.createdAt), "MMMM d, yyyy")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Assessment History</h2>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No attempts found for this candidate.
                  </TableCell>
                </TableRow>
              )}
              {attempts?.map(attempt => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{attempt.quizTitle}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.status === 'completed' ? 'default' : attempt.status === 'in_progress' ? 'secondary' : 'destructive'}>
                      {attempt.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {attempt.status === 'completed' && attempt.score !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{attempt.score}%</span>
                        {attempt.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {attempt.completedAt ? format(new Date(attempt.completedAt), "MMM d, yyyy h:mm a") : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/attempts/${attempt.id}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
