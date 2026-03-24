import * as React from "react";
import { useAuth } from "../providers/AuthProvider";
import { useBusinesses, useExpenses, useIncomes } from "../hooks/supabaseHooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { formatCurrency, formatDate } from "../lib/format";

export function HistoryPage() {
  const { user } = useAuth();
  const { businesses } = useBusinesses(user?.id ?? null);
  const { data: incomes } = useIncomes({ userId: user?.id ?? null });
  const { data: expenses } = useExpenses({ userId: user?.id ?? null });

  // Merge and sort all transactions by date (descending)
  const transactions = React.useMemo(() => {
    const incomeTx = incomes.map((i) => ({
      id: i.id,
      type: "Income",
      businessId: i.business_id,
      amount: i.total,
      date: i.date,
      details: i.product,
    }));
    const expenseTx = expenses.map((e) => ({
      id: e.id,
      type: "Expense",
      businessId: e.business_id,
      amount: -e.amount,
      date: e.date,
      details: e.item,
    }));
    return [...incomeTx, ...expenseTx].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [incomes, expenses]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-glass">
                  <th className="py-3 pr-4 font-medium text-accent-blue">
                    Date
                  </th>
                  <th className="py-3 pr-4 font-medium text-accent-blue">
                    Type
                  </th>
                  <th className="py-3 pr-4 font-medium text-accent-blue">
                    Business
                  </th>
                  <th className="py-3 pr-4 font-medium text-accent-blue">
                    Details
                  </th>
                  <th className="py-3 font-medium text-accent-blue">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-slate-600 dark:text-slate-400 text-center"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const business =
                      businesses.find((b) => b.id === tx.businessId)?.name ||
                      tx.businessId;
                    return (
                      <tr
                        key={tx.type + tx.id}
                        className="border-b border-glass/50"
                      >
                        <td className="py-3 pr-4">{formatDate(tx.date)}</td>
                        <td
                          className={`py-3 pr-4 font-semibold ${tx.type === "Income" ? "text-profit-green" : "text-expense-rose"}`}
                        >
                          {tx.type}
                        </td>
                        <td className="py-3 pr-4">{business}</td>
                        <td className="py-3 pr-4">{tx.details}</td>
                        <td
                          className={`py-3 font-bold ${tx.amount > 0 ? "text-profit-green" : "text-expense-rose"}`}
                        >
                          {formatCurrency(Math.abs(tx.amount))}
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
    </div>
  );
}

export default HistoryPage;
