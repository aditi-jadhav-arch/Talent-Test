import { Link } from "wouter";
import { useListQuizzes, useDeleteQuiz, getListQuizzesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function QuizList() {
  const { data: quizzes, isLoading } = useListQuizzes();
  const deleteQuiz = useDeleteQuiz();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      await deleteQuiz.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
      toast({ title: "Quiz deleted successfully" });
    } catch (err) {
      toast({ title: "Failed to delete quiz", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">Manage your recruitment assessments.</p>
        </div>
        <Button asChild>
          <Link href="/quizzes/new"><Plus className="w-4 h-4 mr-2" /> Create Quiz</Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading quizzes...</TableCell>
              </TableRow>
            )}
            {!isLoading && quizzes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No quizzes found.</TableCell>
              </TableRow>
            )}
            {quizzes?.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{quiz.category}</TableCell>
                <TableCell>
                  <Badge variant={quiz.status === 'active' ? 'default' : quiz.status === 'draft' ? 'secondary' : 'outline'}>
                    {quiz.status}
                  </Badge>
                </TableCell>
                <TableCell>{quiz.questionCount}</TableCell>
                <TableCell>{quiz.durationMinutes} min</TableCell>
                <TableCell>{format(new Date(quiz.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" title="Analytics">
                      <Link href={`/quizzes/${quiz.id}/analytics`}><BarChart2 className="w-4 h-4" /></Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" title="Edit">
                      <Link href={`/quizzes/${quiz.id}`}><Edit className="w-4 h-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(quiz.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
