import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Spinner } from "../components/ui/Spinner";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate("/dashboard", { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glassy-card border-glass shadow-glass-glow px-6 py-8 relative overflow-hidden">
          {/* Gradient border overlay */}
          <div className="absolute -inset-1 rounded-2xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-blue-500/30 via-fuchsia-500/20 to-emerald-400/30 blur-[2px]" />
          <CardHeader className="relative z-10 text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-fuchsia-500 to-emerald-400 bg-clip-text text-transparent drop-shadow">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/30 p-3 text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}

              <Button
                className="w-full glassy-btn border-glass shadow-glass-glow text-slate-800 dark:text-white hover:bg-accent-blue/10 hover:text-accent-blue dark:hover:text-accent-blue focus-visible:ring-accent-blue font-semibold"
                type="submit"
                disabled={submitting}
              >
                {submitting ? <Spinner className="h-4 w-4" /> : "Login"}
              </Button>
            </form>

            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 items-center">
              <span>
                Don&apos;t have an account?{" "}
                <Link
                  className="text-slate-900 dark:text-slate-50 font-semibold underline"
                  to="/signup"
                >
                  Sign up
                </Link>
              </span>
              <Link
                className="text-slate-900 dark:text-slate-50 font-semibold underline"
                to="/reset-password"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
