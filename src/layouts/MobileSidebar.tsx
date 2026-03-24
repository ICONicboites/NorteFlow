import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Wallet,
  ReceiptText,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";

export function MobileSidebar({
  open,
  onClose,
  theme,
  toggleTheme,
  loggingOut,
  logout,
}: {
  open: boolean;
  onClose: () => void;
  theme: string;
  toggleTheme: () => void;
  loggingOut: boolean;
  logout: () => Promise<void>;
}) {
  return (
    <div
      className={`fixed inset-0 z-40 transition-all duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside
        className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <img src="/logo.svg" alt="NorteFlow Logo" className="h-8 w-8" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              NorteFlow
            </span>
          </div>
          <nav className="flex flex-col gap-1 px-4 py-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-slate-100 dark:bg-slate-800 text-accent-blue" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`
              }
              onClick={onClose}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/businesses"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-slate-100 dark:bg-slate-800 text-accent-blue" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`
              }
              onClick={onClose}
            >
              <Building2 className="h-4 w-4" />
              Businesses
            </NavLink>
            <NavLink
              to="/income"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-slate-100 dark:bg-slate-800 text-accent-blue" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`
              }
              onClick={onClose}
            >
              <Wallet className="h-4 w-4" />
              Income
            </NavLink>
            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-slate-100 dark:bg-slate-800 text-accent-blue" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`
              }
              onClick={onClose}
            >
              <ReceiptText className="h-4 w-4" />
              Expenses
            </NavLink>
          </nav>
        </div>
        <div className="p-4 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="ml-2">Toggle theme</span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={logout}
            type="button"
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </aside>
    </div>
  );
}
