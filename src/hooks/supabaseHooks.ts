import * as React from "react";
import { supabase } from "../lib/supabase";
import type { BusinessRow, ExpenseRow, IncomeRow } from "../types/models";
import type { RealtimeChannel } from "@supabase/supabase-js";

function friendlyDbError(message: string) {
  if (message.toLowerCase().includes("could not find the table")) {
    return (
      "Supabase table(s) not found. Create the tables in your Supabase project (businesses, income, expenses) and re-load the page."
    );
  }
  return message;
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return 0;
}

function toBusinessRows(rows: any[]): BusinessRow[] {
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    category: r.category,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

function toIncomeRows(rows: any[]): IncomeRow[] {
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    business_id: r.business_id,
    product: r.product,
    quantity: num(r.quantity),
    price: num(r.price),
    total: num(r.total),
    date: r.date,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

function toExpenseRows(rows: any[]): ExpenseRow[] {
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    business_id: r.business_id,
    item: r.item,
    category: r.category,
    amount: num(r.amount),
    notes: r.notes ?? "",
    date: r.date,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export function useBusinesses(userId: string | null) {
  const [businesses, setBusinesses] = React.useState<BusinessRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    if (!userId) {
      setBusinesses([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase
      .from("businesses")
      .select("id,user_id,name,category,created_at,updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (e) {
      setError(friendlyDbError(e.message));
      setLoading(false);
      return;
    }

    setBusinesses(toBusinessRows(data ?? []));
    setLoading(false);
  }, [userId]);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`businesses:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "businesses", filter: `user_id=eq.${userId}` },
        () => {
          void refetch();
        },
      );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel as RealtimeChannel);
    };
  }, [userId, refetch]);

  return { businesses, loading, error, refetch };
}

export function useIncomes({
  userId,
  businessId,
  startDate,
  endDate,
}: {
  userId: string | null;
  businessId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}) {
  const [data, setData] = React.useState<IncomeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from("income")
      .select(
        "id,user_id,business_id,product,quantity,price,total,date,created_at,updated_at",
      )
      .eq("user_id", userId);

    if (businessId) query = query.eq("business_id", businessId);
    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    query = query.order("date", { ascending: false });

    const { data: rows, error: e } = await query;
    if (e) {
      setError(friendlyDbError(e.message));
      setLoading(false);
      return;
    }

    setData(toIncomeRows(rows ?? []));
    setLoading(false);
  }, [userId, businessId, startDate, endDate]);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  React.useEffect(() => {
    if (!userId) return;

    // Keep realtime subscription broad (user-level) and refetch current filtered view.
    const channel = supabase
      .channel(`income:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "income", filter: `user_id=eq.${userId}` },
        () => {
          void refetch();
        },
      );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel as RealtimeChannel);
    };
  }, [userId, refetch]);

  return { data, loading, error, refetch };
}

export function useExpenses({
  userId,
  businessId,
  startDate,
  endDate,
  category,
}: {
  userId: string | null;
  businessId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
}) {
  const [data, setData] = React.useState<ExpenseRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from("expenses")
      .select(
        "id,user_id,business_id,item,category,amount,notes,date,created_at,updated_at",
      )
      .eq("user_id", userId);

    if (businessId) query = query.eq("business_id", businessId);
    if (category) query = query.eq("category", category);
    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    query = query.order("date", { ascending: false });

    const { data: rows, error: e } = await query;
    if (e) {
      setError(friendlyDbError(e.message));
      setLoading(false);
      return;
    }

    setData(toExpenseRows(rows ?? []));
    setLoading(false);
  }, [userId, businessId, category, startDate, endDate]);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`expenses:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
        () => {
          void refetch();
        },
      );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel as RealtimeChannel);
    };
  }, [userId, refetch]);

  return { data, loading, error, refetch };
}

