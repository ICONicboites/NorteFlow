import * as React from "react";
import type { Business, Income, Expense, FilterState } from "../types/models";

// State
interface AppState {
  businesses: Business[];
  incomes: Income[];
  expenses: Expense[];
  filters: FilterState;
  loading: {
    businesses: boolean;
    incomes: boolean;
    expenses: boolean;
  };
  error: {
    businesses: string | null;
    incomes: string | null;
    expenses: string | null;
  };
}

// Actions

type Action =
  | { type: "SET_BUSINESSES"; payload: Business[] }
  | { type: "SET_INCOMES"; payload: Income[] }
  | { type: "SET_EXPENSES"; payload: Expense[] }
  | { type: "SET_FILTERS"; payload: Partial<FilterState> }
  | {
      type: "SET_LOADING";
      payload: { key: keyof AppState["loading"]; value: boolean };
    }
  | {
      type: "SET_ERROR";
      payload: { key: keyof AppState["error"]; value: string | null };
    };

// Reducer
const initialState: AppState = {
  businesses: [],
  incomes: [],
  expenses: [],
  filters: {
    businessId: null,
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    },
    expenseCategory: null,
  },
  loading: {
    businesses: true,
    incomes: true,
    expenses: true,
  },
  error: {
    businesses: null,
    incomes: null,
    expenses: null,
  },
};

function appStateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_BUSINESSES":
      return {
        ...state,
        businesses: action.payload,
        loading: { ...state.loading, businesses: false },
      };
    case "SET_INCOMES":
      return {
        ...state,
        incomes: action.payload,
        loading: { ...state.loading, incomes: false },
      };
    case "SET_EXPENSES":
      return {
        ...state,
        expenses: action.payload,
        loading: { ...state.loading, expenses: false },
      };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        error: { ...state.error, [action.payload.key]: action.payload.value },
      };
    default:
      return state;
  }
}

// Context
const AppStateContext = React.createContext<
  { state: AppState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

// Provider
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook
export function useAppState() {
  const context = React.useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
