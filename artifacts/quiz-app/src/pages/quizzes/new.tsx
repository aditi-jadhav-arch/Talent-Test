import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateQuiz, getListQuizzesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateQuiz() {
  const [, setLocation] = useLocation();
  const createQuiz = useCreateQuiz();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    durationMinutes: 30,
    passingScore: 70,
    status: "draft" as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quiz = await createQuiz.mutateAsync({
        data: {
          ...formData,
          durationMinutes: Number(formData.durationMinutes),
          passingScore: Number(formData.passingScore)
        }
      });
      queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
      toast({ title: "Quiz created successfully" });
      setLocation(`/quizzes/${quiz.id}`);
    } catch (err) {
      toast({ title: "Failed to create quiz", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Quiz</h1>
        <p className="text-muted-foreground">Define a new skill assessment.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                required 
                value={formData.title} 
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Frontend React Assessment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                required 
                value={formData.description} 
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this quiz covers..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  required 
                  value={formData.category} 
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                <Input 
                  id="durationMinutes" 
                  type="number" 
                  min="5" 
                  required 
                  value={formData.durationMinutes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input 
                  id="passingScore" 
                  type="number" 
                  min="1" 
                  max="100" 
                  required 
                  value={formData.passingScore} 
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setLocation("/quizzes")}>Cancel</Button>
              <Button type="submit" disabled={createQuiz.isPending}>
                {createQuiz.isPending ? "Creating..." : "Create Quiz"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
