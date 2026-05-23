import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  useListQuizzes, 
  useCreateCandidate, 
  useStartAttempt, 
  useSubmitAttempt, 
  useGetAttempt,
  useListCandidates,
  getGetAttemptQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, PlayCircle } from "lucide-react";

export default function TakeQuiz() {
  const [step, setStep] = useState<"setup" | "quiz" | "result">("setup");
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  // Setup state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Quiz state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { data: quizzes } = useListQuizzes({ status: 'active' });
  const { data: candidates } = useListCandidates();
  
  const createCandidate = useCreateCandidate();
  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();
  const queryClient = useQueryClient();

  const { data: activeAttempt } = useGetAttempt(attemptId || 0, {
    query: { enabled: !!attemptId && step === "quiz" || step === "result" }
  });

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;

    try {
      let finalCandidateId = candidateId;

      if (!finalCandidateId) {
        if (!name || !email) return;
        const newCand = await createCandidate.mutateAsync({ data: { name, email } });
        finalCandidateId = newCand.id;
      }

      const attempt = await startAttempt.mutateAsync({
        data: { quizId, candidateId: finalCandidateId }
      });

      setAttemptId(attempt.id);
      setStep("quiz");
      
      // Find duration
      const quiz = quizzes?.find(q => q.id === quizId);
      if (quiz) {
        setTimeLeft(quiz.durationMinutes * 60);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start quiz.");
    }
  };

  useEffect(() => {
    if (step === "quiz" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const handleSubmit = async () => {
    if (!attemptId || !activeAttempt) return;
    
    try {
      const submissionAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: Number(qId),
        givenAnswer: ans
      }));

      await submitAttempt.mutateAsync({
        id: attemptId,
        data: { answers: submissionAnswers }
      });

      queryClient.invalidateQueries({ queryKey: getGetAttemptQueryKey(attemptId) });
      setStep("result");
    } catch (err) {
      console.error(err);
      alert("Failed to submit.");
    }
  };

  const handleAnswer = (val: string) => {
    if (!activeAttempt || !activeAttempt.quiz) return;
    const qId = (activeAttempt as any).quiz.questions?.[currentQuestionIdx]?.id;
    if (qId) {
      setAnswers(prev => ({ ...prev, [qId]: val }));
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (step === "setup") {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <Card className="border-primary">
          <CardHeader className="text-center pb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <PlayCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-3xl">Candidate Portal</CardTitle>
            <CardDescription>Enter your details and select the assigned assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Select Quiz</h3>
                <div className="space-y-2">
                  <Select onValueChange={(val: any) => setQuizId(Number(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assigned quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes?.map(q => (
                        <SelectItem key={q.id} value={q.id.toString()}>{q.title} ({q.durationMinutes} mins)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Your Details</h3>
                <div className="space-y-2">
                  <Label>Existing Candidate?</Label>
                  <Select onValueChange={(val: any) => setCandidateId(Number(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your profile (if exists)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">-- I am a new candidate --</SelectItem>
                      {candidates?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!candidateId && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full text-lg h-12" disabled={!quizId || (!candidateId && (!name || !email)) || startAttempt.isPending}>
                {startAttempt.isPending ? "Starting..." : "Begin Assessment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "quiz" && activeAttempt) {
    const questions = (activeAttempt as any).quiz.questions || [];
    const currentQuestion = questions[currentQuestionIdx];
    const isLast = currentQuestionIdx === questions.length - 1;

    if (!currentQuestion) return <div className="text-center p-8">Loading questions...</div>;

    const currentAnswer = answers[currentQuestion.id] || "";

    return (
      <div className="max-w-3xl mx-auto space-y-6 mt-8">
        <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm sticky top-4 z-10">
          <div className="font-semibold text-lg">{activeAttempt.quiz.title}</div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Question {currentQuestionIdx + 1} of {questions.length}</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded font-medium">{currentQuestion.points} points</span>
            </div>
            <CardTitle className="text-2xl leading-relaxed">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-3">
                {currentQuestion.options.map((opt: string, i: number) => (
                  <div key={i} className={`flex items-center space-x-3 border p-4 rounded-lg transition-colors cursor-pointer ${currentAnswer === opt ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted/50'}`} onClick={() => handleAnswer(opt)}>
                    <RadioGroupItem value={opt} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-base">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'true_false' && (
              <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="grid grid-cols-2 gap-4">
                {["True", "False"].map((opt) => (
                  <div key={opt} className={`flex items-center space-x-3 border p-6 rounded-lg transition-colors justify-center cursor-pointer ${currentAnswer === opt ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted/50'}`} onClick={() => handleAnswer(opt)}>
                    <RadioGroupItem value={opt} id={`tf-${opt}`} />
                    <Label htmlFor={`tf-${opt}`} className="cursor-pointer text-lg font-medium">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'short_answer' && (
              <Input 
                className="text-lg p-6 h-auto" 
                placeholder="Type your answer here..." 
                value={currentAnswer} 
                onChange={(e) => handleAnswer(e.target.value)}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              disabled={currentQuestionIdx === 0}
            >
              Previous
            </Button>
            
            {isLast ? (
              <Button onClick={handleSubmit} disabled={submitAttempt.isPending} className="px-8 font-bold">
                {submitAttempt.isPending ? "Submitting..." : "Submit Assessment"}
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestionIdx(prev => prev + 1)}>
                Next Question
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === "result" && activeAttempt) {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <Card className={`border-2 ${activeAttempt.passed ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl">Assessment Complete</CardTitle>
            <CardDescription>Your results have been recorded.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="mb-6 flex justify-center">
              {activeAttempt.passed ? (
                <CheckCircle2 className="w-24 h-24 text-green-500" />
              ) : (
                <XCircle className="w-24 h-24 text-red-500" />
              )}
            </div>
            <div className="text-6xl font-black mb-2">{activeAttempt.score}%</div>
            <div className={`text-2xl font-bold uppercase tracking-widest ${activeAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
              {activeAttempt.passed ? 'Passed' : 'Failed'}
            </div>
            <p className="text-muted-foreground mt-6 text-sm">
              Thank you, {activeAttempt.candidateName}. You can now close this window.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center bg-muted/30 p-4 border-t">
            <Button variant="outline" asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}
