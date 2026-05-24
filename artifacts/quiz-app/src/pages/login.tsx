import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { LogoIcon } from "@/components/logo";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin, useCandidateLogin, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, UserCircle, LogIn } from "lucide-react";

const adminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const candidateSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type AdminForm = z.infer<typeof adminSchema>;
type CandidateForm = z.infer<typeof candidateSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"admin" | "candidate">("admin");

  useEffect(() => {
    const tab = new URLSearchParams(search).get("tab");
    if (tab === "candidate") setActiveTab("candidate");
    else setActiveTab("admin");
  }, [search]);

  const adminLogin = useAdminLogin();
  const candidateLogin = useCandidateLogin();

  const adminForm = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: { username: "", password: "" },
  });

  const candidateForm = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { email: "" },
  });

  const onAdminSubmit = (values: AdminForm) => {
    adminLogin.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
          setLocation("/");
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid username or password.", variant: "destructive" });
        },
      }
    );
  };

  const onCandidateSubmit = (values: CandidateForm) => {
    candidateLogin.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
          setLocation("/candidate/dashboard");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            "No candidate found with that email.";
          toast({ title: "Access denied", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center app-fade-in"
      style={{ background: "linear-gradient(135deg, #0a3d7a 0%, #0d72d6 55%, #3b9eff 100%)" }}
    >
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <LogoIcon size={52} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">RecruIQ</h1>
          <p className="mt-2 text-white/70 text-sm">Recruitment Assessment Platform</p>
        </div>

        <div className="p-6" style={{ background: "white", borderRadius: "16px", boxShadow: "0 12px 48px rgba(0,0,0,.18), 0 2px 12px rgba(0,0,0,.10)" }}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "admin" | "candidate")}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="admin" className="flex-1 gap-2" data-testid="tab-admin">
                <ShieldCheck className="size-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="candidate" className="flex-1 gap-2" data-testid="tab-candidate">
                <UserCircle className="size-4" />
                Candidate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Admin Login</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Access the administration portal</p>
              </div>
              <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="admin" data-testid="input-username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" data-testid="input-admin-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={adminLogin.isPending}
                    data-testid="button-admin-login"
                  >
                    <LogIn className="size-4" />
                    {adminLogin.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="candidate">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Candidate Access</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Enter your email address to access your assessments
                </p>
              </div>
              <Form {...candidateForm}>
                <form onSubmit={candidateForm.handleSubmit(onCandidateSubmit)} className="space-y-4">
                  <FormField
                    control={candidateForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            data-testid="input-candidate-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={candidateLogin.isPending}
                    data-testid="button-candidate-login"
                  >
                    <LogIn className="size-4" />
                    {candidateLogin.isPending ? "Looking up..." : "Access My Assessments"}
                  </Button>
                </form>
              </Form>
              <p className="mt-4 text-xs text-center text-muted-foreground">
                Not registered? Contact your recruiter to be added to the system.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
