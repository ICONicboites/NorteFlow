import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { useBusinesses, useIncomes } from "../hooks/supabaseHooks";
import { createIncome, updateIncome } from "../services/dbService";
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
  product: z.string().min(2, "Product name is required."),
  quantity: z.number().positive("Quantity must be > 0."),
  price: z.number().positive("Price must be > 0."),
});

type FormValues = z.infer<typeof schema>;

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function IncomePage() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const { businesses, loading: bizLoading, error: bizError } = useBusinesses(uid);
  const [businessFilter, setBusinessFilter] = React.useState<string | null>(null);

  const [startDate, setStartDate] = React.useState<string | null>(null);
  const [endDate, setEndDate] = React.useState<string | null>(null);

  const { data: incomes, loading: incomesLoading, error: incomesError, refetch: refetchIncomes } = useIncomes({
    userId: uid,
    businessId: businessFilter,
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
      product: "",
      quantity: 1,
      price: 0,
    },
  });

  React.useEffect(() => {
    // Default the form businessId to the first business once loaded.
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

  const incomeTotal = React.useMemo(() => incomes.reduce((sum, i) => sum + i.total, 0), [incomes]);

  async function onSubmit(values: FormValues) {
    if (!uid) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateIncome({
          userId: uid,
          incomeId: editingId,
          businessId: values.businessId,
          product: values.product,
          quantity: values.quantity,
          price: values.price,
          date: values.date,
        });
      } else {
        await createIncome({
          userId: uid,
          businessId: values.businessId,
          product: values.product,
          quantity: values.quantity,
          price: values.price,
          date: values.date,
        });
      }
      await refetchIncomes();
      form.reset({ ...form.getValues(), product: "", quantity: 1, price: 0 });
      setEditingId(null);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : editingId ? "Failed to update income." : "Failed to add income.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit income" : "Add income"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="income-date">Date</Label>
              <Input id="income-date" type="date" {...form.register("date")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="income-business">Business</Label>
              <select
                id="income-business"
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
              <Label htmlFor="income-product">Product</Label>
              <Input id="income-product" placeholder="e.g. Bottled Water" {...form.register("product")} />
              {form.formState.errors.product && (
                <p className="text-sm text-red-600">{form.formState.errors.product.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="income-quantity">Quantity</Label>
              <Input
                id="income-quantity"
                type="number"
                step="1"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="income-price">Price</Label>
              <Input
                id="income-price"
                type="number"
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={submitting || bizLoading || !!bizError}>
                {submitting ? <Spinner className="h-4 w-4" /> : editingId ? "Update income" : "Add income"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    form.reset({ ...form.getValues(), product: "", quantity: 1, price: 0 });
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
          <CardTitle>Income entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-business">Filter by business</Label>
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
              <Label htmlFor="filter-start">Start date</Label>
              <Input id="filter-start" type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-end">End date</Label>
              <Input id="filter-end" type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} />
            </div>
          </div>

          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Total income (filtered): {formatCurrency(incomeTotal)}
          </div>

          {incomesLoading ? (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Spinner />
              Loading...
            </div>
          ) : incomesError ? (
            <div className="text-sm text-red-700 rounded-md bg-red-50 border border-red-200 p-3">{incomesError}</div>
          ) : incomes.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">No income entries for the current filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((i) => {
                  const b = businesses.find((x) => x.id === i.business_id);
                  return (
                    <TableRow key={i.id}>
                      <TableCell>{formatDate(i.date)}</TableCell>
                      <TableCell>{b?.name ?? i.business_id}</TableCell>
                      <TableCell>{i.product}</TableCell>
                      <TableCell className="text-right">{i.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(i.price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(i.total)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(i.id);
                            form.setValue("date", i.date);
                            form.setValue("businessId", i.business_id);
                            form.setValue("product", i.product);
                            form.setValue("quantity", i.quantity);
                            form.setValue("price", i.price);
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

