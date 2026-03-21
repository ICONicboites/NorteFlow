import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { useBusinesses } from "../hooks/supabaseHooks";
import { createBusiness } from "../services/dbService";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Spinner } from "../components/ui/Spinner";
import { formatDate } from "../lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";

const schema = z.object({
  name: z.string().min(2, "Business name is required."),
  category: z.string().min(2, "Business category is required."),
});

type FormValues = z.infer<typeof schema>;

export function BusinessesPage() {
  const { user } = useAuth();
  const { businesses, loading, error, refetch } = useBusinesses(user?.id ?? null);

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!user) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await createBusiness({
        userId: user.id,
        name: values.name,
        category: values.category,
      });
      await refetch();
      form.reset();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create business.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a business</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Water" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. Services" {...form.register("category")} />
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="md:col-span-2 flex gap-3 items-center">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner className="h-4 w-4" /> : "Add business"}
              </Button>
              {submitError && (
                <div className="text-sm text-red-700 rounded-md bg-red-50 border border-red-200 p-3">
                  {submitError}
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your businesses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Spinner />
              Loading...
            </div>
          ) : error ? (
            <div className="text-sm text-red-700 rounded-md bg-red-50 border border-red-200 p-3">{error}</div>
          ) : businesses.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              No businesses yet. Create your first one above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.category}</TableCell>
                    <TableCell>{formatDate(b.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

