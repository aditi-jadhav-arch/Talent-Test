import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { CandidateLayout } from "@/components/candidate-layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import LandingPage from "@/pages/landing";

import Dashboard from "@/pages/dashboard";
import QuizList from "@/pages/quizzes/index";
import CreateQuiz from "@/pages/quizzes/new";
import QuizDetail from "@/pages/quizzes/[id]";
import QuizAnalytics from "@/pages/quizzes/analytics";
import CandidateList from "@/pages/candidates/index";
import CandidateDetail from "@/pages/candidates/[id]";
import AttemptList from "@/pages/attempts/index";
import AttemptDetail from "@/pages/attempts/[id]";

import CandidateDashboard from "@/pages/candidate/dashboard";
import CandidateAttempts from "@/pages/candidate/attempts";
import CandidateTakeQuiz from "@/pages/candidate/take-quiz";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

function AdminRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/quizzes" component={QuizList} />
        <Route path="/quizzes/new" component={CreateQuiz} />
        <Route path="/quizzes/:id/analytics" component={QuizAnalytics} />
        <Route path="/quizzes/:id" component={QuizDetail} />
        <Route path="/candidates" component={CandidateList} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/attempts" component={AttemptList} />
        <Route path="/attempts/:id" component={AttemptDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function CandidateRoutes() {
  return (
    <CandidateLayout>
      <Switch>
        <Route path="/candidate/dashboard" component={CandidateDashboard} />
        <Route path="/candidate/take-quiz" component={CandidateTakeQuiz} />
        <Route path="/candidate/attempts" component={CandidateAttempts} />
        <Route path="/candidate/attempts/:id" component={AttemptDetail} />
        <Route path="/" component={() => <Redirect to="/candidate/dashboard" />} />
        <Route component={NotFound} />
      </Switch>
    </CandidateLayout>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="space-y-3 text-center">
          <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto">
            R
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (location === "/login") {
    if (user?.role === "admin") return <Redirect to="/" />;
    if (user?.role === "candidate") return <Redirect to="/candidate/dashboard" />;
    return <LoginPage />;
  }

  if (!user) {
    if (location === "/") return <LandingPage />;
    return <Redirect to="/login" />;
  }

  if (user.role === "admin") {
    return <AdminRoutes />;
  }

  if (user.role === "candidate") {
    if (!location.startsWith("/candidate")) {
      return <Redirect to="/candidate/dashboard" />;
    }
    return <CandidateRoutes />;
  }

  return <Redirect to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
