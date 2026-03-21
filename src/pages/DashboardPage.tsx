import * as React from "react";
import { useAuth } from "../providers/AuthProvider";
import { useBusinesses, useExpenses, useIncomes } from "../hooks/supabaseHooks";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { formatCurrency } from "../lib/format";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ymdLocal(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(d: Date, days: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}

function formatYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function DashboardPage() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const { businesses, loading: bizLoading, error: bizError } = useBusinesses(uid);

  // Dashboard filters
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<string>(() => {
    const end = new Date();
    const start = addDays(end, -30);
    return ymdLocal(start);
  });
  const [endDate, setEndDate] = React.useState<string>(() => todayInputValue());
  const [expenseCategory, setExpenseCategory] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (bizLoading) return;
    if (businesses.length === 0) return;
    if (!businessId) setBusinessId(businesses[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bizLoading, businesses]);

  const {
    data: incomes,
    loading: incomesLoading,
    error: incomesError,
  } = useIncomes({ userId: uid, businessId, startDate, endDate });

  const {
    data: expenses,
    loading: expensesLoading,
    error: expensesError,
  } = useExpenses({ userId: uid, businessId, startDate, endDate, category: expenseCategory });

  const loading = bizLoading || incomesLoading || expensesLoading;

  const totalIncome = React.useMemo(() => incomes.reduce((sum, i) => sum + i.total, 0), [incomes]);
  const totalExpenses = React.useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const netProfit = totalIncome - totalExpenses;

  const breakdown = React.useMemo(() => {
    const byBiz = new Map<
      string,
      { businessId: string; income: number; expenses: number; net: number }
    >();

    for (const i of incomes) {
      const cur = byBiz.get(i.business_id) ?? {
        businessId: i.business_id,
        income: 0,
        expenses: 0,
        net: 0,
      };
      cur.income += i.total;
      byBiz.set(i.business_id, cur);
    }
    for (const e of expenses) {
      const cur = byBiz.get(e.business_id) ?? {
        businessId: e.business_id,
        income: 0,
        expenses: 0,
        net: 0,
      };
      cur.expenses += e.amount;
      byBiz.set(e.business_id, cur);
    }
    for (const cur of byBiz.values()) {
      cur.net = cur.income - cur.expenses;
    }

    const list = Array.from(byBiz.values());
    list.sort((a, b) => b.net - a.net);
    return list;
  }, [incomes, expenses]);

  const daily = React.useMemo(() => {
    // Cap chart to 14 days for performance.
    const start = new Date(startDate);
    const end = new Date(endDate);
    const maxDays = 14;
    const actualDays = Math.min(maxDays, Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1));
    const startCapped = addDays(end, -actualDays + 1);

    const bucket: Record<string, { income: number; expenses: number }> = {};

    for (let i = 0; i < actualDays; i++) {
      const d = addDays(startCapped, i);
      bucket[ymdLocal(d)] = { income: 0, expenses: 0 };
    }

    for (const inc of incomes) {
      const key = inc.date; // yyyy-mm-dd
      if (bucket[key]) bucket[key].income += inc.total;
    }
    for (const exp of expenses) {
      const key = exp.date; // yyyy-mm-dd
      if (bucket[key]) bucket[key].expenses += exp.amount;
    }

    return Object.entries(bucket).map(([date, vals]) => ({
      date,
      income: vals.income,
      expenses: vals.expenses,
      net: vals.income - vals.expenses,
    }));
  }, [incomes, expenses, startDate, endDate]);

  if (loading) {
    return (
      <div className="min-h-[40svh] flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
        <Spinner />
        Loading dashboard...
      </div>
    );
  }

  const headerError = bizError ?? incomesError ?? expensesError;
  if (headerError) {
    return <div className="text-sm text-red-700 rounded-md bg-red-50 border border-red-200 p-3">{headerError}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total income</div>
              <div className="text-2xl font-semibold">{formatCurrency(totalIncome)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total expenses</div>
              <div className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800 md:col-span-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Net profit</div>
              <div className="text-2xl font-semibold">
                {formatCurrency(netProfit)}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  {" "}
                  ({startDate} - {endDate})
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="dash-business">Business</Label>
              <select
                id="dash-business"
                value={businessId ?? ""}
                onChange={(e) => setBusinessId(e.target.value ? e.target.value : null)}
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
              <Label htmlFor="dash-start">Start</Label>
              <Input
                id="dash-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dash-end">End</Label>
              <Input id="dash-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dash-category">Expense category</Label>
              <Input
                id="dash-category"
                placeholder="Exact match, optional"
                value={expenseCategory ?? ""}
                onChange={(e) => setExpenseCategory(e.target.value ? e.target.value : null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit per business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdown.map((b) => ({
                name: businesses.find((x) => x.id === b.businessId)?.name ?? b.businessId,
                net: b.net,
                income: b.income,
                expenses: b.expenses,
              }))}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="net" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 pr-4 font-medium text-slate-600 dark:text-slate-300">Business</th>
                  <th className="py-3 pr-4 font-medium text-slate-600 dark:text-slate-300">Income</th>
                  <th className="py-3 pr-4 font-medium text-slate-600 dark:text-slate-300">Expenses</th>
                  <th className="py-3 font-medium text-slate-600 dark:text-slate-300">Net</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-slate-600 dark:text-slate-300">
                      No data for this range.
                    </td>
                  </tr>
                ) : (
                  breakdown.map((b) => {
                    const name = businesses.find((x) => x.id === b.businessId)?.name ?? b.businessId;
                    return (
                      <tr key={b.businessId} className="border-b border-slate-200 dark:border-slate-800/50">
                        <td className="py-3 pr-4 font-medium">{name}</td>
                        <td className="py-3 pr-4">{formatCurrency(b.income)}</td>
                        <td className="py-3 pr-4">{formatCurrency(b.expenses)}</td>
                        <td className="py-3 font-semibold">{formatCurrency(b.net)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend (last 14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#0ea5e9" />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#fb7185" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Range shown: {daily[0]?.date ? formatYMD(daily[0].date) : "-"} -{" "}
            {daily[daily.length - 1]?.date ? formatYMD(daily[daily.length - 1].date) : "-"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

