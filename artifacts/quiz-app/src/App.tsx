import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import QuizList from "@/pages/quizzes/index";
import CreateQuiz from "@/pages/quizzes/new";
import QuizDetail from "@/pages/quizzes/[id]";
import QuizAnalytics from "@/pages/quizzes/analytics";
import CandidateList from "@/pages/candidates/index";
import CandidateDetail from "@/pages/candidates/[id]";
import AttemptList from "@/pages/attempts/index";
import AttemptDetail from "@/pages/attempts/[id]";
import TakeQuiz from "@/pages/take-quiz";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/quizzes" component={QuizList} />
        <Route path="/quizzes/new" component={CreateQuiz} />
        <Route path="/quizzes/:id" component={QuizDetail} />
        <Route path="/quizzes/:id/analytics" component={QuizAnalytics} />
        <Route path="/candidates" component={CandidateList} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/attempts" component={AttemptList} />
        <Route path="/attempts/:id" component={AttemptDetail} />
        <Route path="/take-quiz" component={TakeQuiz} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
