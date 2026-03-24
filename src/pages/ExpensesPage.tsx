import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { useBusinesses, useExpenses } from "../hooks/supabaseHooks";
import { createExpense, updateExpense } from "../services/dbService";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Spinner } from "../components/ui/Spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { formatCurrency, formatDate } from "../lib/format";

const schema = z.object({
  date: z.string().min(1),
  businessId: z.string().min(1),
  item: z.string().min(2, "Item is required."),
  category: z.string().min(2, "Category is required."),
  amount: z.number().positive("Amount must be > 0."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ExpensesPage() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const { businesses, loading: bizLoading, error: bizError } = useBusinesses(uid);
  const [businessFilter, setBusinessFilter] = React.useState<string | null>(null);

  const [startDate, setStartDate] = React.useState<string | null>(null);
  const [endDate, setEndDate] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  const { data: expenses, loading: expensesLoading, error: expensesError, refetch: refetchExpenses } = useExpenses({
    userId: uid,
    businessId: businessFilter,
    category: categoryFilter,
    startDate,
    endDate,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: todayInputValue(),
      businessId: "",
      item: "",
      category: "",
      amount: 0,
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!uid) return;
    if (bizLoading) return;
    if (businesses.length === 0) return;

    const current = form.getValues("businessId");
    if (!current) {
      form.setValue("businessId", businesses[0].id, { shouldValidate: true });
    }
    if (!businessFilter) setBusinessFilter(businesses[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, bizLoading, businesses]);

  const expensesTotal = React.useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  async function onSubmit(values: FormValues) {
    if (!uid) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateExpense({
          userId: uid,
          expenseId: editingId,
          businessId: values.businessId,
          item: values.item,
          category: values.category,
          amount: values.amount,
          notes: values.notes,
          date: values.date,
        });
      } else {
        await createExpense({
          userId: uid,
          businessId: values.businessId,
          item: values.item,
          category: values.category,
          amount: values.amount,
          notes: values.notes,
          date: values.date,
        });
      }
      await refetchExpenses();
      form.reset({ ...form.getValues(), item: "", category: "", amount: 0, notes: "" });
      setEditingId(null);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : editingId ? "Failed to update expense." : "Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit expense" : "Add expense"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="expense-date">Date</Label>
              <Input id="expense-date" type="date" {...form.register("date")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-business">Business</Label>
              <select
                id="expense-business"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                {...form.register("businessId")}
              >
                {bizLoading ? <option>Loading...</option> : null}
                {!bizLoading && businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {form.formState.errors.businessId && (
                <p className="text-sm text-red-600">{form.formState.errors.businessId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-item">Item</Label>
              <Input id="expense-item" placeholder="e.g. Water bottle refill" {...form.register("item")} />
              {form.formState.errors.item && (
                <p className="text-sm text-red-600">{form.formState.errors.item.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-category">Category</Label>
              <Input
                id="expense-category"
                placeholder="e.g. Supplies"
                {...form.register("category")}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-notes">Notes (optional)</Label>
              <Input id="expense-notes" placeholder="e.g. Cash payment" {...form.register("notes")} />
            </div>

            <div className="flex items-end md:col-span-2">
              <Button type="submit" disabled={submitting || bizLoading || !!bizError}>
                {submitting ? <Spinner className="h-4 w-4" /> : editingId ? "Update expense" : "Add expense"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    form.reset({ ...form.getValues(), item: "", category: "", amount: 0, notes: "" });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="md:col-span-2">
              {submitError ? (
                <div className="text-sm text-red-700 rounded-md bg-red-50 border border-red-200 p-3">
                  {submitError}
                </div>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="filter-business">Business</Label>
              <select
                id="filter-business"
                value={businessFilter ?? ""}
                onChange={(e) => setBusinessFilter(e.target.value ? e.target.value : null)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
              >
                <option value="">All businesses</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-start">Start</Label>
              <Input id="filter-start" type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-end">End</Label>
              <Input id="filter-end" type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-category">Category</Label>
              <Input
                id="filter-category"
                placeholder="Exact match (e.g. Supplies)"
                value={categoryFilter ?? ""}
                onChange={(e) => setCategoryFilter(e.target.value ? e.target.value : null)}
              />
            </div>
          </div>

          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Total expenses (filtered): {formatCurrency(expensesTotal)}
          </div>

          {expensesLoading ? (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Spinner />
              Loading...
            </div>
          ) : expensesError ? (
            <div className="text-sm text-red-700 rounded-md bg-red-50 border border-red-200 p-3">{expensesError}</div>
          ) : expenses.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">No expense entries for the current filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => {
                  const b = businesses.find((x) => x.id === e.business_id);
                  return (
                    <TableRow key={e.id}>
                      <TableCell>{formatDate(e.date)}</TableCell>
                      <TableCell>{b?.name ?? e.business_id}</TableCell>
                      <TableCell>{e.item}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(e.amount)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{e.notes}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(e.id);
                            form.setValue("date", e.date);
                            form.setValue("businessId", e.business_id);
                            form.setValue("item", e.item);
                            form.setValue("category", e.category);
                            form.setValue("amount", e.amount);
                            form.setValue("notes", e.notes ?? "");
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

