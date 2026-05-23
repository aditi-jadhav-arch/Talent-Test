import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetQuiz, 
  useListQuestions, 
  useCreateQuestion,
  useDeleteQuestion,
  getGetQuizQueryKey,
  getListQuestionsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, ArrowLeft } from "lucide-react";

export default function QuizDetail() {
  const params = useParams();
  const quizId = Number(params.id);
  
  const { data: quiz, isLoading: quizLoading } = useGetQuiz(quizId, { 
    query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) } 
  });
  
  const { data: questions, isLoading: questionsLoading } = useListQuestions(quizId, {
    query: { enabled: !!quizId, queryKey: getListQuestionsQueryKey(quizId) }
  });

  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "multiple_choice" as const,
    points: 1,
    options: ["", "", "", ""],
    correctAnswer: "0"
  });

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        text: newQuestion.text,
        type: newQuestion.type,
        points: Number(newQuestion.points),
        correctAnswer: newQuestion.correctAnswer
      };
      
      if (newQuestion.type === 'multiple_choice') {
        data.options = newQuestion.options.filter(o => o.trim() !== "");
        data.correctAnswer = newQuestion.options[Number(newQuestion.correctAnswer)];
      } else if (newQuestion.type === 'true_false') {
        data.options = ["True", "False"];
        data.correctAnswer = newQuestion.correctAnswer === "0" ? "True" : "False";
      } else {
        data.options = null;
      }

      await createQuestion.mutateAsync({
        quizId,
        data
      });
      
      queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey(quizId) });
      setIsAdding(false);
      setNewQuestion({
        text: "",
        type: "multiple_choice",
        points: 1,
        options: ["", "", "", ""],
        correctAnswer: "0"
      });
      toast({ title: "Question added successfully" });
    } catch (err) {
      toast({ title: "Failed to add question", variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestion.mutateAsync({ quizId, id });
      queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey(quizId) });
      toast({ title: "Question deleted" });
    } catch (err) {
      toast({ title: "Failed to delete question", variant: "destructive" });
    }
  };

  if (quizLoading || questionsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading quiz details...</div>;
  }

  if (!quiz) {
    return <div className="p-8 text-center text-red-500">Quiz not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/quizzes"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.category} • {quiz.durationMinutes} mins • Passing: {quiz.passingScore}%</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-semibold">Questions ({questions?.length || 0})</h2>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea 
                  required 
                  value={newQuestion.text} 
                  onChange={e => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newQuestion.type} 
                    onValueChange={(val: any) => setNewQuestion(prev => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    required 
                    value={newQuestion.points} 
                    onChange={e => setNewQuestion(prev => ({ ...prev, points: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {newQuestion.type === 'multiple_choice' && (
                <div className="space-y-3">
                  <Label>Options</Label>
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correctAnswer" 
                        checked={newQuestion.correctAnswer === i.toString()} 
                        onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: i.toString() }))}
                        title="Mark as correct"
                      />
                      <Input 
                        placeholder={`Option ${i + 1}`} 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...newQuestion.options];
                          newOpts[i] = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: newOpts }));
                        }}
                        required={i < 2}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Select the radio button next to the correct option.</p>
                </div>
              )}

              {newQuestion.type === 'true_false' && (
                <div className="space-y-3">
                  <Label>Correct Answer</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="tfAnswer" 
                        checked={newQuestion.correctAnswer === "0"} 
                        onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: "0" }))}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="tfAnswer" 
                        checked={newQuestion.correctAnswer === "1"} 
                        onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: "1" }))}
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              {newQuestion.type === 'short_answer' && (
                <div className="space-y-2">
                  <Label>Correct Answer (Exact Match)</Label>
                  <Input 
                    required 
                    value={newQuestion.correctAnswer} 
                    onChange={e => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={createQuestion.isPending}>Save Question</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions?.length === 0 && !isAdding && (
          <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
            No questions yet. Click 'Add Question' to start building this quiz.
          </div>
        )}
        {questions?.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader className="py-4 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Q{idx + 1}.</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">{q.type.replace('_', ' ')}</span>
                  <span className="text-xs text-muted-foreground">{q.points} pts</span>
                </div>
                <CardTitle className="text-base font-normal leading-relaxed">{q.text}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 -mt-2 -mr-2" onClick={() => handleDeleteQuestion(q.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            {q.type === 'multiple_choice' && q.options && (
              <CardContent className="py-0 pb-4">
                <ul className="space-y-1 mt-2">
                  {q.options.map((opt, i) => (
                    <li key={i} className={`px-3 py-2 rounded text-sm ${opt === q.correctAnswer ? 'bg-green-50 text-green-900 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800' : 'bg-muted/50'}`}>
                      {opt} {opt === q.correctAnswer && <span className="ml-2 font-semibold text-xs">(Correct)</span>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
            {q.type === 'true_false' && (
              <CardContent className="py-0 pb-4">
                <p className="text-sm">Correct Answer: <span className="font-semibold">{q.correctAnswer}</span></p>
              </CardContent>
            )}
            {q.type === 'short_answer' && (
              <CardContent className="py-0 pb-4">
                <p className="text-sm text-muted-foreground">Correct Answer: <span className="text-foreground font-medium">{q.correctAnswer}</span></p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
