"use client";

import { useState, useCallback } from "react";
import { API } from "@/lib/api-paths";
import { PaginationBar } from "@/app/components/pagination-bar";

const PAGE_SIZES = [5, 10, 15, 25];

interface Stats {
  userCount: number;
  portfolioCount: number;
  paidCount: number;
  basicCount: number;
  premiumCount: number;
  recentUsers: { id: string; phone: string; name?: string; createdAt: string }[];
  usersTotal: number;
  usersPage: number;
  usersLimit: number;
  usersTotalPages: number;
  recentPortfolios: {
    id: string;
    name: string;
    email: string;
    collegeName: string;
    template: string;
    paymentStatus: string;
    amount?: number;
    hasResume?: boolean;
    createdAt: string;
  }[];
  portfoliosTotal: number;
  portfoliosPage: number;
  portfoliosLimit: number;
  portfoliosTotalPages: number;
}

interface AnalyticsSession {
  sessionId: string;
  userId?: string;
  phone?: string;
  name?: string;
  events: { page: string; action: string; step?: string; timeSpentMs?: number; createdAt: string }[];
  totalTimeMs: number;
  lastStep?: string;
  completed: boolean;
}

interface AdminAction {
  action: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSession[]>([]);
  const [analyticsTotal, setAnalyticsTotal] = useState(0);
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [analyticsLimit, setAnalyticsLimit] = useState(15);
  const [analyticsTotalPages, setAnalyticsTotalPages] = useState(0);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [actionsTotal, setActionsTotal] = useState(0);
  const [actionsPage, setActionsPage] = useState(1);
  const [actionsLimit, setActionsLimit] = useState(20);
  const [actionsTotalPages, setActionsTotalPages] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [portfoliosPage, setPortfoliosPage] = useState(1);
  const [portfoliosLimit, setPortfoliosLimit] = useState(10);
  const [selectedSession, setSelectedSession] = useState<AnalyticsSession | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);

  const adminHeaders = useCallback(
    () => ({ "x-admin-key": key }),
    [key]
  );

  const logAdminAction = useCallback(
    async (action: string, meta?: Record<string, unknown>) => {
      if (!key) return;
      try {
        await fetch(API._n, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...adminHeaders() },
          body: JSON.stringify({ action, meta }),
        });
      } catch {}
    },
    [key, adminHeaders]
  );

  const fetchStats = useCallback(async () => {
    if (!key) return;
    setError("");
    setLoading(true);
    try {
      const url = `${API._n}?usersPage=${usersPage}&usersLimit=${usersLimit}&portfoliosPage=${portfoliosPage}&portfoliosLimit=${portfoliosLimit}`;
      const res = await fetch(url, { headers: adminHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStats(data);
      setAuthenticated(true);
      logAdminAction("dashboard_view");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [key, usersPage, usersLimit, portfoliosPage, portfoliosLimit, logAdminAction, adminHeaders]);

  const fetchAnalytics = useCallback(async () => {
    if (!key) return;
    setLoadingAnalytics(true);
    try {
      const res = await fetch(
        `${API._q}?page=${analyticsPage}&limit=${analyticsLimit}`,
        { headers: adminHeaders() }
      );
      const data = await res.json();
      if (!res.ok) {
        setAnalytics([]);
        setAnalyticsTotal(0);
        setAnalyticsTotalPages(0);
        return;
      }
      setAnalytics(data.sessions || []);
      setAnalyticsTotal(data.total ?? 0);
      setAnalyticsTotalPages(data.totalPages ?? 0);
    } catch {
      setAnalytics([]);
      setAnalyticsTotal(0);
      setAnalyticsTotalPages(0);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [key, analyticsPage, analyticsLimit, adminHeaders]);

  const fetchAdminActions = useCallback(async () => {
    if (!key) return;
    setLoadingActions(true);
    try {
      const res = await fetch(
        `${API._n}?actions=1&page=${actionsPage}&limit=${actionsLimit}`,
        { headers: adminHeaders() }
      );
      const data = await res.json();
      if (!res.ok) {
        setAdminActions([]);
        setActionsTotal(0);
        setActionsTotalPages(0);
        return;
      }
      setAdminActions(data.actions || []);
      setActionsTotal(data.total ?? 0);
      setActionsTotalPages(data.totalPages ?? 0);
    } catch {
      setAdminActions([]);
      setActionsTotal(0);
      setActionsTotalPages(0);
    } finally {
      setLoadingActions(false);
    }
  }, [key, actionsPage, actionsLimit, adminHeaders]);

  const loadAll = useCallback(async () => {
    if (!key) return;
    setError("");
    setLoading(true);
    try {
      const h = adminHeaders();
      const [statsRes, analyticsRes, actionsRes] = await Promise.all([
        fetch(
          `${API._n}?usersPage=${usersPage}&usersLimit=${usersLimit}&portfoliosPage=${portfoliosPage}&portfoliosLimit=${portfoliosLimit}`,
          { headers: h }
        ),
        fetch(`${API._q}?page=${analyticsPage}&limit=${analyticsLimit}`, { headers: h }),
        fetch(`${API._n}?actions=1&page=${actionsPage}&limit=${actionsLimit}`, { headers: h }),
      ]);
      const statsData = await statsRes.json();
      const analyticsData = await analyticsRes.json();
      const actionsData = await actionsRes.json();
      if (!statsRes.ok) throw new Error(statsData.error || "Failed");
      setStats(statsData);
      setAuthenticated(true);
      logAdminAction("dashboard_view");
      if (analyticsRes.ok) {
        setAnalytics(analyticsData.sessions || []);
        setAnalyticsTotal(analyticsData.total ?? 0);
        setAnalyticsTotalPages(analyticsData.totalPages ?? 0);
      }
      if (actionsRes.ok) {
        setAdminActions(actionsData.actions || []);
        setActionsTotal(actionsData.total ?? 0);
        setActionsTotalPages(actionsData.totalPages ?? 0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
      setLoadingAnalytics(false);
      setLoadingActions(false);
    }
  }, [
    key,
    usersPage,
    usersLimit,
    portfoliosPage,
    portfoliosLimit,
    analyticsPage,
    analyticsLimit,
    actionsPage,
    actionsLimit,
    logAdminAction,
    adminHeaders,
  ]);

  const handleEnter = () => {
    setUsersPage(1);
    setPortfoliosPage(1);
    setAnalyticsPage(1);
    setActionsPage(1);
    loadAll();
  };

  const loadWithOverride = (overrides: {
    usersPage?: number;
    portfoliosPage?: number;
    analyticsPage?: number;
    actionsPage?: number;
    usersLimit?: number;
    portfoliosLimit?: number;
    analyticsLimit?: number;
    actionsLimit?: number;
  } = {}) => {
    const up = overrides.usersPage ?? usersPage;
    const pp = overrides.portfoliosPage ?? portfoliosPage;
    const ap = overrides.analyticsPage ?? analyticsPage;
    const acp = overrides.actionsPage ?? actionsPage;
    const ul = overrides.usersLimit ?? usersLimit;
    const pl = overrides.portfoliosLimit ?? portfoliosLimit;
    const al = overrides.analyticsLimit ?? analyticsLimit;
    const acl = overrides.actionsLimit ?? actionsLimit;
    if (overrides.usersPage !== undefined) setUsersPage(up);
    if (overrides.portfoliosPage !== undefined) setPortfoliosPage(pp);
    if (overrides.analyticsPage !== undefined) setAnalyticsPage(ap);
    if (overrides.actionsPage !== undefined) setActionsPage(acp);
    if (overrides.usersLimit !== undefined) setUsersLimit(ul);
    if (overrides.portfoliosLimit !== undefined) setPortfoliosLimit(pl);
    if (overrides.analyticsLimit !== undefined) setAnalyticsLimit(al);
    if (overrides.actionsLimit !== undefined) setActionsLimit(acl);
    setLoading(true);
    setLoadingAnalytics(true);
    setLoadingActions(true);
    const h = { "x-admin-key": key };
    Promise.all([
      fetch(`${API._n}?usersPage=${up}&usersLimit=${ul}&portfoliosPage=${pp}&portfoliosLimit=${pl}`, {
        headers: h,
      }).then((r) => r.json()),
      fetch(`${API._q}?page=${ap}&limit=${al}`, { headers: h }).then((r) => r.json()),
      fetch(`${API._n}?actions=1&page=${acp}&limit=${acl}`, { headers: h }).then((r) => r.json()),
    ])
      .then(([statsData, analyticsData, actionsData]) => {
        if (!statsData.error) {
          setStats(statsData);
          setAuthenticated(true);
        }
        if (!analyticsData.error) {
          setAnalytics(analyticsData.sessions || []);
          setAnalyticsTotal(analyticsData.total ?? 0);
          setAnalyticsTotalPages(analyticsData.totalPages ?? 0);
        }
        if (!actionsData.error) {
          setAdminActions(actionsData.actions || []);
          setActionsTotal(actionsData.total ?? 0);
          setActionsTotalPages(actionsData.totalPages ?? 0);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => {
        setLoading(false);
        setLoadingAnalytics(false);
        setLoadingActions(false);
      });
  };

  const downloadCsv = async () => {
    logAdminAction("export_csv");
    try {
      const res = await fetch(API._s, { headers: adminHeaders() });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed");
    }
  };

  const downloadResume = async (portfolioId: string, name: string) => {
    logAdminAction("download_resume", { portfolioId, name });
    try {
      const res = await fetch(`${API._r}?portfolioId=${encodeURIComponent(portfolioId)}`, {
        headers: adminHeaders(),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (name || "resume").replace(/[^a-zA-Z0-9._-]/g, "_") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed");
    }
  };

  const refresh = () => {
    loadAll();
  };

  const logout = () => {
    setKey("");
    setAuthenticated(false);
    setStats(null);
    setAnalytics([]);
    setAdminActions([]);
    setError("");
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const getStepLabel = (lastStep?: string) => {
    if (!lastStep) return "—";
    const m: Record<string, string> = {
      "/": "Home",
      "/register": "Register",
      "/portfolio/create": "Details",
      "/portfolio/pay": "Payment",
      "/success": "Done",
    };
    const [page, step] = lastStep.split("#");
    return m[page] || page + (step ? ` (step ${step})` : "");
  };

  const changeUsersPage = (p: number) => {
    setUsersPage(p);
  };
  const changePortfoliosPage = (p: number) => {
    setPortfoliosPage(p);
  };
  const changeAnalyticsPage = (p: number) => {
    setAnalyticsPage(p);
  };
  const changeActionsPage = (p: number) => {
    setActionsPage(p);
  };

  if (!authenticated) {
    return (
      <div className="min-h-full flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-8">
        <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-xl mx-4">
          <h1 className="text-xl font-bold text-white mb-2">Admin</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your admin key to continue</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            placeholder="Admin key"
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {error && (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              {error}
              <button
                onClick={handleEnter}
                className="text-left underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}
          <button
            onClick={handleEnter}
            disabled={!key.trim() || loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
          >
            {loading ? "Loading…" : "Enter"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 bg-slate-950 text-white p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between">
            {error}
            <button onClick={refresh} className="underline hover:no-underline text-sm">
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{stats?.userCount ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Portfolios</p>
            <p className="text-2xl font-bold">{stats?.portfolioCount ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Paid</p>
            <p className="text-2xl font-bold text-green-400">{stats?.paidCount ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Basic (₹50)</p>
            <p className="text-2xl font-bold">{stats?.basicCount ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Premium (₹100)</p>
            <p className="text-2xl font-bold">{stats?.premiumCount ?? 0}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Recent Users</h2>
              <button
                onClick={() => loadWithOverride({ usersPage: 1 })}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Refresh
              </button>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading…</div>
              ) : (
                <>
                  <table className="w-full text-sm min-w-[200px]">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Phone</th>
                        <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentUsers?.map((u) => (
                        <tr key={u.id} className="border-b border-slate-700/50">
                          <td className="p-2 sm:p-3">{u.phone}</td>
                          <td className="p-2 sm:p-3 text-slate-400 whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t border-slate-700 px-3">
                    <PaginationBar
                      page={stats?.usersPage ?? 1}
                      totalPages={stats?.usersTotalPages ?? 0}
                      total={stats?.usersTotal ?? stats?.userCount ?? 0}
                      limit={stats?.usersLimit ?? 10}
                      onPageChange={(p) => loadWithOverride({ usersPage: p })}
                      onLimitChange={(l) => loadWithOverride({ usersPage: 1, usersLimit: l })}
                      limits={PAGE_SIZES}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Recent Portfolios</h2>
              <button
                onClick={() => loadWithOverride({ portfoliosPage: 1 })}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Refresh
              </button>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading…</div>
              ) : (
                <>
                  <table className="w-full text-sm min-w-[280px]">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Name</th>
                        <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">College</th>
                        <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Template</th>
                        <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Status</th>
                        <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentPortfolios?.map((p) => (
                        <tr key={p.id} className="border-b border-slate-700/50">
                          <td className="p-2 sm:p-3 truncate max-w-[100px] sm:max-w-none">{p.name}</td>
                          <td className="p-2 sm:p-3 text-slate-400 truncate max-w-[80px] sm:max-w-none">{p.collegeName || "—"}</td>
                          <td className="p-2 sm:p-3">{p.template}</td>
                          <td className="p-2 sm:p-3">
                            <span
                              className={
                                p.paymentStatus === "completed" ? "text-green-400" : "text-amber-400"
                              }
                            >
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3">
                            {p.hasResume ? (
                              <button
                                onClick={() => downloadResume(String(p.id), p.name)}
                                className="text-indigo-400 hover:text-indigo-300 text-xs underline inline-flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </button>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t border-slate-700 px-3">
                    <PaginationBar
                      page={stats?.portfoliosPage ?? 1}
                      totalPages={stats?.portfoliosTotalPages ?? 0}
                      total={stats?.portfoliosTotal ?? stats?.portfolioCount ?? 0}
                      limit={stats?.portfoliosLimit ?? 10}
                      onPageChange={(p) => loadWithOverride({ portfoliosPage: p })}
                      onLimitChange={(l) => loadWithOverride({ portfoliosPage: 1, portfoliosLimit: l })}
                      limits={PAGE_SIZES}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold">User Activity & Analytics</h2>
            <button
              onClick={() => {
                setAnalyticsPage(1);
                fetchAnalytics();
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Refresh
            </button>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-x-auto">
            {loadingAnalytics ? (
              <div className="p-8 text-center text-slate-500">Loading…</div>
            ) : (
              <>
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Phone / User</th>
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Last Step</th>
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Time on Site</th>
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Completed</th>
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-slate-500 text-center">
                          No activity recorded yet
                        </td>
                      </tr>
                    ) : (
                      analytics.map((s) => (
                        <tr key={s.sessionId} className="border-b border-slate-700/50">
                          <td className="p-2 sm:p-3">
                            <span className="font-medium">{s.phone || s.name || "Anonymous"}</span>
                            {!s.phone && !s.name && (
                              <span className="text-slate-500 text-xs block truncate max-w-[120px]">
                                {s.sessionId.slice(0, 12)}...
                              </span>
                            )}
                          </td>
                          <td className="p-2 sm:p-3 text-slate-400">{getStepLabel(s.lastStep)}</td>
                          <td className="p-2 sm:p-3 text-slate-400">{formatTime(s.totalTimeMs)}</td>
                          <td className="p-2 sm:p-3">
                            {s.completed ? (
                              <span className="text-green-400">Yes</span>
                            ) : (
                              <span className="text-amber-400">No</span>
                            )}
                          </td>
                          <td className="p-2 sm:p-3">
                            <button
                              onClick={() => {
                                const next = selectedSession?.sessionId === s.sessionId ? null : s;
                                setSelectedSession(next);
                                if (next) logAdminAction("view_session", { sessionId: s.sessionId });
                              }}
                              className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                            >
                              {selectedSession?.sessionId === s.sessionId ? "Hide" : "Details"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {analyticsTotal > 0 && (
                  <div className="border-t border-slate-700 px-3">
                    <PaginationBar
                      page={analyticsPage}
                      totalPages={analyticsTotalPages}
                      total={analyticsTotal}
                      limit={analyticsLimit}
                      onPageChange={(p) => {
                        setAnalyticsPage(p);
                        setLoadingAnalytics(true);
                        fetch(`${API._q}?page=${p}&limit=${analyticsLimit}`, { headers: adminHeaders() })
                          .then((r) => r.json())
                          .then((d) => {
                            if (!d.error) {
                              setAnalytics(d.sessions || []);
                              setAnalyticsTotal(d.total ?? 0);
                              setAnalyticsTotalPages(d.totalPages ?? 0);
                            }
                          })
                          .finally(() => setLoadingAnalytics(false));
                      }}
                      onLimitChange={(l) => {
                        setAnalyticsLimit(l);
                        setAnalyticsPage(1);
                        setLoadingAnalytics(true);
                        fetch(`${API._q}?page=1&limit=${l}`, { headers: adminHeaders() })
                          .then((r) => r.json())
                          .then((d) => {
                            if (!d.error) {
                              setAnalytics(d.sessions || []);
                              setAnalyticsTotal(d.total ?? 0);
                              setAnalyticsTotalPages(d.totalPages ?? 0);
                            }
                          })
                          .finally(() => setLoadingAnalytics(false));
                      }}
                      limits={PAGE_SIZES}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {selectedSession && (
            <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h3 className="font-semibold mb-3">
                Session: {selectedSession.phone || selectedSession.name || selectedSession.sessionId.slice(0, 16)}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
                {selectedSession.events.slice(0, 20).map((e, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center text-slate-400">
                    <span className="text-slate-300">{e.page}</span>
                    <span>{e.action}</span>
                    {e.step != null && <span>step {e.step}</span>}
                    {e.timeSpentMs != null && (
                      <span className="text-slate-500">{formatTime(e.timeSpentMs)}</span>
                    )}
                    <span className="text-slate-600 text-xs">{new Date(e.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold">My Admin Activity</h2>
            <button
              onClick={() => {
                setActionsPage(1);
                fetchAdminActions();
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Refresh
            </button>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-x-auto">
            {loadingActions ? (
              <div className="p-8 text-center text-slate-500">Loading…</div>
            ) : (
              <>
                <table className="w-full text-sm min-w-[300px]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Action</th>
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Details</th>
                      <th className="text-left p-2 sm:p-3 text-slate-400 whitespace-nowrap">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminActions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-slate-500 text-center">
                          No admin actions recorded yet
                        </td>
                      </tr>
                    ) : (
                      adminActions.map((a, i) => (
                        <tr key={i} className="border-b border-slate-700/50">
                          <td className="p-2 sm:p-3 text-slate-300">{a.action.replace(/_/g, " ")}</td>
                          <td className="p-2 sm:p-3 text-slate-500 text-xs">
                            {a.meta && Object.keys(a.meta).length > 0 ? JSON.stringify(a.meta) : "—"}
                          </td>
                          <td className="p-2 sm:p-3 text-slate-500 whitespace-nowrap">
                            {new Date(a.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {actionsTotal > 0 && (
                  <div className="border-t border-slate-700 px-3">
                    <PaginationBar
                      page={actionsPage}
                      totalPages={actionsTotalPages}
                      total={actionsTotal}
                      limit={actionsLimit}
                      onPageChange={(p) => {
                        setActionsPage(p);
                        setLoadingActions(true);
                        fetch(`${API._n}?actions=1&page=${p}&limit=${actionsLimit}`, { headers: adminHeaders() })
                          .then((r) => r.json())
                          .then((d) => {
                            if (!d.error) {
                              setAdminActions(d.actions || []);
                              setActionsTotal(d.total ?? 0);
                              setActionsTotalPages(d.totalPages ?? 0);
                            }
                          })
                          .finally(() => setLoadingActions(false));
                      }}
                      onLimitChange={(l) => {
                        setActionsLimit(l);
                        setActionsPage(1);
                        setLoadingActions(true);
                        fetch(`${API._n}?actions=1&page=1&limit=${l}`, { headers: adminHeaders() })
                          .then((r) => r.json())
                          .then((d) => {
                            if (!d.error) {
                              setAdminActions(d.actions || []);
                              setActionsTotal(d.total ?? 0);
                              setActionsTotalPages(d.totalPages ?? 0);
                            }
                          })
                          .finally(() => setLoadingActions(false));
                      }}
                      limits={PAGE_SIZES}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
