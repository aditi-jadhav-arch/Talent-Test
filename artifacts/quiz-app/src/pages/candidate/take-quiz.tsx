import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useListQuizzes,
  useStartAttempt,
  useSubmitAttempt,
  useGetAttempt,
  useListQuestions,
  getGetAttemptQueryKey,
  getListQuestionsQueryKey,
  getListAttemptsQueryKey,
  getListQuizzesQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, PlayCircle, ChevronRight, CheckCircle2, XCircle, Award } from "lucide-react";
import { Link } from "wouter";

type Step = "select" | "quiz" | "result";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CandidateTakeQuiz() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("select");
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: quizzes, isLoading: quizzesLoading } = useListQuizzes(
    { status: "active" },
    { query: { queryKey: getListQuizzesQueryKey({ status: "active" }) } }
  );

  const { data: questions, isLoading: questionsLoading } = useListQuestions(
    selectedQuizId ?? 0,
    {
      query: {
        enabled: !!selectedQuizId && step === "quiz",
        queryKey: getListQuestionsQueryKey(selectedQuizId ?? 0),
      },
    }
  );

  const { data: attempt } = useGetAttempt(attemptId ?? 0, {
    query: {
      enabled: !!attemptId && step === "result",
      queryKey: getGetAttemptQueryKey(attemptId ?? 0),
    },
  });

  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();

  const handleSubmit = useCallback(async () => {
    if (!attemptId || !questions) return;
    const submissionAnswers = questions.map((q) => ({
      questionId: q.id,
      givenAnswer: answers[q.id] ?? "",
    }));
    await submitAttempt.mutateAsync({ id: attemptId, data: { answers: submissionAnswers } });
    queryClient.invalidateQueries({ queryKey: getGetAttemptQueryKey(attemptId) });
    queryClient.invalidateQueries({ queryKey: getListAttemptsQueryKey({ candidateId: user?.id }) });
    setStep("result");
  }, [attemptId, questions, answers, submitAttempt, queryClient, user?.id]);

  useEffect(() => {
    if (step !== "quiz" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft, handleSubmit]);

  const handleBeginQuiz = async (quizId: number) => {
    if (!user?.id) return;
    setSelectedQuizId(quizId);
    const result = await startAttempt.mutateAsync({ data: { quizId, candidateId: user.id } });
    setAttemptId(result.id);
    const quiz = quizzes?.find((q) => q.id === quizId);
    if (quiz) setTimeLeft(quiz.durationMinutes * 60);
    setCurrentIdx(0);
    setAnswers({});
    setStep("quiz");
  };

  if (step === "select") {
    const selectedQuiz = quizzes?.find((q) => q.id === selectedQuizId);
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Start an Assessment</h1>
          <p className="text-muted-foreground mt-1">Choose an available quiz to begin.</p>
        </div>

        {quizzesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : !quizzes?.length ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <Award className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No active quizzes available</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later or contact your recruiter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => setSelectedQuizId(quiz.id)}
                className={`bg-card border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedQuizId === quiz.id
                    ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                    : "hover:border-primary/40"
                }`}
                data-testid={`card-quiz-select-${quiz.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{quiz.title}</p>
                      <Badge variant="outline" className="text-xs">{quiz.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{quiz.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Clock className="size-3" />{quiz.durationMinutes} min</span>
                      <span>{quiz.questionCount} questions</span>
                      <span>Passing: {quiz.passingScore}%</span>
                    </div>
                  </div>
                  {selectedQuizId === quiz.id && (
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedQuizId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-amber-800">
              Ready to begin: <strong>{selectedQuiz?.title}</strong>
            </p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>You will have {selectedQuiz?.durationMinutes} minutes once the quiz starts</li>
              <li>The quiz will auto-submit when time runs out</li>
              <li>You cannot pause or restart once started</li>
            </ul>
            <Button
              className="w-full gap-2"
              onClick={() => handleBeginQuiz(selectedQuizId)}
              disabled={startAttempt.isPending}
              data-testid="button-begin-quiz"
            >
              <PlayCircle className="size-4" />
              {startAttempt.isPending ? "Starting..." : "Begin Assessment"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (step === "quiz") {
    if (questionsLoading || !questions?.length) {
      return (
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      );
    }
    const currentQuestion = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const currentAnswer = answers[currentQuestion.id] ?? "";
    const answered = Object.keys(answers).length;

    return (
      <div className="space-y-5 max-w-2xl">
        {/* Header bar */}
        <div className="bg-card border rounded-xl px-5 py-3 flex items-center justify-between sticky top-4 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 font-mono font-bold text-base ${
              timeLeft < 60 ? "text-red-500 animate-pulse" : "text-foreground"
            }`}
          >
            <Clock className="size-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold leading-relaxed">{currentQuestion.text}</h2>
            <Badge variant="secondary" className="shrink-0 text-xs">{currentQuestion.points} pt{currentQuestion.points !== 1 ? "s" : ""}</Badge>
          </div>

          {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
            <RadioGroup value={currentAnswer} onValueChange={(v) => setAnswers((p) => ({ ...p, [currentQuestion.id]: v }))}>
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => setAnswers((p) => ({ ...p, [currentQuestion.id]: opt }))}
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                      currentAnswer === opt
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-muted/50 hover:border-muted-foreground/30"
                    }`}
                    data-testid={`option-${i}`}
                  >
                    <RadioGroupItem value={opt} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="cursor-pointer flex-1">{opt}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === "true_false" && (
            <RadioGroup value={currentAnswer} onValueChange={(v) => setAnswers((p) => ({ ...p, [currentQuestion.id]: v }))}>
              <div className="grid grid-cols-2 gap-3">
                {["True", "False"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => setAnswers((p) => ({ ...p, [currentQuestion.id]: opt }))}
                    className={`flex items-center justify-center gap-3 border rounded-lg px-4 py-5 cursor-pointer transition-all ${
                      currentAnswer === opt ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                    }`}
                    data-testid={`option-${opt.toLowerCase()}`}
                  >
                    <RadioGroupItem value={opt} id={`tf-${opt}`} />
                    <Label htmlFor={`tf-${opt}`} className="cursor-pointer text-base font-medium">{opt}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === "short_answer" && (
            <Input
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setAnswers((p) => ({ ...p, [currentQuestion.id]: e.target.value }))}
              className="h-12 text-base"
              data-testid="input-short-answer"
            />
          )}
        </div>

        {/* Nav controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx((i) => i - 1)}
            disabled={currentIdx === 0}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">{answered}/{questions.length} answered</span>
          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={submitAttempt.isPending}
              className="gap-1.5"
              data-testid="button-submit-quiz"
            >
              {submitAttempt.isPending ? "Submitting..." : "Submit"}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={() => setCurrentIdx((i) => i + 1)} className="gap-1.5" data-testid="button-next-question">
              Next <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (step === "result" && attempt) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-8">
        <div className={`bg-card border-2 rounded-2xl p-8 text-center space-y-4 ${attempt.passed ? "border-emerald-400" : "border-destructive/50"}`}>
          {attempt.passed ? (
            <CheckCircle2 className="size-16 text-emerald-500 mx-auto" />
          ) : (
            <XCircle className="size-16 text-destructive mx-auto" />
          )}
          <div>
            <p className="text-5xl font-black tabular-nums">{attempt.score}%</p>
            <p className={`text-xl font-bold mt-1 uppercase tracking-widest ${attempt.passed ? "text-emerald-600" : "text-destructive"}`}>
              {attempt.passed ? "Passed" : "Not Passed"}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Your results have been recorded and shared with the recruitment team.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/candidate/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">Back to Dashboard</Button>
          </Link>
          <Link href="/candidate/attempts" className="flex-1">
            <Button className="w-full">View All Results</Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
