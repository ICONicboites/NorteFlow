import { supabase } from "../lib/supabase";

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return 0;
}

export async function createBusiness({
  userId,
  name,
  category,
}: {
  userId: string;
  name: string;
  category: string;
}) {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      user_id: userId,
      name: name.trim(),
      category: category.trim(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateBusiness({
  userId,
  businessId,
  name,
  category,
}: {
  userId: string;
  businessId: string;
  name: string;
  category: string;
}) {
  const { data, error } = await supabase
    .from("businesses")
    .update({ name: name.trim(), category: category.trim() })
    .eq("id", businessId)
    .eq("user_id", userId)
    .select("id")
    .single();
  if (error) throw error;
  return data?.id as string;
}

export async function deleteBusiness({
  userId,
  businessId,
}: {
  userId: string;
  businessId: string;
}) {
  const { error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", businessId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function createIncome({
  userId,
  businessId,
  product,
  quantity,
  price,
  date,
}: {
  userId: string;
  businessId: string;
  product: string;
  quantity: number;
  price: number;
  date: string; // yyyy-mm-dd
}) {
  const total = quantity * price;
  const { data, error } = await supabase
    .from("income")
    .insert({
      user_id: userId,
      business_id: businessId,
      product: product.trim(),
      quantity,
      price,
      total,
      date,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateIncome({
  userId,
  incomeId,
  businessId,
  product,
  quantity,
  price,
  date,
}: {
  userId: string;
  incomeId: string;
  businessId: string;
  product: string;
  quantity: number;
  price: number;
  date: string;
}) {
  const total = quantity * price;
  const { data, error } = await supabase
    .from("income")
    .update({
      business_id: businessId,
      product: product.trim(),
      quantity,
      price,
      total,
      date,
    })
    .eq("id", incomeId)
    .eq("user_id", userId)
    .select("id")
    .single();
  if (error) throw error;
  return data?.id as string;
}

export async function deleteIncome({
  userId,
  incomeId,
}: {
  userId: string;
  incomeId: string;
}) {
  const { error } = await supabase
    .from("income")
    .delete()
    .eq("id", incomeId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function createExpense({
  userId,
  businessId,
  item,
  category,
  amount,
  notes,
  date,
}: {
  userId: string;
  businessId: string;
  item: string;
  category: string;
  amount: number;
  notes?: string;
  date: string; // yyyy-mm-dd
}) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      business_id: businessId,
      item: item.trim(),
      category: category.trim(),
      amount,
      notes: (notes ?? "").trim(),
      date,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateExpense({
  userId,
  expenseId,
  businessId,
  item,
  category,
  amount,
  notes,
  date,
}: {
  userId: string;
  expenseId: string;
  businessId: string;
  item: string;
  category: string;
  amount: number;
  notes?: string;
  date: string;
}) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      business_id: businessId,
      item: item.trim(),
      category: category.trim(),
      amount,
      notes: (notes ?? "").trim(),
      date,
    })
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select("id")
    .single();
  if (error) throw error;
  return data?.id as string;
}

export async function deleteExpense({
  userId,
  expenseId,
}: {
  userId: string;
  expenseId: string;
}) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", userId);
  if (error) throw error;
}

// If you want to map numeric fields defensively (in case Postgres returns strings):
export const toNumber = num;

