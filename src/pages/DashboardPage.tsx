import * as React from "react";
import { useAuth } from "../providers/AuthProvider";
import { useBusinesses, useExpenses, useIncomes } from "../hooks/supabaseHooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { KpiCard } from "../components/ui/KpiCard";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { Calendar } from "lucide-react";
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
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function DashboardPage() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const {
    businesses,
    loading: bizLoading,
    error: bizError,
  } = useBusinesses(uid);

  // Dashboard filters
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<string>(() => {
    const end = new Date();
    const start = addDays(end, -30);
    return ymdLocal(start);
  });
  const [endDate, setEndDate] = React.useState<string>(() => todayInputValue());

  React.useEffect(() => {
    if (bizLoading) return;
    if (businesses.length === 0) return;
    if (!businessId) setBusinessId(businesses[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bizLoading, businesses]);

  // Refs for date inputs
  const dashStartInputRef = React.useRef<HTMLInputElement>(null);
  const dashEndInputRef = React.useRef<HTMLInputElement>(null);

  const {
    data: incomes,
    loading: incomesLoading,
    error: incomesError,
  } = useIncomes({ userId: uid, businessId, startDate, endDate });

  const {
    data: expenses,
    loading: expensesLoading,
    error: expensesError,
  } = useExpenses({
    userId: uid,
    businessId,
    startDate,
    endDate,
  });

  const loading = bizLoading || incomesLoading || expensesLoading;

  const totalIncome = React.useMemo(
    () => incomes.reduce((sum, i) => sum + i.total, 0),
    [incomes],
  );
  const totalExpenses = React.useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );
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
    const actualDays = Math.min(
      maxDays,
      Math.max(
        0,
        Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1,
      ),
    );
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
    return (
      <div className="text-sm text-red-700 rounded-md bg-red-50 border border-red-200 p-3">
        {headerError}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* KPI Cards Row */}
      <div className="grid gap-8 md:grid-cols-3">
        <KpiCard
          title="Total Income"
          value={totalIncome}
          trend={0.12}
          trendDirection={totalIncome >= 0 ? "up" : "down"}
          className="bg-gradient-to-br from-accent-blue/80 to-profit-green/60 border-none shadow-xl"
        />
        <KpiCard
          title="Total Expenses"
          value={totalExpenses}
          trend={-0.08}
          trendDirection={totalExpenses >= 0 ? "down" : "up"}
          className="bg-gradient-to-br from-expense-rose/80 to-accent-blue/40 border-none shadow-xl"
        />
        <KpiCard
          title="Net Profit"
          value={netProfit}
          trend={0.05}
          trendDirection={netProfit >= 0 ? "up" : "down"}
          className="bg-gradient-to-br from-profit-green/80 to-accent-blue/60 border-none shadow-xl"
        />
      </div>

      {/* Filters Row */}
      <Card className="bg-white/10 dark:bg-navy-light/80 border border-glass shadow-glass-glow backdrop-blur-glass p-8">
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <Label
              htmlFor="dash-business"
              className="text-slate-900 dark:text-slate-50"
            >
              Business
            </Label>
            <select
              id="dash-business"
              value={businessId ?? ""}
              onChange={(e) =>
                setBusinessId(e.target.value ? e.target.value : null)
              }
              className="flex h-10 w-full rounded-lg border border-accent bg-white dark:bg-navy-light px-3 py-2 text-sm text-slate-900 dark:text-white shadow focus:ring-2 focus:ring-accent-blue/60 transition-all"
            >
              <option value="">All businesses</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="dash-start"
              className="text-slate-900 dark:text-slate-50"
            >
              Start
            </Label>
            <div className="relative">
              <Input
                id="dash-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white dark:bg-navy-light border-accent text-slate-900 dark:text-white rounded-lg pr-10 hide-date-icon"
                ref={dashStartInputRef}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-slate-400 dark:text-slate-300 focus:outline-none"
                onClick={() => {
                  const input = dashStartInputRef.current;
                  if (input && typeof input.showPicker === "function") {
                    input.showPicker();
                  }
                }}
                aria-label="Open start date picker"
              >
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="dash-end"
              className="text-slate-900 dark:text-slate-50"
            >
              End
            </Label>
            <div className="relative">
              <Input
                id="dash-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white dark:bg-navy-light border-accent text-slate-900 dark:text-white rounded-lg pr-10 hide-date-icon"
                ref={dashEndInputRef}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-slate-400 dark:text-slate-300 focus:outline-none"
                onClick={() => {
                  const input = dashEndInputRef.current;
                  if (input && typeof input.showPicker === "function") {
                    input.showPicker();
                  }
                }}
                aria-label="Open end date picker"
              >
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50/80 via-white/80 to-accent-blue/10 dark:from-navy-light/90 dark:via-slate-900/80 dark:to-accent-blue/20 border border-glass shadow-2xl shadow-accent-blue/10 backdrop-blur-glass rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-accent-blue drop-shadow-sm">
            Profit per business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={breakdown.map((b) => ({
                  name:
                    businesses.find((x) => x.id === b.businessId)?.name ??
                    b.businessId,
                  net: b.net,
                  income: b.income,
                  expenses: b.expenses,
                }))}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  stroke="#4f8ef7"
                  tick={{ fill: "#fff" }}
                />
                <YAxis stroke="#4f8ef7" tick={{ fill: "#fff" }} />
                <Tooltip
                  formatter={(v: any) => formatCurrency(Number(v))}
                  contentStyle={{
                    background: "#1a1d2e",
                    color: "#fff",
                    border: "1.5px solid #4f8ef7",
                  }}
                />
                <Bar dataKey="net" fill="#4f8ef7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-base rounded-xl overflow-hidden shadow-lg">
              <thead>
                <tr className="text-left border-b border-accent-blue/30 bg-accent-blue/10 dark:bg-accent-blue/20">
                  <th className="py-3 pr-4 font-bold text-accent-blue tracking-wide uppercase">
                    Business
                  </th>
                  <th className="py-3 pr-4 font-bold text-accent-blue tracking-wide uppercase">
                    Income
                  </th>
                  <th className="py-3 pr-4 font-bold text-accent-blue tracking-wide uppercase">
                    Expenses
                  </th>
                  <th className="py-3 font-bold text-accent-blue tracking-wide uppercase">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdown.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-slate-600 dark:text-slate-400 text-center"
                    >
                      No data for this range.
                    </td>
                  </tr>
                ) : (
                  breakdown.map((b) => {
                    const name =
                      businesses.find((x) => x.id === b.businessId)?.name ??
                      b.businessId;
                    return (
                      <tr
                        key={b.businessId}
                        className={`border-b border-glass/30 transition hover:bg-accent-blue/10 dark:hover:bg-accent-blue/20 ${b.net > 0 ? "hover:shadow-lg" : ""}`}
                      >
                        <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                          {name}
                        </td>
                        <td className="py-3 pr-4 text-slate-800 dark:text-slate-200">
                          {formatCurrency(b.income)}
                        </td>
                        <td className="py-3 pr-4 text-slate-800 dark:text-slate-200">
                          {formatCurrency(b.expenses)}
                        </td>
                        <td
                          className={`py-3 font-bold ${b.net > 0 ? "text-profit-green" : b.net < 0 ? "text-expense-rose" : "text-accent-blue"}`}
                        >
                          {formatCurrency(b.net)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50/80 via-white/80 to-accent-blue/10 dark:from-navy-light/90 dark:via-slate-900/80 dark:to-accent-blue/20 border border-glass shadow-2xl shadow-accent-blue/10 backdrop-blur-glass rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-accent-blue drop-shadow-sm">
            Trend (last 14 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={daily}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e0e7ef" />
                <XAxis
                  dataKey="date"
                  stroke="#4f8ef7"
                  tick={{ fill: "#4f8ef7", fontWeight: 600 }}
                  tickFormatter={formatYMD}
                />
                <YAxis
                  stroke="#4f8ef7"
                  tick={{ fill: "#4f8ef7", fontWeight: 600 }}
                  tickFormatter={(v) => formatCurrency(Number(v))}
                />
                <Tooltip
                  formatter={(v: any) => formatCurrency(Number(v))}
                  contentStyle={{
                    background: "#1a1d2e",
                    color: "#fff",
                    border: "1.5px solid #4f8ef7",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#2ecc71"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#e74c3c"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke="#4f8ef7"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="inline-block w-4 h-2 rounded bg-[#2ecc71]"></span>
              Income
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="inline-block w-4 h-2 rounded bg-[#e74c3c]"></span>
              Expenses
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="inline-block w-4 h-2 rounded bg-[#4f8ef7]"></span>
              Net
            </span>
            <span className="ml-auto text-xs text-slate-600 dark:text-slate-400">
              Range shown: {daily[0]?.date ? formatYMD(daily[0].date) : "-"} -{" "}
              {daily[daily.length - 1]?.date
                ? formatYMD(daily[daily.length - 1].date)
                : "-"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
