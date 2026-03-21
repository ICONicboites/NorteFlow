import * as React from "react";
import { useAuth } from "../providers/AuthProvider";
import { useAppState } from "../providers/StateProvider";
import { getBusinesses, getIncomes, getExpenses } from "../services/dbService";

export function useDataFetcher() {
  const { user } = useAuth();
  const { dispatch } = useAppState();

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: { key: "businesses", value: true } });
        const businesses = await getBusinesses(user.id);
        dispatch({ type: "SET_BUSINESSES", payload: businesses });
      } catch (e) {
        dispatch({ type: "SET_ERROR", payload: { key: "businesses", value: e instanceof Error ? e.message : "Failed to fetch businesses" } });
      }

      try {
        dispatch({ type: "SET_LOADING", payload: { key: "incomes", value: true } });
        const incomes = await getIncomes({ userId: user.id });
        dispatch({ type: "SET_INCOMES", payload: incomes });
      } catch (e) {
        dispatch({ type: "SET_ERROR", payload: { key: "incomes", value: e instanceof Error ? e.message : "Failed to fetch incomes" } });
      }

      try {
        dispatch({ type: "SET_LOADING", payload: { key: "expenses", value: true } });
        const expenses = await getExpenses({ userId: user.id });
        dispatch({ type: "SET_EXPENSES", payload: expenses });
      } catch (e) {
        dispatch({ type: "SET_ERROR", payload: { key: "expenses", value: e instanceof Error ? e.message : "Failed to fetch expenses" } });
      }
    };

    fetchData();
  }, [user, dispatch]);
}
