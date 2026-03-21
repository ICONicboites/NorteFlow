import * as React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useTheme } from "../providers/ThemeProvider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import {
  BarChart3,
  Building2,
  Moon,
  Sun,
  Wallet,
  ReceiptText,
  LogOut,
} from "lucide-react";

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

export function AppLayout() {
  const { logout } = useAuth();
  const { toggle, theme } = useTheme();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const title = React.useMemo(() => {
    if (location.pathname.startsWith("/dashboard")) return "Dashboard";
    if (location.pathname.startsWith("/businesses")) return "Businesses";
    if (location.pathname.startsWith("/income")) return "Income";
    if (location.pathname.startsWith("/expenses")) return "Expenses";
    return "NorteFlow";
  }, [location.pathname]);

  return (
    <div className="app-bg min-h-screen">
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  NorteFlow
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Multi-business tracker
                </div>
              </div>
            </div>
          </div>

          <nav className="px-3 pb-4 space-y-1">
            <NavItem to="/dashboard" label="Dashboard" icon={BarChart3} />
            <NavItem to="/businesses" label="Businesses" icon={Building2} />
            <NavItem to="/income" label="Income" icon={Wallet} />
            <NavItem to="/expenses" label="Expenses" icon={ReceiptText} />
          </nav>

          <div className="mt-auto p-3 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={toggle}
              type="button"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Toggle theme
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={async () => {
                setLoggingOut(true);
                try {
                  await logout();
                } finally {
                  setLoggingOut(false);
                }
              }}
              type="button"
              disabled={loggingOut}
            >
              {loggingOut ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {location.pathname}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggle}
                type="button"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  setLoggingOut(true);
                  try {
                    await logout();
                  } finally {
                    setLoggingOut(false);
                  }
                }}
                type="button"
                aria-label="Logout"
                disabled={loggingOut}
              >
                {loggingOut ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Card className="p-0 overflow-hidden">
              <Outlet />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

